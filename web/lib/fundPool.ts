import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getMint
} from '@solana/spl-token';

export const fundProgramRewardPool = async (params) => {
    const {
        amount,
        wallet,
        connection,
        programId,
        tokenMintAddress,
        idl,
    } = params;

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

        const programTokenAccountPubkey = await getAssociatedTokenAddress(
            tokenMintAddress,
            authorityPda,
            true
        );
        console.log("Program's Token Account (ATA):", programTokenAccountPubkey.toBase58());

    
        const programTokenAccountInfo = await connection.getAccountInfo(programTokenAccountPubkey);
        let transaction = new Transaction();

        if (programTokenAccountInfo === null) {
            console.log(`Program token account does not exist. Adding create ATA instruction: ${programTokenAccountPubkey.toBase58()}`);
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    programTokenAccountPubkey,
                    authorityPda,
                    tokenMintAddress,
                    TOKEN_PROGRAM_ID
                )
            );
        } else {
            console.log(`Program token account already exists: ${programTokenAccountPubkey.toBase58()}`);
        }

        // --- Check/Create Signer's Source ATA ---
        const sourceTokenAccountPubkey = await getAssociatedTokenAddress(
            tokenMintAddress,
            wallet.publicKey
        );
        console.log("Source Token Account (Signer's ATA):", sourceTokenAccountPubkey.toBase58());

        // Check if signer's ATA exists
        const sourceTokenAccountInfo = await connection.getAccountInfo(sourceTokenAccountPubkey);

        if (sourceTokenAccountInfo === null) {
            console.warn("Signer's source token account (ATA) does not exist. Adding create instruction.");
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    sourceTokenAccountPubkey,
                    wallet.publicKey,
                    tokenMintAddress,
                    TOKEN_PROGRAM_ID
                )
            );
        } else {
            console.log(`Signer's source token account (ATA) already exists: ${sourceTokenAccountPubkey.toBase58()}`);
        }

        const mintAccount = await getMint(connection, tokenMintAddress);
        const amountInBaseUnits = amount * Math.pow(10, mintAccount.decimals);

        console.log(`Attempting to fund reward pool with ${amount} tokens (${amountInBaseUnits} base units)...`);

        // Add the funding instruction to the transaction
        transaction.add(
            await program.methods
                .fundRewardPool(new anchor.BN(amountInBaseUnits))
                .accounts({
                    programTokenAccount: programTokenAccountPubkey,
                    tokenMint: tokenMintAddress,
                    sourceTokenAccount: sourceTokenAccountPubkey,
                    sourceAuthority: wallet.publicKey,
                    authority: authorityPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .instruction()
        );

        console.log('Sending funding transaction...');
        const tx = await provider.sendAndConfirm(transaction);

        console.log(`Reward pool funded successfully! Transaction: ${tx}`);
        return tx;

    } catch (err) {
        console.error('Error funding reward pool:', err);
        
        if (err instanceof anchor.AnchorError) {
            console.error('Anchor Error Details:', err.error);
            throw new Error(`Funding failed: ${err.error.errorMessage} (Code: ${err.error.errorCode.code})`);
        } else if (err instanceof anchor.web3.SendTransactionError) {
            console.error('Send Transaction Error:', err);
            
            if (err.logs) {
                console.error('Simulation Logs:', err.logs);
                throw new Error(`Funding simulation failed: ${err.message}. Logs: ${err.logs.join(', ')}`);
            } else {
                throw new Error(`Funding failed: ${err.message}. Check blockchain explorer with transaction ID if available.`);
            }
        } else {
            throw new Error(`Funding failed: ${err.message}`);
        }
    }
};