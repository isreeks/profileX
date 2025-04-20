import { PublicKey } from "@solana/web3.js"
import { useUserProgram, useUserProgramAccount } from "./user-data-access"
import { useState } from "react"

export const UserData = () => {

    const { users } = useUserProgram()
    return (
        <div>
            <div>
                {users.isLoading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                ) : users.data?.length ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {users.data?.map((account) => (
                            <UserCard
                                key={account.publicKey.toString()}
                                account={account}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className={'text-2xl'}>No accounts</h2>
                        No accounts found. Create one above to get started.
                    </div>
                )}
            </div>
        </div>
    )
}

export const CreateUserData = () => {


    const [userId, setUserId] = useState("");

    const { createMutation } = useUserProgramAccount({ account: PublicKey.default });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        createMutation.mutate(
            userId
        )


        // TODO: Handle form submission
    };
    return (

        <div className="my-8  flex flex-col gap-8 p-6 border rounded-lg border-slate-400">
            <h1>Create User Data</h1>
            <form className=" flex flex-col gap-8" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="input input-bordered"
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    placeholder="Enter User ID"
                />
                <button className="btn" type="submit">Create User</button>
            </form>
        </div>



    )
}


const UserCard = ({ account }: { account: any }) => {
    return (

        <div>
            <h1>User Card</h1>
            <p>{account.publicKey.toString()}</p>
            <p>{JSON.stringify(account)}</p>
        </div>
    )

}