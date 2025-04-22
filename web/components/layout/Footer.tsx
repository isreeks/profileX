import Link from 'next/link';
import { Coins, Github, Twitter, Disc as Discord } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-profilex-black bg-opacity-70 backdrop-blur-md border-t border-profilex-green border-opacity-20 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="h-7 w-7 text-profilex-neon" />
              <span className="font-poppins font-bold text-xl text-white">
                Profile<span className="text-profilex-neon">X</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              A decentralized platform for project submission and community validation on the Solana blockchain.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors">
                <Discord className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Rewards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  API
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Solana Guide
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-profilex-neon transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-profilex-green border-opacity-20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ProfileX. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-4 md:mt-0">
            Built on <span className="text-profilex-neon">Solana</span>
          </p>
        </div>
      </div>
    </footer>
  );
}