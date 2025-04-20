import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount
} from '@solana/spl-token';
// import * as bs58 from 'bs58'; // Old import
import  decode  from 'bs58'; // Import decode directly

// Utility function to request airdrop with error handling
async function requestAirdrop(connection: Connection, publicKey: PublicKey, amount: number): Promise<string> {
  try {
    const signature = await connection.requestAirdrop(publicKey, amount * anchor.web3.LAMPORTS_PER_SOL);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    console.log(`Airdrop of ${amount} SOL to ${publicKey.toBase58()} successful: ${signature}`);
    return signature;
  } catch (error) {
    if (error.message.includes('429')) {
      throw new Error('Airdrop limit reached. Try again later or use a pre-funded wallet.');
    }
    throw new Error(`Airdrop failed: ${error.message}`);
  }
}

async function setupTokens() {
  // Connect to local validator
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

  // --- Load payer keypair from base58 secret key string ---
  // Replace this with your actual base58 encoded secret key string
  const secretKeyString = "";

  let payer: Keypair;
  try {
    // const secretKeyBytes = bs58.decode(secretKeyString); // Old usage
    const secretKeyBytes = decode.decode(secretKeyString); // Use the imported decode function directly
    payer = Keypair.fromSecretKey(secretKeyBytes);
    console.log(`Using existing payer account: ${payer.publicKey.toBase58()}`);
  } catch (err) {
      console.error("Failed to decode secret key string or create keypair:", err);
      console.error("Please ensure the secret key string is a valid base58 encoding.");
      return; // Exit if keypair cannot be loaded
  }
  // --- End loading payer keypair ---


  // Fund the payer with an airdrop
  try {
    console.log('Requesting airdrop for payer...');
    await requestAirdrop(connection, payer.publicKey, 5);
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Payer Balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.error('Airdrop error:', err.message);
    return;
  }

  // Create an Anchor provider
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(payer),
    { commitment: 'confirmed' }
  );
  anchor.setProvider(provider);

  try {
    // Create token mint
    console.log('Creating token mint...');
    const mint = await createMint(
      connection,
      payer, // Payer signs and pays for the transaction
      payer.publicKey, // Mint authority
      null, // Freeze authority
      9 // Decimals
    );
    console.log('Mint Address:', mint.toBase58());

    // Derive program authority PDA
    const programId = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
    const [authorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('authority')],
      programId
    );
    console.log('Authority PDA:', authorityPda.toBase58());

    // Create an associated token account for the payer
    console.log('Creating payer token account...');
    const payerTokenAccount = await getAssociatedTokenAddress(
      mint,
      payer.publicKey
    );
    
    // Create the associated token account if it doesn't exist
    await createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    console.log('Payer Token Account:', payerTokenAccount.toBase58());

    // Mint initial tokens to payer's token account
    console.log('Minting tokens...');
    await mintTo(
      connection,
      payer,
      mint,
      payerTokenAccount,
      payer.publicKey,
      1000000 * 10 ** 9 // 1M tokens
    );
    console.log('Minted 1M tokens to payer token account');

    console.log('Setup complete! Use these addresses in your frontend:');
    console.log('Mint Address:', mint.toBase58());
    console.log('Payer Token Account:', payerTokenAccount.toBase58());
    console.log('Authority PDA (for your program):', authorityPda.toBase58());
  } catch (err) {
    console.error('Error during token setup:', err.message);
    console.error('Full error:', err);
  }
}

setupTokens().catch((err) => {
  console.error('Setup failed:', err);
});