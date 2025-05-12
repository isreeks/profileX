import { useContract } from "@/contexts/ContractContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { type ClassValue, clsx } from "clsx"
import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge"

export function ny(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const useUserExists = () => {
  const { publicKey ,connected } = useWallet();
  const { connection } = useConnection();
  const { getProgram } = useContract(); // Assuming getProgram is exposed in ContractContext
  const [userExists, setUserExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const PROGRAM_ID = new PublicKey('CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C');

  const checkUserExists = useCallback(async () => {
    if (!publicKey || !connection || !connected) {
      console.log('No publicKey, connection, or not connected, setting userExists to false');
      setUserExists(false);
      setIsLoading(false);
      return;
    }
  
    console.log('Checking user existence...');
    setIsLoading(true);
    setError(null);
  
    try {
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), publicKey.toBuffer()],
        PROGRAM_ID
      );
      console.log('User PDA:', userPda.toBase58());
  
      const program = getProgram();
      // Simulate slow network
      await new Promise(resolve => setTimeout(resolve, 2000));
      const userAccount = await program.account.user.fetchNullable(userPda, 'confirmed');
      console.log('User Account:', userAccount);
  
      setUserExists(!!userAccount);
      console.log('User Exists:', !!userAccount);
    } catch (err) {
      console.error('Error checking user existence:', err);
      setError(err.message || 'Failed to check user existence');
      setUserExists(false);
    } finally {
      setIsLoading(false);
      console.log('Loading Complete, isLoading:', false);
    }
  }, [publicKey, connection, getProgram, connected]);

  // Run the check when publicKey or connection changes
  useEffect(() => {
    checkUserExists();
  }, [checkUserExists]);

  return { userExists, isLoading, error, checkUserExists };
};