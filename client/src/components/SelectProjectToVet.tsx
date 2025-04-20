import React, { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/profile.json'; // Adjust path to your IDL

const SelectProjectToVet: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const [projectOwner, setProjectOwner] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateInputs = (): boolean => {
    if (!publicKey || !anchorWallet) {
      setStatus('Please connect your wallet');
      return false;
    }

    if (!projectOwner || !projectTitle) {
      setStatus('Please provide project owner and title');
      return false;
    }

    try {
      new PublicKey(projectOwner);
    } catch (err) {
      setStatus('Invalid project owner public key format');
      return false;
    }

    if (projectTitle.trim().length === 0) {
      setStatus('Project title cannot be empty');
      return false;
    }

    return true;
  };

  const selectProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

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

      const ownerPubkey = new PublicKey(projectOwner);
      const [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('project'), ownerPubkey.toBuffer(), Buffer.from(projectTitle)],
        programId
      );
      console.log('Project PDA:', projectPda.toBase58());

      const tx = await program.methods
        .selectProjectToVet()
        .accounts({
          project: projectPda,
          vetter: publicKey,
        })
        .rpc({ commitment: 'confirmed' });

      console.log('Transaction confirmed:', tx);
      setStatus(`Project selected for vetting! Transaction: ${tx}`);
    } catch (err) {
      console.error('Error selecting project:', err);
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
    <div className="select-project">
      <h2>Select Project to Vet</h2>
      <form onSubmit={selectProject}>
        <div className="form-group">
          <label>Project Owner</label>
          <input
            type="text"
            value={projectOwner}
            onChange={(e) => setProjectOwner(e.target.value)}
            placeholder="Project Owner Public Key"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Project Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Project Title"
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !connected}>
          {isLoading ? 'Selecting...' : 'Select Project'}
        </button>
      </form>
      {status && (
        <p className={status.includes('Error') ? 'error' : 'success'}>{status}</p>
      )}
    </div>
  );
};

export default SelectProjectToVet;