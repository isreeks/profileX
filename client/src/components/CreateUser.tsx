import React, { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import idl from '../idl/profile.json'; // Adjust path to your IDL

const CreateUser: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createUser = async () => {
    if (!publicKey || !anchorWallet) {
      setStatus('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setStatus('Processing...');

    try {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        { commitment: 'confirmed' }
      );
      console.log('Provider initialized for wallet:', publicKey.toBase58());

      const programId = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
      console.log('Program ID:', programId.toBase58());

      const program = new Program(idl, provider);
      console.log('Program initialized');

      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), publicKey.toBuffer()],
        programId
      );
      console.log('User PDA:', userPda.toBase58());

      const tx = await program.methods
        .createUser()
        .accounts({
          user: userPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: 'confirmed' });

      console.log('Transaction confirmed:', tx);
      setStatus(`User created successfully! Transaction: ${tx}`);
    } catch (err) {
      console.error('Error creating user:', err);
      if (err instanceof anchor.AnchorError) {
        setStatus(`Error: ${err.error.errorMessage} (Code: ${err.error.errorCode.code})`);
      } else if (err instanceof anchor.web3.SendTransactionError) {
        setStatus(`Transaction failed: ${err.message}. Check logs for details.`);
        console.error('Transaction Logs:', err.logs);
      } else {
        setStatus(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-user">
      <h2>Create User</h2>
      <button onClick={createUser} disabled={isLoading || !connected}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
      {status && (
        <p className={status.includes('Error') ? 'error' : 'success'}>{status}</p>
      )}
    </div>
  );
};

export default CreateUser;