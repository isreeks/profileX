"use client"
import React, { createContext, useContext, useCallback } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    getMint
} from '@solana/spl-token';
import { fundProgramRewardPool } from '../lib/fundPool';
import idl from '../idl/profile.json';

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

interface ContractContextType {
    createUser: () => Promise<string>;
    updateProfile: (skills: string[]) => Promise<string>;
    createProject: (title: string, skills: string[], link: string) => Promise<string>;
    selectProjectToVet: (projectOwner: string, projectTitle: string) => Promise<string>;
    submitValidation: (projectOwner: string, projectTitle: string, score: number, tokenMint: string ) => Promise<string>;
    fetchAccounts: () => Promise<{ users: UserAccount[], projects: ProjectAccount[] }>;
    fundPool: (amount: number) => Promise<string>;
}

const ContractContext = createContext<ContractContextType | null>(null);

export const PROGRAM_ID = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
export const TOKEN_MINT = new PublicKey('3HdXZj5YXaLEcdmLFAUfTrtsCiaPgBYwAdAbMjyESUgy');

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const{publicKey , signTransaction , connected} = useWallet();
    const { connection } = useConnection();



    const getProvider = useCallback(() => {
        if (!connected) {
            throw new Error('Wallet not connected');
        }

        if (!connection || !connection.rpcEndpoint) {
            throw new Error('Connection not established');
        }

        return  new AnchorProvider(connection, { publicKey, signTransaction }, {});
    }, [connection, publicKey, signTransaction]);

    const getProgram = useCallback(() => {
        const provider = getProvider();
        return new Program(idl, provider);
    }, [getProvider]);

    const createUser = useCallback(async () => {
        const program = getProgram();
        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user'), publicKey!.toBuffer()],
            PROGRAM_ID
        );

        const tx = await program.methods
            .createUser()
            .accounts({
                user: userPda,
                authority: publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc({ commitment: 'confirmed' });

        return tx;
    }, [getProgram, publicKey]);

    const updateProfile = useCallback(async (skills: string[]) => {
        const program = getProgram();
        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user'), publicKey!.toBuffer()],
            PROGRAM_ID
        );

        const tx = await program.methods
            .updateUserProfile(skills)
            .accounts({
                user: userPda,
                authority: publicKey,
            })
            .rpc();

        return tx;
    }, [getProgram, publicKey]);

    const createProject = useCallback(async (title: string, skills: string[], link: string) => {
        const program = getProgram();
        const [projectPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('project'), publicKey!.toBuffer(), Buffer.from(title)],
            PROGRAM_ID
        );

        const tx = await program.methods
            .submitProject(title, skills, link)
            .accounts({
                project: projectPda,
                owner: publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }, [getProgram, publicKey]);

    const selectProjectToVet = useCallback(async (projectOwner: string, projectTitle: string) => {


        if (!projectOwner || !projectTitle) {
            throw new Error('Project owner and title are required');
        }

        const program = getProgram();
        const ownerPubkey = new PublicKey(projectOwner);

        console.log(ownerPubkey);
        
        const [projectPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('project'), ownerPubkey.toBuffer(), Buffer.from(projectTitle)],
            PROGRAM_ID
        );

        console.log(projectPda);
        

        const tx = await program.methods
            .selectProjectToVet()
            .accounts({
                project: projectPda,
                vetter: publicKey,
            })
            .rpc({ commitment: 'confirmed' });

        return tx;
    }, [getProgram, publicKey]);

    const fundPool = useCallback(async (amount: number) => {
        if (amount <= 0) {
            throw new Error('Please enter a valid amount to fund.');
        }

        try {
            const tx = await fundProgramRewardPool({
                amount,
                wallet : {publicKey , signTransaction},
                connection,
                programId: PROGRAM_ID,
                tokenMintAddress: TOKEN_MINT,
                idl
            });
            return tx;
        } catch (error) {
            console.error('Error funding pool:', error);
            throw error;
        }
    }, [connection, publicKey, PROGRAM_ID, TOKEN_MINT, idl]);

    const submitValidation = useCallback(async (
        projectOwner: string,
        projectTitle: string,
        score: number,
        tokenMint: string
    ) => {

        console.log(projectOwner, projectTitle, score, tokenMint);
        

        
        try {
            const program = getProgram();
            const provider = getProvider();
            const ownerPubkey = new PublicKey(projectOwner);
            const tokenMintPubkey = new PublicKey(tokenMint);
    
            // Derive Project PDA
            const [projectPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('project'), ownerPubkey.toBuffer(), Buffer.from(projectTitle)],
                PROGRAM_ID
            );
    
            // Fetch project account
            let projectAccount;
            try {
                projectAccount = await program.account.project.fetch(projectPda);
            } catch (err) {
                throw new Error(`Project not found: ${err.message}`);
            }
    
            // Check project details
            const vetters = projectAccount.vetters.map(v => new PublicKey(v));
            const scores = projectAccount.scores || [];
    
            if (!vetters.some(v => v.equals(publicKey))) {
                throw new Error(`Your wallet (${publicKey.toBase58()}) is not an authorized vetter`);
            }
    
            // Check if already submitted score
            if (scores.some(s => new PublicKey(s.vetter).equals(publicKey))) {
                throw new Error('You have already submitted a score for this project');
            }
    
            // Fetch critical PDAs and accounts
            const [userPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('user'), ownerPubkey.toBuffer()],
                PROGRAM_ID
            );
    
            const [authorityPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('authority')],
                PROGRAM_ID
            );
    
            const [penaltyAccountAuthority] = PublicKey.findProgramAddressSync(
                [Buffer.from('penalty_authority')],
                PROGRAM_ID
            );
    
            // Verify token mint
            try {
                const mintInfo = await connection.getParsedAccountInfo(tokenMintPubkey);
                if (!mintInfo.value) {
                    throw new Error(`Token mint ${tokenMint} not found`);
                }
                
                const data = mintInfo.value.data;
                if (!data || typeof data !== 'object' || !('parsed' in data)) {
                    throw new Error(`${tokenMint} is not a valid token mint`);
                }
            } catch (err) {
                throw new Error(`Invalid token mint (${tokenMint}): ${err.message}`);
            }
    
            // Initialize token accounts with verification
            const programTokenAccountPubkey = await getAssociatedTokenAddress(
                tokenMintPubkey,
                authorityPda,
                true
            );
            
            // Check if program token account has enough balance
            try {
                const programTokenAccount = await getAccount(connection, programTokenAccountPubkey);
                const balance = programTokenAccount.amount;
            } catch (err) {
                // Continue even if we can't check the balance
            }
    
            const userTokenAccountPubkey = await getAssociatedTokenAddress(
                tokenMintPubkey,
                ownerPubkey
            );
    
            const penaltyTokenAccountPubkey = await getAssociatedTokenAddress(
                tokenMintPubkey,
                penaltyAccountAuthority,
                true
            );
    
            // Create setup transaction for any token accounts that need to be created
            let setupTransaction = new Transaction();
            let needsSetup = false;
            
            // Check if token accounts exist and create them if needed
            const programAccountInfo = await connection.getAccountInfo(programTokenAccountPubkey);
            if (!programAccountInfo) {
                setupTransaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        programTokenAccountPubkey,
                        authorityPda,
                        tokenMintPubkey
                    )
                );
                needsSetup = true;
            }
            
            const userAccountInfo = await connection.getAccountInfo(userTokenAccountPubkey);
            if (!userAccountInfo) {
                setupTransaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        userTokenAccountPubkey,
                        ownerPubkey,
                        tokenMintPubkey
                    )
                );
                needsSetup = true;
            }
            
            const penaltyAccountInfo = await connection.getAccountInfo(penaltyTokenAccountPubkey);
            if (!penaltyAccountInfo) {
                setupTransaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        penaltyTokenAccountPubkey,
                        penaltyAccountAuthority,
                        tokenMintPubkey
                    )
                );
                needsSetup = true;
            }
    
            // Process vetters in exact project order
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
                
                try {
                    const userAccount = await program.account.user.fetch(vetterUserPda);
                } catch (err) {
                    // Continue even if user account not found
                }
                
                // Check if vetter token account exists and create if needed
                const vetterTokenAccountInfo = await connection.getAccountInfo(vetterTokenAccountPubkey);
                if (!vetterTokenAccountInfo) {
                    setupTransaction.add(
                        createAssociatedTokenAccountInstruction(
                            publicKey,
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
                try {
                    // Get recent blockhash
                    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
                    setupTransaction.recentBlockhash = blockhash;
                    setupTransaction.feePayer = publicKey;
                    
                    // Sign and send transaction
                    const setupTxId = await provider.sendAndConfirm(setupTransaction);
                    
                    // Confirm transaction
                    const confirmation = await connection.confirmTransaction({
                        blockhash,
                        lastValidBlockHeight,
                        signature: setupTxId
                    });
                } catch (err) {
                    // Continue anyway - the validation transaction may work if accounts already exist
                }
            }
    
            // Build validation transaction
            const validationTransaction = new Transaction();
            
            try {
                const instruction = await program.methods
                    .submitValidation(score)
                    .accounts({
                        project: projectPda,
                        vetter: publicKey,
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
                
                validationTransaction.add(instruction);
            } catch (err) {
                throw new Error(`Error building instruction: ${err.message}`);
            }
    
            // Send transaction
            try {
                // Get a recent blockhash
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
                validationTransaction.recentBlockhash = blockhash;
                validationTransaction.feePayer = publicKey;
                
                // Send transaction
                const txId = await provider.sendAndConfirm(
                    validationTransaction,
                    [],
                    { skipPreflight: true }
                );
                
                // Confirm transaction
                const confirmation = await connection.confirmTransaction({
                    blockhash,
                    lastValidBlockHeight,
                    signature: txId
                });
                
                if (confirmation.value.err) {
                    throw new Error(`Transaction error: ${JSON.stringify(confirmation.value.err)}`);
                }
                
                return txId;
            } catch (err) {
                throw new Error(`Transaction failed: ${err.message}`);
            }
        } catch (err) {
            console.error('Error in submitValidation:', err);
            throw err;
        }
    }, [getProgram, getProvider, publicKey, connection]);

    const fetchAccounts = useCallback(async () => {
        const program = getProgram();
        const userAccounts = await program.account.user.all();
        const projectAccounts = await program.account.project.all();

        return {
            users: userAccounts.map((account) => ({
                authority: account.account.authority,
                balance: account.account.balance,
                rank: account.account.rank,
                skills: account.account.skills,
                portfolio: account.account.portfolio,
                rewardsEarned: account.account.rewardsEarned,
                bump: account.account.bump,
            })),
            projects: projectAccounts.map((account) => ({
                title: account.account.title,
                owner: account.account.owner,
                skills: account.account.skills,
                isValidated: account.account.isValidated,
                scores: account.account.scores,
                vetters: account.account.vetters,
                finalScore: account.account.finalScore,
                bump: account.account.bump,
            }))
        };
    }, [getProgram]);


    // const fundPool = useCallback(async (amount: number) => {
    //     if (amount <= 0) {
    //         throw new Error('Please enter a valid amount to fund.');
    //     }

    //     const program = getProgram();
    //     const provider = getProvider();

    //     // Get the authority PDA
    //     const [authorityPda] = PublicKey.findProgramAddressSync(
    //         [Buffer.from('authority')],
    //         PROGRAM_ID
    //     );

    //     // Get the program's token account
    //     const programTokenAccount = await getAssociatedTokenAddress(
    //         TOKEN_MINT,
    //         authorityPda,
    //         true
    //     );

    //     // Get the user's token account
    //     const userTokenAccount = await getAssociatedTokenAddress(
    //         TOKEN_MINT,
    //         publicKey,
    //         true
    //     );

    //     const tx = await program.methods
    //         .fundPool(new anchor.BN(amount))
    //         .accounts({
    //             authority: authorityPda,
    //             programTokenAccount: programTokenAccount,
    //             userTokenAccount: userTokenAccount,
    //             user: publicKey,
    //             tokenProgram: TOKEN_PROGRAM_ID,
    //         })
    //         .rpc();

    //     return tx;
    // }, [getProgram, getProvider, publicKey]);


    const value = {
        createUser,
        updateProfile,
        createProject,
        selectProjectToVet,
        submitValidation,
        fetchAccounts,
        fundPool,
    };

    return (
        <ContractContext.Provider value={value}>
            {children}
        </ContractContext.Provider>
    );
};

export const useContract = () => {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error('useContract must be used within a ContractProvider');
    }
    return context;
};