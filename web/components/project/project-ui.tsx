'use client';
import React, { useState } from 'react'
import { useContract } from '../../contexts/ContractContext';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const ProjectUI = () => {

    const { createProject } = useContract();

    const [projectName, setProjectName] = useState("");
    const [skills, setSkills] = useState("");
    const [projectLink, setProjectLink] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const result = await createProject(projectName, skills.split(","), "link_placeholder");
            console.log("Project created with transaction ID:", result);
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    return (
     

                <Card className='mt-8'>
                
                        <CardHeader>
                            <CardTitle>Create a Project</CardTitle>
                        </CardHeader>
                        {/* <CardDescription>Description of the project</CardDescription> */}
                        <CardContent>
            
                <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        className="input input-bordered"
                        placeholder="Enter Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <Input
                        type="text"
                        className="input input-bordered"
                        placeholder="Enter Skills (comma separated)"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />
                    <Input
                        type="text"
                        className="input input-bordered"
                        placeholder="Enter Project Link"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                    />
                    <Button type="submit" className="btn btn-primary">Submit</Button>
                </form>
                </CardContent>

                </Card>
       
    );
}

export default ProjectUI