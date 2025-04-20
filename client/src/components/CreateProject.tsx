import React, { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import idl from '../idl/profile.json'; // Adjust path to your IDL

const CreateProject: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [projectLink, setProjectLink] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateInputs = (): boolean => {
    if (!publicKey || !anchorWallet) {
      setStatus('Please connect your wallet');
      return false;
    }
    if (!projectTitle) {
      setStatus('Please provide a project title');
      return false;
    }
    if (projectTitle.trim().length === 0) {
      setStatus('Project title cannot be empty');
      return false;
    }
    if (!skills) {
      setStatus('Please provide at least one skill');
      return false;
    }
    if (!projectLink) {
      setStatus('Please provide a project link');
      return false;
    }
    if (!/^https?:\/\/.+/.test(projectLink)) {
      setStatus('Please provide a valid project link (e.g., https://github.com/...)');
      return false;
    }
    return true;
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    setStatus('Creating project...');

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

      const [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('project'), publicKey.toBuffer(), Buffer.from(projectTitle)],
        programId
      );
      console.log('Project PDA:', projectPda.toBase58());

      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      console.log('Skills:', skillsArray);
      console.log('Project Link:', projectLink);

      const tx = await program.methods
        .submitProject(projectTitle, skillsArray, projectLink)
        .accounts({
          project: projectPda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: 'confirmed' });

      console.log('Project created:', tx);
      setStatus(`Project created successfully! Transaction: ${tx}`);
    } catch (err) {
      console.error('Error creating project:', err);
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
    <div className="create-project">
      <h2>Create Project</h2>
      <form onSubmit={createProject}>
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
        <div className="form-group">
          <label>Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., Rust, Solana, React"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Project Link</label>
          <input
            type="text"
            value={projectLink}
            onChange={(e) => setProjectLink(e.target.value)}
            placeholder="e.g., https://github.com/..."
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !connected}>
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
      {status && (
        <p className={status.includes('Error') ? 'error' : 'success'}>{status}</p>
      )}
    </div>
  );
};

export default CreateProject;