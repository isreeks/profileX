import React, { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/profile.json';

const UpdateProfile: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [skills, setSkills] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signTransaction) {
      setStatus('Please connect your wallet');
      return;
    }

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction }, {});
      const programId = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
      const program = new Program(idl, programId, provider);

      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), publicKey.toBuffer()],
        programId
      );

      const skillsArray = skills.split(',').map(s => s.trim());
      await program.methods
        .updateUserProfile(skillsArray)
        .accounts({
          user: userPda,
          authority: publicKey,
        })
        .rpc();

      setStatus('Profile updated successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <form onSubmit={updateProfile}>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma-separated)"
        />
        <button type="submit">Update Skills</button>
      </form>
      {status && <p className={status.includes('Error') ? 'error' : 'success'}>{status}</p>}
    </div>
  );
};

export default UpdateProfile;