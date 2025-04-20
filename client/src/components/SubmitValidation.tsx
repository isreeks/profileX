import React, { useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount
} from '@solana/spl-token';
import idl from '../idl/profile.json';

// Program ID is constant
const PROGRAM_ID = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');

// Create PDA for penalty account authority
const PENALTY_ACCOUNT_AUTHORITY = PublicKey.findProgramAddressSync(
    [Buffer.from('penalty_authority')],
    PROGRAM_ID
)[0];

const SubmitValidation: React.FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [projectOwner, setProjectOwner] = useState<string>('');
    const [projectTitle, setProjectTitle] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [tokenMint, setTokenMint] = useState<string>('6SxqSUYPyqSd1qDYm7Y4BHci6T86BKrbugbE2WwT9Gsq');
    const [status, setStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [detailedLog, setDetailedLog] = useState<string[]>([]);

    const addLog = (message) => {
        setDetailedLog(prev => [...prev, message]);
        console.log(message);
    };

    const validateInputs = (): boolean => {
        if (!wallet.publicKey) {
            setStatus('Please connect your wallet');
            return false;
        }

        if (!projectOwner || !projectTitle) {
            setStatus('Please provide project owner and title');
            return false;
        }

        if (score < 0 || score > 100) {
            setStatus('Score must be between 0 and 100');
            return false;
        }

        try {
            new PublicKey(projectOwner);
            new PublicKey(tokenMint);
        } catch (err) {
            setStatus('Invalid public key format');
            return false;
        }

        return true;
    };

    const submitValidation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateInputs()) return;

        setIsLoading(true);
        setStatus('Processing...');
        setDetailedLog([]);

        try {
            if (!wallet.signTransaction) {
                throw new Error("Wallet doesn't support transaction signing");
            }

            // Create provider manually to ensure we're using the correct connection and wallet
            const provider = new anchor.AnchorProvider(
                connection,
                wallet,
                { commitment: 'confirmed' }
            );
            
            addLog(`Using wallet: ${wallet.publicKey.toBase58()}`);
            addLog(`RPC endpoint: ${connection.rpcEndpoint}`);

            const program = new Program(idl, provider);
            const tokenMintPubkey = new PublicKey(tokenMint);

            // Derive Project PDA
            const ownerPubkey = new PublicKey(projectOwner);
            const [projectPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('project'), ownerPubkey.toBuffer(), Buffer.from(projectTitle)],
                PROGRAM_ID
            );
            addLog(`Project PDA: ${projectPda.toBase58()}`);

            // Fetch project account
            let projectAccount;
            try {
                projectAccount = await program.account.project.fetch(projectPda);
                addLog(`Project fetched: ${projectTitle} by ${ownerPubkey.toBase58()}`);
            } catch (err) {
                throw new Error(`Project not found: ${err.message}`);
            }

            // Check project details
            const vetters = projectAccount.vetters.map(v => new PublicKey(v));
            addLog(`Project vetters (${vetters.length}): ${vetters.map(v => v.toBase58()).join(', ')}`);
            
            const scores = projectAccount.scores || [];
            addLog(`Existing scores (${scores.length}): ${scores.map(s => 
                `${new PublicKey(s.vetter).toBase58().slice(0, 8)}... - ${s.score}`
            ).join(', ')}`);

            // Check if current wallet is authorized vetter
            if (!vetters.some(v => v.equals(wallet.publicKey))) {
                throw new Error(`Your wallet (${wallet.publicKey.toBase58()}) is not an authorized vetter`);
            }

            // Check if already submitted score
            if (scores.some(s => new PublicKey(s.vetter).equals(wallet.publicKey))) {
                throw new Error('You have already submitted a score for this project');
            }

            // Fetch critical PDAs and accounts
            const [userPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('user'), ownerPubkey.toBuffer()],
                PROGRAM_ID
            );
            addLog(`Project owner User PDA: ${userPda.toBase58()}`);

            const [authorityPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('authority')],
                PROGRAM_ID
            );
            addLog(`Authority PDA: ${authorityPda.toBase58()}`);

            // --- IMPORTANT: Verify token mint first ---
            try {
                const mintInfo = await connection.getParsedAccountInfo(tokenMintPubkey);
                if (!mintInfo.value) {
                    throw new Error(`Token mint ${tokenMint} not found`);
                }
                
                const data = mintInfo.value.data;
                if (!data || typeof data !== 'object' || !('parsed' in data)) {
                    throw new Error(`${tokenMint} is not a valid token mint`);
                }
                
                addLog(`✓ Token mint verified: ${tokenMint}`);
            } catch (err) {
                throw new Error(`Invalid token mint (${tokenMint}): ${err.message}`);
            }

            // Initialize token accounts with verification
            const programTokenAccountPubkey = await getAssociatedTokenAddress(
                tokenMintPubkey,
                authorityPda,
                true
            );
            addLog(`Program token account: ${programTokenAccountPubkey.toBase58()}`);
            
            // Check if program token account has enough balance
            try {
                const programTokenAccount = await getAccount(connection, programTokenAccountPubkey);
                const balance = programTokenAccount.amount;
                addLog(`Program token account balance: ${balance}`);
                
                // Need at least 100 tokens (assuming 9 decimals = 100 * 10^9)
                if (balance < BigInt(100_000_000_000)) {
                    addLog(`⚠️ Program token account has insufficient balance: ${balance}`);
                }
            } catch (err) {
                addLog(`⚠️ Could not check program token account: ${err.message}`);
            }
            
            const userTokenAccountPubkey = await getAssociatedTokenAddress(
                tokenMintPubkey,
                ownerPubkey
            );
            addLog(`User token account: ${userTokenAccountPubkey.toBase58()}`);
            
            const penaltyTokenAccountPubkey = await getAssociatedTokenAddress(
                tokenMintPubkey,
                PENALTY_ACCOUNT_AUTHORITY,
                true
            );
            addLog(`Penalty token account: ${penaltyTokenAccountPubkey.toBase58()}`);

            // Create setup transaction for any token accounts that need to be created
            let setupTransaction = new Transaction();
            let needsSetup = false;
            
            // Check if token accounts exist and create them if needed
            const programAccountInfo = await connection.getAccountInfo(programTokenAccountPubkey);
            if (!programAccountInfo) {
                addLog(`Creating program token account...`);
                setupTransaction.add(
                    createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        programTokenAccountPubkey,
                        authorityPda,
                        tokenMintPubkey
                    )
                );
                needsSetup = true;
            }
            
            const userAccountInfo = await connection.getAccountInfo(userTokenAccountPubkey);
            if (!userAccountInfo) {
                addLog(`Creating user token account...`);
                setupTransaction.add(
                    createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        userTokenAccountPubkey,
                        ownerPubkey,
                        tokenMintPubkey
                    )
                );
                needsSetup = true;
            }
            
            const penaltyAccountInfo = await connection.getAccountInfo(penaltyTokenAccountPubkey);
            if (!penaltyAccountInfo) {
                addLog(`Creating penalty token account...`);
                setupTransaction.add(
                    createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        penaltyTokenAccountPubkey,
                        PENALTY_ACCOUNT_AUTHORITY,
                        tokenMintPubkey
                    )
                );
                needsSetup = true;
            }

            // --- Process vetters in exact project order ---
            const vetterAccountsInfo = [];
            for (let i = 0; i < vetters.length; i++) {
                const vetterPubkey = vetters[i];
                
                // Get User PDA
                const [vetterUserPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from('user'), vetterPubkey.toBuffer()],
                    PROGRAM_ID
                );
                
                // Get token account
                const vetterTokenAccountPubkey = await getAssociatedTokenAddress(
                    tokenMintPubkey,
                    vetterPubkey
                );
                
                vetterAccountsInfo.push({
                    index: i,
                    pubkey: vetterPubkey,
                    userPda: vetterUserPda,
                    tokenAccount: vetterTokenAccountPubkey
                });
                
                addLog(`Vetter ${i+1} (${vetterPubkey.toBase58().slice(0, 8)}...):`);
                addLog(`  - User PDA: ${vetterUserPda.toBase58()}`);
                addLog(`  - Token account: ${vetterTokenAccountPubkey.toBase58()}`);
                
                try {
                    const userAccount = await program.account.user.fetch(vetterUserPda);
                    addLog(`  - ✓ User account verified`);
                } catch (err) {
                    addLog(`  - ⚠️ User account not found: ${err.message}`);
                }
                
                // Check if vetter token account exists and create if needed
                const vetterTokenAccountInfo = await connection.getAccountInfo(vetterTokenAccountPubkey);
                if (!vetterTokenAccountInfo) {
                    addLog(`  - Creating token account...`);
                    setupTransaction.add(
                        createAssociatedTokenAccountInstruction(
                            wallet.publicKey,
                            vetterTokenAccountPubkey,
                            vetterPubkey,
                            tokenMintPubkey
                        )
                    );
                    needsSetup = true;
                }
            }

            // Send setup transaction if needed
            if (needsSetup && setupTransaction.instructions.length > 0) {
                addLog(`Sending setup transaction with ${setupTransaction.instructions.length} instructions...`);
                
                try {
                    // Get recent blockhash
                    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
                    setupTransaction.recentBlockhash = blockhash;
                    setupTransaction.feePayer = wallet.publicKey;
                    
                    // Sign and send transaction
                    const signedTx = await wallet.signTransaction(setupTransaction);
                    const setupTxId = await connection.sendRawTransaction(signedTx.serialize());
                    
                    // Confirm transaction
                    addLog(`Setup transaction sent: ${setupTxId}`);
                    const confirmation = await connection.confirmTransaction({
                        blockhash,
                        lastValidBlockHeight,
                        signature: setupTxId
                    });
                    
                    if (confirmation.value.err) {
                        addLog(`⚠️ Setup transaction error: ${JSON.stringify(confirmation.value.err)}`);
                    } else {
                        addLog(`✓ Setup transaction confirmed`);
                    }
                } catch (err) {
                    addLog(`⚠️ Setup transaction failed: ${err.message}`);
                    // Continue anyway - the validation transaction may work if accounts already exist
                }
            }

            // Build validation transaction
            addLog(`Building validation transaction...`);
            const validationTransaction = new Transaction();
            
            try {
                const instruction = await program.methods
                    .submitValidation(score)
                    .accounts({
                        project: projectPda,
                        vetter: wallet.publicKey,
                        user: userPda,
                        authority: authorityPda,
                        tokenMint: tokenMintPubkey,
                        tokenAccount: programTokenAccountPubkey,
                        userTokenAccount: userTokenAccountPubkey,
                        vetterAccount1: vetterAccountsInfo[0].userPda,
                        vetterTokenAccount1: vetterAccountsInfo[0].tokenAccount,
                        vetterAccount2: vetterAccountsInfo[1].userPda,
                        vetterTokenAccount2: vetterAccountsInfo[1].tokenAccount,
                        vetterAccount3: vetterAccountsInfo[2].userPda,
                        vetterTokenAccount3: vetterAccountsInfo[2].tokenAccount,
                        penaltyAccount: penaltyTokenAccountPubkey,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .instruction();
                
                addLog(`✓ Instruction built successfully`);
                validationTransaction.add(instruction);
            } catch (err) {
                throw new Error(`Error building instruction: ${err.message}`);
            }

            // --- FIX: Use standard Solana transaction sending instead of provider ---
            addLog(`Sending validation transaction...`);

            try {
                // Get a recent blockhash
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
                validationTransaction.recentBlockhash = blockhash;
                validationTransaction.feePayer = wallet.publicKey;
                
                // Sign the transaction
                const signedTx = await wallet.signTransaction(validationTransaction);
                
                // Send raw transaction
                const txId = await connection.sendRawTransaction(signedTx.serialize(), {
                    skipPreflight: true
                });
                
                addLog(`Transaction sent with ID: ${txId}`);
                
                // Confirm transaction
                const confirmation = await connection.confirmTransaction({
                    blockhash,
                    lastValidBlockHeight,
                    signature: txId
                });
                
                if (confirmation.value.err) {
                    throw new Error(`Transaction error: ${JSON.stringify(confirmation.value.err)}`);
                }
                
                addLog(`✓ Transaction confirmed: ${txId}`);
                setStatus(`Validation submitted successfully! Transaction ID: ${txId}`);
            } catch (err) {
                throw new Error(`Transaction failed: ${err.message}`);
            }

        } catch (err) {
            console.error('Error in submitValidation:', err);
            
            if (err.logs) {
                addLog(`Transaction logs:\n${err.logs.join('\n')}`);
            }
            
            setStatus(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="validation-form">
            <h2>Submit Validation</h2>
            <form onSubmit={submitValidation}>
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

                <div className="form-group">
                    <label>Score (0-100)</label>
                    <input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        placeholder="Score"
                        min="0"
                        max="100"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Token Mint Address</label>
                    <input
                        type="text"
                        value={tokenMint}
                        onChange={(e) => setTokenMint(e.target.value)}
                        placeholder="Token Mint Public Key"
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" disabled={isLoading || !wallet.connected}>
                    {isLoading ? 'Submitting...' : 'Submit Validation'}
                </button>
            </form>

            {status && (
                <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
                    {status}
                </div>
            )}
            
            {detailedLog.length > 0 && (
                <div className="detailed-log">
                    <h4>Detailed Log</h4>
                    <pre style={{maxHeight: '300px', overflow: 'auto', fontSize: '12px'}}>
                        {detailedLog.join('\n')}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default SubmitValidation;