'use client';
import React from 'react'
import { useProfileProgram, useProfileProgramAccount } from '../profile/profile-data-access';
import { PublicKey } from "@solana/web3.js"
import { useProjectProgramAccount } from './project-data-access';

const ProjectUI = () => {

    const { createMutation } = useProjectProgramAccount({ account: PublicKey.default });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        createMutation.mutate(
           { projectName: "DeFi Protocol", skills: ["Solidity", "Web3"] }
        )


        // TODO: Handle form submission
    };
  return (
    <div>
        <div className="my-8  flex flex-col gap-8 p-6 border rounded-lg border-slate-400">
            <h1>Create Project Data</h1>
            <form className=" flex flex-col gap-8" onSubmit={(e) => handleSubmit(e)}>
                <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter Project Name"
                />
                <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter Skills"
                />
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>

    </div>
  )
}

export default ProjectUI