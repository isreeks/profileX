'use clinet'
import React from 'react'
import { WalletButton } from '../solana/solana-provider';
import Link from 'next/link';

import {
    ClusterUiSelect,
} from '../cluster/cluster-ui';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useContract } from '@/contexts/ContractContext';
const Header = ({ links }: { links: { label: string; path: string }[] }) => {
    const pathname = usePathname();

    const {createUser} = useContract();
    return (
        <div className="flex justify-between items-center py-4  px-2 border-b border-gray-200 dark:border-gray-700">
            <div className='container flex items-center justify-between'>
            <div className="flex  justify-center ">
                <Link className="btn btn-ghost normal-case text-xl" href="/">
                   <h2 className='font-poppins pr-4 font-bold text-2xl text-black'>
                    Profile<span className="text-profilex-neon">X</span>
                   </h2>
                </Link>
                <ul className="flex py-2  px-1 space-x-2">
                    {links.map(({ label, path }) => (
                        <li key={path}>
                            <Link
                                className={pathname.startsWith(path) ? 'active' : ''}
                                href={path}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex space-x-2 items-center">
                <WalletButton />
                <ClusterUiSelect />

            
            </div>
            </div>

        </div>
    )
}

export default Header