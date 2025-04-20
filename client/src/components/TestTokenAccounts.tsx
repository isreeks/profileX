import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

const TOKEN_MINT = new PublicKey('6SxqSUYPyqSd1qDYm7Y4BHci6T86BKrbugbE2WwT9Gsq');

const TestTokenAccounts = () => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [vetterAddresses, setVetterAddresses] = useState([
        '41UHFK8GENab4JeXritDpnRtLVUeN3afSobbPHNDGZnd',
        'ECLWSAT8BgQEvvpEMiCYTDg3WKcu3zmxgjPDzMwtz5ZS',
        'HEp9aZBGjBUpqTi9VrxeueEjVXHxM1UBiuBXFiosrQjs'
    ]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const testTokenAccounts = async () => {
        if (!connection) return;
        
        setLoading(true);
        const testResults = [];

        try {
            for (const vetterAddress of vetterAddresses) {
                try {
                    const vetter = new PublicKey(vetterAddress);
                    const tokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, vetter);
                    
                    // Check if account exists
                    let accountInfo;
                    let owner = null;
                    let balance = null;
                    
                    try {
                        accountInfo = await getAccount(connection, tokenAccount);
                        owner = accountInfo.owner.toBase58();
                        balance = accountInfo.amount.toString();
                    } catch (err) {
                        // Account doesn't exist or other error
                    }
                    
                    testResults.push({
                        vetter: vetterAddress,
                        tokenAccount: tokenAccount.toBase58(),
                        exists: !!accountInfo,
                        owner,
                        balance,
                        correct: owner === vetterAddress
                    });
                } catch (err) {
                    testResults.push({
                        vetter: vetterAddress,
                        error: err.message
                    });
                }
            }
            
            setResults(testResults);
        } catch (err) {
            console.error("Test error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <h2>Test Token Accounts</h2>
            
            <div style={{marginBottom: '20px'}}>
                <h3>Vetter Addresses</h3>
                {vetterAddresses.map((addr, i) => (
                    <div key={i} style={{marginBottom: '10px'}}>
                        <input 
                            type="text" 
                            value={addr} 
                            onChange={(e) => {
                                const newAddrs = [...vetterAddresses];
                                newAddrs[i] = e.target.value;
                                setVetterAddresses(newAddrs);
                            }}
                            style={{width: '100%', padding: '8px'}}
                        />
                    </div>
                ))}
            </div>
            
            <button 
                onClick={testTokenAccounts} 
                disabled={loading}
                style={{
                    padding: '10px 15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Testing...' : 'Test Token Accounts'}
            </button>
            
            {results.length > 0 && (
                <div style={{marginTop: '20px'}}>
                    <h3>Results</h3>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr>
                                <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd'}}>Vetter</th>
                                <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd'}}>Token Account</th>
                                <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd'}}>Exists</th>
                                <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd'}}>Owner</th>
                                <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd'}}>Balance</th>
                                <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, i) => (
                                <tr key={i}>
                                    <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{result.vetter.slice(0, 6)}...</td>
                                    <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{result.tokenAccount?.slice(0, 6)}...</td>
                                    <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{result.exists ? '✅' : '❌'}</td>
                                    <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{result.owner?.slice(0, 6)}...</td>
                                    <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{result.balance}</td>
                                    <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>
                                        {result.error ? (
                                            <span style={{color: 'red'}}>{result.error}</span>
                                        ) : result.correct ? (
                                            <span style={{color: 'green'}}>Correct</span>
                                        ) : (
                                            <span style={{color: 'red'}}>Owner mismatch</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TestTokenAccounts;