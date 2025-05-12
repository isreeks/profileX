import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';


async function setupSplToken() {
    // Connect to Solana devnet
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    // Load or create payer account (replace with your private key in base58)
    const privateKey = 'xxxx'; // Replace with your actual private key
    const payer = Keypair.fromSecretKey(bs58.decode(privateKey));
    console.log(`Using existing payer account: ${payer.publicKey.toBase58()}`);

  
    console.log('Requesting airdrop for payer...');
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 5 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    console.log(`Airdrop of 5 SOL to ${payer.publicKey.toBase58()} successful: ${airdropSignature}`);

    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer Balance: ${balance / LAMPORTS_PER_SOL} SOL`);


    console.log('Creating token mint...');
    const mint = await createMint(
        connection,
        payer,
        payer.publicKey, // Mint authority
        null,            // Freeze authority (null for no freeze authority)
        9                // Decimals
    );
    console.log(`Mint Address: ${mint.toBase58()}`);

    // Derive authority PDA (simplified example, adjust for your program)
    const [authorityPda] = await PublicKey.findProgramAddress(
        [Buffer.from('authority'), mint.toBuffer()],
        new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C') // Replace with your program ID
    );
    console.log(`Authority PDA: ${authorityPda.toBase58()}`);


    console.log('Creating payer token account...');
    const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    );
    console.log(`Payer Token Account: ${payerTokenAccount.address.toBase58()}`);

    // Mint tokens
    console.log('Minting tokens...');
    await mintTo(
        connection,
        payer,
        mint,
        payerTokenAccount.address,
        payer.publicKey,
        1_000_000 * 10 ** 9 // Mint 1M tokens (adjusted for decimals)
    );
    console.log('Minted 1M tokens to payer token account');

    // Output addresses for frontend
    console.log('Setup complete! Use these addresses in your frontend:');
    console.log(`Mint Address: ${mint.toBase58()}`);
    console.log(`Payer Token Account: ${payerTokenAccount.address.toBase58()}`);
    console.log(`Authority PDA (for your program): ${authorityPda.toBase58()}`);
}

setupSplToken().catch(console.error);