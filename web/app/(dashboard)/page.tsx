"use client";
import CreateUserUI from '@/components/dashboard/CreateUser';
import DashboardFeature from '@/components/dashboard/dashboard-feature';
import { useUserExists } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Page() {

  const {connected , connecting} = useWallet();

  const isUserCreated = useUserExists();

  return (<>               {(connected && !isUserCreated.isLoading && !isUserCreated.userExists) ? <CreateUserUI /> : null}
    <DashboardFeature />
  </>);
}
