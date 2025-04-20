import React, { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import idl from '../idl/profile.json';

// Program constants
const PROGRAM_ID = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
const TOKEN_MINT = new PublicKey('CTwytqDTJboMB5s7mivEemNJdaDdjPZtLDfMyiQnLuom');

const TestSubmitValidation: React.FC = () => {
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [projectOwner, setProjectOwner] = useState('6tia5tGv9dYLs5Gij2TLuC1bLwSC7L3u94MDjqsekRVS');
    const [projectTitle, setProjectTitle] = useState('ProfileX');
    const [score, setScore] = useState(90);
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addLog = (msg: string) => {
        console.log(msg);
        setLogs(prev => [...prev, msg]);
    };

    const submitScore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey || !signTransaction) {
            alert('Please connect your wallet');
            return;
        }

        setIsLoading(true);
        setLogs([]);

        try {
            addLog(`Starting submission process with wallet ${publicKey.toBase58()}`);
            addLog(`Project: ${projectTitle} by ${projectOwner}`);
            addLog(`Score: ${score}`);
            
            // Create anchor provider
            const provider = new anchor.AnchorProvider(
                connection, 
                { publicKey, signTransaction }, 
                { commitment: 'confirmed' }
            );
            
            const program = new Program(idl, provider);
            const ownerPubkey = new PublicKey(projectOwner);

            // Derive Project PDA
            const [projectPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('project'), ownerPubkey.toBuffer(), Buffer.from(projectTitle)],
                PROGRAM_ID
            );
            addLog(`Project PDA: ${projectPDA.toBase58()}`);

            // Fetch project data
            const projectData = await program.account.project.fetch(projectPDA);
            const projectVetters = projectData.vetters.map(v => new PublicKey(v));
            const projectScores = projectData.scores || [];

            addLog(`Project vetters: ${projectVetters.map(v => v.toBase58()).join(', ')}`);
            addLog(`Existing scores: ${projectScores.length}`);
            projectScores.forEach((s, i) => {
                addLog(`Score ${i+1}: ${new PublicKey(s.vetter).toBase58()} - ${s.score}`);
            });

            // Verify current wallet is a vetter
            if (!projectVetters.some(v => v.equals(publicKey))) {
                throw new Error('Your wallet is not authorized as a vetter for this project');
            }

            // Verify not already scored
            if (projectScores.some(s => new PublicKey(s.vetter).equals(publicKey))) {
                throw new Error('You have already submitted a score for this project');
            }

            // Derive User PDA
            const [userPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('user'), ownerPubkey.toBuffer()],
                PROGRAM_ID
            );
            addLog(`User PDA: ${userPDA.toBase58()}`);

            // Derive Authority PDA
            const [authorityPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('authority')],
                PROGRAM_ID
            );
            addLog(`Authority PDA: ${authorityPDA.toBase58()}`);

            // Derive program token account
            const programTokenAccount = await getAssociatedTokenAddress(
                TOKEN_MINT,
                authorityPDA,
                true // allowOwnerOffCurve
            );
            addLog(`Program token account: ${programTokenAccount.toBase58()}`);

            // Derive user token account
            const userTokenAccount = await getAssociatedTokenAddress(
                TOKEN_MINT,
                ownerPubkey
            );
            addLog(`User token account: ${userTokenAccount.toBase58()}`);

            // Derive penalty token account
            const [penaltyAuthority] = PublicKey.findProgramAddressSync(
                [Buffer.from('penalty_authority')],
                PROGRAM_ID
            );
            const penaltyAccount = await getAssociatedTokenAddress(
                TOKEN_MINT,
                penaltyAuthority,
                true
            );
            addLog(`Penalty account: ${penaltyAccount.toBase58()}`);

            // Get vetter account data in SAME ORDER as project.vetters
            const vetterAccountsData = await Promise.all(projectVetters.map(async (vetterKey, index) => {
                // Get User PDA
                const [vetterUserPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from('user'), vetterKey.toBuffer()],
                    PROGRAM_ID
                );
                
                // Get token account
                const vetterTokenAccount = await getAssociatedTokenAddress(
                    TOKEN_MINT,
                    vetterKey
                );
                
                addLog(`Vetter ${index+1} (${vetterKey.toBase58().slice(0, 8)}...):`);
                addLog(`- User PDA: ${vetterUserPDA.toBase58()}`);
                addLog(`- Token account: ${vetterTokenAccount.toBase58()}`);
                
                return {
                    pubkey: vetterKey,
                    userPDA: vetterUserPDA,
                    tokenAccount: vetterTokenAccount
                };
            }));

            // Create missing token accounts in one setup transaction
            addLog("Creating setup transaction for any missing accounts...");
            const setupTx = new Transaction();
            let needsSetup = false;
            
            // Check program token account
            if (!(await connection.getAccountInfo(programTokenAccount))) {
                addLog("Adding program token account creation");
                setupTx.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        programTokenAccount,
                        authorityPDA,
                        TOKEN_MINT
                    )
                );
                needsSetup = true;
            }
            
            // Check user token account
            if (!(await connection.getAccountInfo(userTokenAccount))) {
                addLog("Adding user token account creation");
                setupTx.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        userTokenAccount,
                        ownerPubkey,
                        TOKEN_MINT
                    )
                );
                needsSetup = true;
            }
            
            // Check penalty account
            if (!(await connection.getAccountInfo(penaltyAccount))) {
                addLog("Adding penalty account creation");
                setupTx.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        penaltyAccount,
                        penaltyAuthority,
                        TOKEN_MINT
                    )
                );
                needsSetup = true;
            }
            
            // Check all vetter token accounts
            for (let i = 0; i < vetterAccountsData.length; i++) {
                const { pubkey, tokenAccount } = vetterAccountsData[i];
                if (!(await connection.getAccountInfo(tokenAccount))) {
                    addLog(`Adding token account creation for vetter ${i+1}`);
                    setupTx.add(
                        createAssociatedTokenAccountInstruction(
                            publicKey,
                            tokenAccount,
                            pubkey,
                            TOKEN_MINT
                        )
                    );
                    needsSetup = true;
                }
            }
            
            // Send setup transaction if needed
            if (needsSetup) {
                addLog("Sending setup transaction...");
                const { blockhash } = await connection.getLatestBlockhash();
                setupTx.recentBlockhash = blockhash;
                setupTx.feePayer = publicKey;
                
                try {
                    const signedTx = await signTransaction(setupTx);
                    const setupSig = await connection.sendRawTransaction(signedTx.serialize());
                    addLog(`Setup transaction sent: ${setupSig}`);
                    await connection.confirmTransaction(setupSig);
                    addLog("Setup transaction confirmed");
                } catch (err) {
                    addLog(`Setup error: ${err.message}`);
                    // Continue anyway, accounts might already exist
                }
            } else {
                addLog("No setup needed, all accounts exist");
            }

            // Create the validation transaction
            addLog("Building validation transaction...");
            const validationTx = new Transaction();
            
            validationTx.add(
                await program.methods
                    .submitValidation(score)
                    .accounts({
                        project: projectPDA,
                        vetter: publicKey,
                        user: userPDA,
                        authority: authorityPDA,
                        tokenMint: TOKEN_MINT,
                        tokenAccount: programTokenAccount,
                        userTokenAccount: userTokenAccount,
                        // CRITICAL: These must be in EXACT same order as project.vetters
                        vetterAccount1: vetterAccountsData[0].userPDA,
                        vetterTokenAccount1: vetterAccountsData[0].tokenAccount,
                        vetterAccount2: vetterAccountsData[1].userPDA,
                        vetterTokenAccount2: vetterAccountsData[1].tokenAccount,
                        vetterAccount3: vetterAccountsData[2].userPDA,
                        vetterTokenAccount3: vetterAccountsData[2].tokenAccount,
                        penaltyAccount: penaltyAccount,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .instruction()
            );
            
            // Send validation transaction 
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            validationTx.recentBlockhash = blockhash;
            validationTx.feePayer = publicKey;
            
            addLog("Signing and sending validation transaction...");
            const signedValidationTx = await signTransaction(validationTx);
            const signature = await connection.sendRawTransaction(signedValidationTx.serialize(), {
                skipPreflight: false, // Enable preflight to catch errors early
            });
            
            addLog(`Transaction sent with ID: ${signature}`);
            const result = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            
            if (result.value.err) {
                throw new Error(`Transaction error: ${JSON.stringify(result.value.err)}`);
            }
            
            addLog(`SUCCESS! Transaction confirmed: ${signature}`);
            addLog("Score successfully submitted and validated!");

        } catch (err) {
            console.error(err);
            addLog(`ERROR: ${err.message}`);
            
            if (err.logs) {
                addLog("Transaction logs:");
                err.logs.forEach(log => addLog(`> ${log}`));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="test-validation-container">
            <h2>Test Submit Validation</h2>
            <p>This component specifically targets the MissingVetterTokenAccount error.</p>
            
            <form onSubmit={submitScore}>
                <div className="form-group">
                    <label>Project Owner</label>
                    <input 
                        type="text"
                        value={projectOwner}
                        onChange={e => setProjectOwner(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Project Title</label>
                    <input 
                        type="text"
                        value={projectTitle}
                        onChange={e => setProjectTitle(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Score (0-100)</label>
                    <input 
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={e => setScore(parseInt(e.target.value))}
                        disabled={isLoading}
                    />
                </div>
                
                <button type="submit" disabled={isLoading || !publicKey}>
                    {isLoading ? 'Submitting...' : 'Submit Score'}
                </button>
            </form>
            
            <div className="logs">
                <h3>Execution Logs</h3>
                <pre>
                    {logs.length > 0 
                        ? logs.map((log, i) => <div key={i}>{log}</div>)
                        : 'No logs yet. Submit a score to start.'}
                </pre>
            </div>
            
            <style jsx>{`
                .test-validation-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                button {
                    background: #2563eb;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:disabled {
                    background: #93c5fd;
                    cursor: not-allowed;
                }
                .logs {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                }
                pre {
                    white-space: pre-wrap;
                    max-height: 300px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default TestSubmitValidation;