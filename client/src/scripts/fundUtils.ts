// Example fundUtils.ts (or add this function to your component file)

import { PublicKey, SystemProgram, Transaction, Connection } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Wallet } from '@solana/wallet-adapter-react'; // Use Wallet type from wallet adapter
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getMint // Needed to convert human-readable amount to base units
} from '@solana/spl-token';

// Assuming these constants are defined elsewhere and imported
// const PROGRAM_ID = new PublicKey('...'); // Your program ID
// const TOKEN_MINT = new PublicKey('...'); // Your token mint address
// import idl from '../idl/profile.json'; // Path to your updated IDL

// Define interface for parameters for clarity
interface FundRewardPoolParams {
    amount: number; // Amount in human-readable units (e.g., 100 tokens)
    wallet: Wallet; // The signer (e.g., admin wallet holding tokens)
    connection: Connection;
    programId: PublicKey;
    tokenMintAddress: PublicKey;
    idl: any; // Your program's IDL (parsed JSON)
}

/**
 * Sends a transaction to fund the program's reward pool token account.
 * This function checks and creates the program's ATA and the signer's source ATA if they don't exist.
 * The connected wallet must hold the reward tokens in its associated token account.
 */
export const fundProgramRewardPool = async ({
    amount,
    wallet,
    connection,
    programId,
    tokenMintAddress,
    idl,
}: FundRewardPoolParams) => {
    if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
    }

    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
    );
    const program = new Program(idl, provider);

    try {
        // Derive the program's authority PDA
        const [authorityPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('authority')],
            programId
        );
        console.log("Authority PDA:", authorityPda.toBase58());


        // --- Check/Create Program's Reward Pool ATA ---

        // 1. Derive the address for the program's token account (ATA for Authority PDA)
        const programTokenAccountPubkey = await getAssociatedTokenAddress(
            tokenMintAddress,
            authorityPda,
            true // allowOwnerOffCurve must be true for PDAs
        );
        console.log("Program's Token Account (ATA):", programTokenAccountPubkey.toBase58());

        // 2. Check if this ATA exists
        const programTokenAccountInfo = await connection.getAccountInfo(programTokenAccountPubkey);
        let transaction = new Transaction(); // Start building the transaction

        if (programTokenAccountInfo === null) {
             // If the ATA does not exist, add the instruction to create it
             console.log(`Program token account does not exist. Adding create ATA instruction: ${programTokenAccountPubkey.toBase58()}`);
             transaction.add(
                 createAssociatedTokenAccountInstruction(
                     wallet.publicKey, // Payer for the account creation
                     programTokenAccountPubkey, // The ATA address to create
                     authorityPda, // The owner of the new ATA (the authority PDA)
                     tokenMintAddress, // The mint of the new ATA
                     TOKEN_PROGRAM_ID
                 )
             );
         } else {
              console.log(`Program token account already exists: ${programTokenAccountPubkey.toBase58()}`);
         }

        // --- End Check/Create Program's ATA ---


        // --- Check/Create Signer's Source ATA ---
        // 1. Derive the source token account address (ATA for the connected wallet/signer)
        const sourceTokenAccountPubkey = await getAssociatedTokenAddress(
            tokenMintAddress,
            wallet.publicKey // The signer's public key
        );
         console.log("Source Token Account (Signer's ATA):", sourceTokenAccountPubkey.toBase58());

        // 2. Check if this ATA exists
        const sourceTokenAccountInfo = await connection.getAccountInfo(sourceTokenAccountPubkey);

        if (sourceTokenAccountInfo === null) {
             console.warn("Signer's source token account (ATA) does not exist. Adding create instruction.");
             // Add the instruction to create the signer's ATA
             transaction.add(
                 createAssociatedTokenAccountInstruction(
                     wallet.publicKey, // Payer
                     sourceTokenAccountPubkey,
                     wallet.publicKey, // Owner
                     tokenMintAddress,
                     TOKEN_PROGRAM_ID
                 )
             );
        } else {
             console.log(`Signer's source token account (ATA) already exists: ${sourceTokenAccountPubkey.toBase58()}`);
        }
        // --- End Check/Create Signer's ATA ---


         // Fetch the mint account to get decimals for amount conversion
        const mintAccount = await getMint(connection, tokenMintAddress);
        // Convert the human-readable amount to base units
        const amountInBaseUnits = amount * Math.pow(10, mintAccount.decimals);


        console.log(`Attempting to fund reward pool with ${amount} tokens (${amountInBaseUnits} base units)...`);


        // Add the funding instruction to the transaction
        // This instruction comes *after* any necessary ATA creation instructions
         transaction.add(
             await program.methods
                .fundRewardPool(new anchor.BN(amountInBaseUnits)) // Pass amount as BN (u64)
                .accounts({
                    programTokenAccount: programTokenAccountPubkey, // Program's ATA (Destination)
                    tokenMint: tokenMintAddress, // Mint account
                    sourceTokenAccount: sourceTokenAccountPubkey, // Signer's ATA (Source)
                    sourceAuthority: wallet.publicKey, // Signer of the transaction and source ATA owner
                    authority: authorityPda, // Program's Authority PDA (Owner of Program's ATA)
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId, // Needed by create ATA instructions
                })
                .instruction() // Get the instruction object
         );


        // --- Sign and Send Transaction ---
        // The provider.wallet signs automatically (as source_authority and payer for ATA creation)
        console.log('Sending funding transaction...');
        const tx = await provider.sendAndConfirm(transaction); // Send the transaction

        console.log(`Reward pool funded successfully! Transaction: ${tx}`);
        return tx; // Return the transaction signature

    } catch (err) {
         console.error('Error funding reward pool:', err);
         // Provide more detailed error feedback
         if (err instanceof anchor.AnchorError) {
              console.error('Anchor Error Details:', err.error);
              throw new Error(`Funding failed: ${err.error.errorMessage} (Code: ${err.error.errorCode.code})`);
         } else if (err instanceof anchor.web3.SendTransactionError) {
             console.error('Send Transaction Error:', err);
             // Attempt to fetch logs for more details if simulation failed etc.
              // Note: Fetching logs for simulation errors in sendAndConfirm is tricky.
              // The logs are usually directly in err.logs for simulation failures.
              if (err.logs) {
                  console.error('Simulation Logs:', err.logs);
                  throw new Error(`Funding simulation failed: ${err.message}. Logs: ${err.logs.join(', ')}`);
              } else {
                  throw new Error(`Funding failed: ${err.message}. Check blockchain explorer with transaction ID if available.`);
              }
         }
        else {
            throw new Error(`Funding failed: ${err.message}`);
         }
    }
};

// --- Example Usage in a React Component remains the same ---