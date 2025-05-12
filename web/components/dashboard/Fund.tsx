import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { useState } from 'react'
import { fundProgramRewardPool } from '../../lib/fundPool';
import { PublicKey } from '@solana/web3.js';
import idl from '../../idl/profile.json';

export const Fund = () => {
    const [fundAmount, setFundAmount] = useState<number>(0); // State for input amount
    const [fundStatus, setFundStatus] = useState<string>(''); // State for funding status
    const [isFunding, setIsFunding] = useState<boolean>(false); // Loading state
   const wallet = useWallet();
    const { connection } = useConnection();
    const PROGRAM_ID = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');
    const TOKEN_MINT= new PublicKey('AxHCw4x8buZN2Cqw6kkQFLMpiFCotnX4kMNbQqjVx2fY');
    
    const handleFundPoolClick = async () => {
        if (!wallet.connected || !connection) {
            setFundStatus('Wallet not connected');
            return;
        }
        if (fundAmount <= 0) {
             setFundStatus('Please enter a valid amount to fund.');
             return;
        }
    
        setIsFunding(true);
        setFundStatus('Initiating funding...');
    
        try {
            // Call the fundProgramRewardPool function
            // Make sure PROGRAM_ID, TOKEN_MINT, and idl are imported or accessible
            await fundProgramRewardPool({
                amount: fundAmount, // Amount from input
                wallet: wallet,
                connection: connection,
                programId: PROGRAM_ID,
                tokenMintAddress: TOKEN_MINT,
                idl: idl, // Pass your program's IDL
            });
            setFundStatus(`Successfully funded pool with ${fundAmount} tokens!`);
    
            // Optional: You might want to update UI showing the pool balance here
            // by fetching the programTokenAccountPubkey's balance.
    
        } catch (error: any) { // Catch any errors thrown by fundProgramRewardPool
             console.error('Funding Error:', error);
             // The fundProgramRewardPool function throws errors with messages
             setFundStatus(`Funding failed: ${error.message}`);
        } finally {
            setIsFunding(false);
        }
    };
    
    return(
    <div>
        <h3>Fund Reward Pool</h3>
        <input
            type="number"
            value={fundAmount}
            onChange={(e) => setFundAmount(Number(e.target.value))}
            placeholder="Amount to fund (e.g., 100)"
            disabled={isFunding || !wallet.connected}
            min="0" // Add min attribute
        />
        <button onClick={handleFundPoolClick} disabled={isFunding || !wallet.connected}>
            {isFunding ? 'Funding...' : 'Fund Pool'}
        </button>
        {fundStatus && <p>{fundStatus}</p>}
    </div>

)

}