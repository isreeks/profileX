import React, { useState, useEffect } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/profile.json'; // Adjust path to your IDL

interface UserAccount {
  authority: PublicKey;
  balance: anchor.BN;
  rank: number;
  skills: string[];
  portfolio: string[];
  rewardsEarned: anchor.BN;
  bump: number;
}

interface ProjectAccount {
  title: string;
  owner: PublicKey;
  skills: string[];
  isValidated: boolean;
  scores: { vetter: PublicKey; score: number }[];
  vetters: PublicKey[];
  finalScore: number;
  bump: number;
}

const ListAccounts: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [projects, setProjects] = useState<ProjectAccount[]>([]);
  const [status, setStatus] = useState<string>('');

  const fetchAccounts = async () => {
    if (!publicKey || !signTransaction) {
      setStatus('Please connect your wallet to fetch accounts');
      return;
    }

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction }, {});
      const programId = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
      const program = new Program(idl, provider);

      // Fetch all User accounts
      const userAccounts = await program.account.user.all();

      console.log(userAccounts);
      

      setUsers(
        userAccounts.map((account) => ({
          authority: account.account.authority,
          balance: account.account.balance,
          rank: account.account.rank,
          skills: account.account.skills,
          portfolio: account.account.portfolio,
          rewardsEarned: account.account.rewardsEarned,
          bump: account.account.bump,
        }))
      );

      // Fetch all Project accounts
      const projectAccounts = await program.account.project.all();

      console.log(projectAccounts);

      setProjects(
        projectAccounts.map((account) => ({
          title: account.account.title,
          owner: account.account.owner,
          skills: account.account.skills,
          isValidated: account.account.isValidated,
          scores: account.account.scores,
          vetters: account.account.vetters,
          finalScore: account.account.finalScore,
          bump: account.account.bump,
        }))
      );

      setStatus('Accounts fetched successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Fetch accounts on mount
  useEffect(() => {
    if (publicKey && signTransaction) {
      fetchAccounts();
    }
  }, [publicKey, signTransaction]);

  return (
    <div>
      <h2>List Accounts</h2>
      <button onClick={fetchAccounts}>Refresh Accounts</button>
      {status && (
        <p className={status.includes('Error') ? 'error' : 'success'}>{status}</p>
      )}

      <h3>Users</h3>
      {users.length > 0 ? (
        <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px' }}>Authority</th>
              <th style={{ padding: '8px' }}>Balance</th>
              <th style={{ padding: '8px' }}>Rank</th>
              <th style={{ padding: '8px' }}>Skills</th>
              <th style={{ padding: '8px' }}>Portfolio</th>
              <th style={{ padding: '8px' }}>Rewards Earned</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>{user.authority.toBase58()}</td>
                <td style={{ padding: '8px' }}>{user.balance.toNumber()}</td>
                <td style={{ padding: '8px' }}>{user.rank}</td>
                <td style={{ padding: '8px' }}>{user.skills.join(', ')}</td>
                <td style={{ padding: '8px' }}>{user.portfolio.join(', ')}</td>
                <td style={{ padding: '8px' }}>{user.rewardsEarned.toNumber()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found</p>
      )}

      <h3>Projects</h3>
      {projects.length > 0 ? (
        <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px' }}>Title</th>
              <th style={{ padding: '8px' }}>Owner</th>
              <th style={{ padding: '8px' }}>Skills</th>
              <th style={{ padding: '8px' }}>Validated</th>
              <th style={{ padding: '8px' }}>Scores</th>
              <th style={{ padding: '8px' }}>Final Score</th>
              <th style={{ padding: '8px' }}>Vetters</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>{project.title}</td>
                <td style={{ padding: '8px' }}>{project.owner.toBase58()}</td>
                <td style={{ padding: '8px' }}>{project.skills.join(', ')}</td>
                <td style={{ padding: '8px' }}>{project.isValidated ? 'Yes' : 'No'}</td>
                <td style={{ padding: '8px' }}>
                  {project.scores.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {project.scores.map((score, idx) => (
                        <li key={idx}>
                          Vetter: {score.vetter.toBase58().slice(0, 8)}... - Score: {score.score}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No scores'
                  )}
                </td>
                <td style={{ padding: '8px' }}>{project.finalScore}</td>
                <td style={{ padding: '8px' }}>
                  {project.vetters.map((vetter) => vetter.toBase58()).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No projects found</p>
      )}
    </div>
  );
};

export default ListAccounts;