'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContract } from '../../contexts/ContractContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SubmitValidation } from './SubmitValidation';
// import { toast } from '../ui/use-toast';


interface ProjectData {
  title: string;
  owner: any; // PublicKey
  skills: string[];
  isValidated: boolean;
  vetters: any[]; // PublicKey[]
}

export function VettingSection() {
  const { publicKey } = useWallet();
  const { selectProjectToVet, fetchAccounts } = useContract();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [publicKey]);

  const fetchProjects = async () => {
    try {
      const { projects } = await fetchAccounts();
      // Filter only unvalidated projects that the user hasn't vetted yet
      const availableProjects = projects.filter(proj =>
        !proj.isValidated &&
        proj.owner.toBase58() !== publicKey?.toBase58()
      );

      console.log(availableProjects.map(proj => proj.vetters.map(vetter => vetter.toBase58())));
      

      setProjects(availableProjects);
    } catch (error: any) {
      // toast({
      //   title: "Error fetching projects",
      //   description: error.message,
      //   variant: "destructive",
      // });
    }
  };

  const handleStartVetting = async (project: ProjectData) => {
    if (!publicKey) {
      // toast({
      //   title: "Wallet not connected",
      //   description: "Please connect your wallet to start vetting",
      //   variant: "destructive",
      // });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting vetting for project:", project);

      const tx = await selectProjectToVet(project.owner.toBase58(), project.title);
      // toast({
      //   title: "Success",
      //   description: `Started vetting project. Transaction: ${tx.slice(0, 8)}...`,
      // });
      await fetchProjects(); // Refresh projects list
    } catch (error: any) {
      // toast({
      //   title: "Error",
      //   description: error.message,
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Vetting Requests</CardTitle>
          <CardDescription>Projects available for you to vet</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects available for vetting</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li key={`${project.owner}-${project.title}`} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{project.title}</span>
                    <p className="text-sm text-muted-foreground">
                      Skills: {project.skills.join(', ')}
                    </p>
          
                  </div>

                  

                  {
                    project.scores.some(score => score.vetter.equals(publicKey)) ? (
                      <p>Already vetted</p>
                    ) : 
                    (project.vetters.some(vetter => vetter.equals(publicKey)) && project.vetters.length === 3) ? (
                      <SubmitValidation
                        projectOwner={project.owner.toBase58()}
                        projectTitle={project.title}
                      />
  
  
                    ) : project.vetters.some(vetter => vetter.equals(publicKey) && project.vetters.length < 3) ? (
                      <p>Waiting for {3 - project.vetters.length} more vetters</p>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleStartVetting(project)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Start Vetting'}
                      </Button>
                    )
                    
                  }


                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

    </div>
  );
}