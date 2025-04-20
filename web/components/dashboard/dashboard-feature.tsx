'use client';

import { BarChartIcon, BellIcon, ChevronRightIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppHero } from '../ui/ui-layout';
import { IconAward, IconFilter, IconSearch, IconUsers, IconWallet } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import ProjectUI from '../project/project-ui';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

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

  const submittedProjects = [
    { id: 1, name: "DeFi Protocol", status: "Pending" },
    { id: 2, name: "NFT Marketplace", status: "Approved" },
  ]


  useEffect(() => {

    ata();

  }, []);


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
        {/* Profile Overview */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Profile Overview</CardTitle>
            <Avatar>
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} />
              <AvatarFallback>{userProfile.username.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-sm font-medium">Wallet Address: {userProfile.address}</p>
                <p className="text-sm font-medium">Username: {userProfile.username}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <Badge variant="secondary" className="mr-2">
                  Rank: {userProfile.rank}
                </Badge>
                <Badge variant="outline">Token Balance: {userProfile.tokenBalance}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Area */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="vetting">Vetting</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
            </TabsList>
            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Projects</CardTitle>
                  <CardDescription>Overview of your submitted projects for vetting</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {submittedProjects.map((project) => (
                      <li key={project.id} className="flex justify-between items-center">
                        <span>{project.name}</span>
                        <Badge variant={project.status === "approved" ? "success" : "secondary"}>
                          {project.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-4" onClick={() => alert("Add new project")}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add New Project
                  </Button>
                  <ProjectUI />

                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="vetting">
              <Card>
                <CardHeader>
                  <CardTitle>Vetting Requests</CardTitle>
                  <CardDescription>Projects available for you to vet</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {vettingRequests.map((request) => (
                      <li key={request.id} className="flex justify-between items-center">
                        <span>{request.projectName}</span>
                        <Button size="sm" onClick={() => alert(`Start vetting ${request.projectName}`)}>
                          Start Vetting
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Job Search</CardTitle>
                  <CardDescription>Find your next opportunity in Web3</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-4">
                    <div className="relative flex-grow">
                      <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs..."
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button variant="outline">
                      <IconFilter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </div>
                  <ul className="space-y-4">
                    {jobListings.map((job) => (
                      <li key={job.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <p className="text-sm">{job.location}</p>
                          </div>
                          <Badge variant="secondary">{job.salary}</Badge>
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <Button size="sm">Apply</Button>
                          <Button size="sm" variant="outline">
                            Save
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ladder Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={33} className="w-full" />
              <p className="text-sm text-center mt-2">33% to next rank</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reward Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,250 Tokens</p>
              <p className="text-sm text-muted-foreground">Earned from vetting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {applications.map((app) => (
                  <li key={app.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{app.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                    </div>
                    <Badge>{app.status}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
