'use clinet'
import React from 'react'
import { WalletButton } from '../solana/solana-provider';
import Link from 'next/link';

import {
    ClusterUiSelect,
} from '../cluster/cluster-ui';
import { usePathname } from 'next/navigation';
const Header = ({ links }: { links: { label: string; path: string }[] }) => {
    const pathname = usePathname();
    return (
        <div className="flex justify-between items-center py-4  px-2 border-b border-gray-200 dark:border-gray-700">
            <div className='container flex items-center justify-between'>
            <div className="flex">
                <Link className="btn btn-ghost normal-case text-xl" href="/">
                    <img className="h-4 md:h-6" alt="Logo" src="/logo.png" />
                </Link>
                <ul className="flex  px-1 space-x-2">
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