'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { ProfileOverview } from './profile-overview';
import { PortfolioSection } from './portfolio-section';
import { VettingSection } from './vetting-section';
import { JobsSection } from './jobs-section';
import { LadderProgression, RewardBalance, ApplicationTracker } from './sidebar-components';
import { Button } from '../ui/button';
import { useContract } from '@/contexts/ContractContext';
import CreateUserUI from './CreateUser';
import { Fund } from './Fund';
import { useUserExists } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solanacookbook.com/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  {
    label: 'Solana Developers GitHub',
    href: 'https://github.com/solana-developers/',
  },
];

export default function DashboardFeature() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [jobSearch, setJobSearch] = useState("")
  const userProfile = {
    address: "0x1234...5678",
    username: "CryptoEnthusiast",
    rank: "Silver",
    tokenBalance: 500,
    avatarUrl: "/placeholder.svg?height=40&width=40",
  }

  const {publicKey} = useWallet();

  const { createUser } = useContract();

  const submittedProjects = [
    { id: 1, name: "DeFi Protocol", status: "Pending" },
    { id: 2, name: "NFT Marketplace", status: "Approved" },
  ]





  useEffect(() => {

    ata();

  }, []);

  const isUserCreated = useUserExists();


  async function ata() {

    const publicKey = new PublicKey("BLq3kfqYD93wtezG5dBSpGAbbvvyRt9oaLTewknZGQmg")
    const token = new PublicKey("24nwi3Dzs8WnLufXRFtmWZqUXSqPqpziV9FbDHGtrmgX")
    const userAta = await getAssociatedTokenAddress(
      publicKey,  // User's public key
      token,  // The mint address for the token you are rewarding
      false  // false means the token account might not exist and needs to be created
    );

    console.log(userAta.toBase58());
  }

  const vettingRequests = [
    { id: 1, projectName: "Smart Contract Audit", requester: "0xabcd...efgh" },
    { id: 2, projectName: "Dapp Frontend", requester: "0x9876...5432" },
  ]

  const jobListings = [
    { id: 1, title: "Blockchain Developer", company: "CryptoTech", location: "Remote", salary: "$120k - $150k" },
    { id: 2, title: "Smart Contract Auditor", company: "SecureChain", location: "New York", salary: "$100k - $130k" },
  ]

  const applications = [
    { id: 1, jobTitle: "Solidity Developer", company: "EthWorks", status: "Applied" },
    { id: 2, jobTitle: "Frontend Web3 Developer", company: "DappForge", status: "Interview" },
  ]
  return (
    <div className="container mx-auto p-4">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProfileOverview userProfile={userProfile} />



        {/* Main Dashboard Area */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="vetting">Vetting</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
            </TabsList>
            <TabsContent value="portfolio">
     
              <PortfolioSection submittedProjects={submittedProjects} />

            </TabsContent>
            <TabsContent value="vetting">
              <VettingSection vettingRequests={vettingRequests} />
            </TabsContent>
            <TabsContent value="jobs">
              <JobsSection
                jobListings={jobListings}
                jobSearch={jobSearch}
                setJobSearch={setJobSearch}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LadderProgression />
          <RewardBalance />
          <ApplicationTracker applications={applications} />

          {
            publicKey?.toBase58() === "6tia5tGv9dYLs5Gij2TLuC1bLwSC7L3u94MDjqsekRVS" ? (
              <Fund />
            ) : null
          }
       
        </div>
      </div>
    </div>
  );
}
