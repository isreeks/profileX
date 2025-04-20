'use client';

import { getProfileProgram, getProfileProgramId } from '@profile/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useProjectProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getProfileProgramId(cluster.network as Cluster),
    [cluster]
  );

  const program = getProfileProgram(provider);
  

  const projects = useQuery({
    queryKey: ['project', 'all', { cluster }],
    queryFn: () => program.account.project.all(),
  });



  return { projects , program };
}


export function useProjectProgramAccount({ account }: { account: PublicKey }) {
  const { program } = useProjectProgram();
  const { cluster } = useCluster(); 
    const transactionToast = useTransactionToast();

  const wallet = useAnchorProvider();

  const accountQuery = useQuery({
    queryKey: ['projec', 'fetch', { cluster, account }],
    queryFn: () => program.account.project.fetch(account),
  });


  const createMutation = useMutation({
    mutationKey: ['user', 'create', { cluster, account }],
    mutationFn: async (variables: { projectName: string, skills: string[] }) => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }



      return program.methods.submitProject(
        variables.projectName,
        variables.skills,
      ).accounts({ user: wallet.publicKey }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
    onError: (tx) => {
      console.log(tx);
      
      toast.error('Failed to create account');
    }
    
  });


  return { accountQuery , createMutation};
}
