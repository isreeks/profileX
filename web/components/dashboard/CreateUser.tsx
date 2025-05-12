import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
// Your Context API
import { PublicKey } from '@solana/web3.js';
import { useContract } from '@/contexts/ContractContext';

const CreateUserUI = () => {
  const { publicKey, connected } = useWallet();
  const { createUser } = useContract(); // Assuming createUser is exposed via context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txSignature, setTxSignature] = useState(null);

  const handleCreateUser = useCallback(async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet.' as any);
      return;
    }

    setLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const tx = await createUser();
      setTxSignature(tx);
      console.log('Transaction successful:', tx);
    } catch (err) {
      setError(err.message || 'Failed to create user.');
      console.error('Transaction error:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, createUser]);

  return (
    <div className=' fixed w-screen h-screen z-50 flex justify-center items-center bg-white/80'>
    <div className="max-w-md mx-auto absolute  p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create User Profile</h2>

      {/* Wallet Connection Status */}
      {!connected ? (
        <p className="text-red-500 text-center">Please connect your wallet to continue.</p>
      ) : (
        <p className="text-green-500 text-center">Wallet connected: {publicKey.toBase58()}</p>
      )}

      {/* Create User Button */}
      <button
        onClick={handleCreateUser}
        disabled={!connected || loading}
        className={`w-full py-2 px-4 mt-4 rounded-md text-white font-semibold ${
          !connected || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-red-500 text-center">Error: {error}</p>
      )}

      {/* Transaction Signature */}
      {txSignature && (
        <div className="mt-4 text-center">
          <p className="text-green-500">User created successfully!</p>
          <p className="text-sm">
            Transaction Signature:{' '}
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
            </a>
          </p>
        </div>
      )}
    </div>
    </div>
  );
};

export default CreateUserUI;