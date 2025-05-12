'use client';

import { getProfileProgram, getProfileProgramId } from '@profile/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useUserProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getProfileProgramId(cluster.network as Cluster),
    [cluster]
  );

  const program = getProfileProgram(provider);

  const users = useQuery({
    queryKey: ['user', 'all', { cluster }],
    queryFn: () => program.account.user.all(),
  });

  return { users, program };
}

export function useUserProgramAccount({ account }: { account: PublicKey }) {
  const { program } = useUserProgram();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  const accountQuery = useQuery({
    queryKey: ['user', 'fetch', { cluster, account }],
    queryFn: () => program.account.user.fetch(account),
  });

  const createMutation = useMutation({
    mutationKey: ['user', 'create', { cluster, account }],
    mutationFn: async () => {
      if (!provider.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [userPDA, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from('user'), provider.publicKey.toBuffer()],
        program.programId
      );

      return program.methods
        .createUser()
        .accounts({
          user: userPDA,
          authority: provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to create account');
    },
  });

  return { accountQuery, createMutation };
}