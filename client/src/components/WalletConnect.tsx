import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Utility function to request airdrop
async function requestAirdrop(
  connection: Connection,
  publicKey: PublicKey,
  amount: number = 1
): Promise<string> {
  try {
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );

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
      throw new Error(
        'Airdrop limit reached. Try again later or use an alternative faucet: https://faucet.solana.com'
      );
    }
    throw new Error(`Airdrop failed: ${error.message}`);
  }
}

const WalletConnect: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<string>('');

  const airdrop = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet');
      return;
    }

    try {
      const signature = await requestAirdrop(connection, publicKey, 1);
      setStatus(`Airdrop successful! Transaction: ${signature}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      {publicKey ? (
        <p>Connected Wallet: {publicKey.toBase58()}</p>
      ) : (
        <p>Please connect your wallet</p>
      )}

      <div>
        <button onClick={airdrop}>AirDrop</button>
      </div>

      {status && (
        <p className={status.includes('Error') ? 'error' : 'success'}>{status}</p>
      )}
    </div>
  );
};

export default WalletConnect;