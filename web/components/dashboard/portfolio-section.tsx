'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import ProjectUI from '../project/project-ui';
import { useContract } from '@/contexts/ContractContext';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Project {
  id: number;
  name: string;
  status: string;
}

interface PortfolioSectionProps {
  submittedProjects: Project[];
}

export function PortfolioSection({ submittedProjects }: PortfolioSectionProps) {

  const { fetchAccounts } = useContract();
  const { publicKey } = useWallet();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open , setOpen] = useState(false);
  const [status, setStatus] = useState<string>('');


  const handleFetchAccounts = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet to fetch accounts');
      return;
    }

    try {
      const { projects: fetchedProjects } = await fetchAccounts();


      console.log(fetchedProjects);

      const filteredProjects = fetchedProjects.filter((project) => project.owner.toBase58() === publicKey.toBase58());

      setProjects(filteredProjects);
      setStatus('Accounts fetched successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Fetch accounts on mount
  useEffect(() => {
    if (publicKey) {
      handleFetchAccounts();
    }
  }, [publicKey]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Projects</CardTitle>
        <CardDescription>Overview of your submitted projects for vetting</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {projects.map((project, i) => (
            <li key={i} className="flex justify-between items-center">
              <div >
                <h2 className='text-lg py-3'>{project.title}</h2>
                {
                  project.skills.map((skill, i) => (
                    <Badge key={i} variant='outline' className="mr-2">
                      {skill}
                    </Badge>
                  ))
                }
              </div>


              <Badge variant={project.isValidated ? "success" : "secondary"}>
                {project.isValidated ? "Validated" : "Pending"}
              </Badge>

            </li>


          ))}
        </ul>
        <Button className="mt-4" onClick={() => setOpen(!open)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Nxew Project
        </Button>
        {open && <ProjectUI />}
        {/* <ProjectUI />    */}
      </CardContent>
    </Card>
  );
}