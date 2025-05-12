'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ny } from '@/lib/utils';
import { Coins, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import LoginButton from '../ui/LoginButton';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={ny(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4',
        isScrolled 
          ? 'bg-profilex-black bg-opacity-80 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-profilex-neon" />
            <span className="font-poppins font-bold text-2xl text-white">
              Profile<span className="text-profilex-neon">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-white hover:text-profilex-neon transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-white hover:text-profilex-neon transition-colors">
              How It Works
            </Link>
            <Link href="#community" className="text-white hover:text-profilex-neon transition-colors">
              Community
            </Link>
   <LoginButton/>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <WalletMultiButton className="mr-4 !bg-profilex-dark hover:!bg-opacity-90 !border !border-profilex-green !text-profilex-neon !rounded-lg !px-4 !py-2 transition-all duration-300 !font-poppins !font-medium !text-sm" />
            <Button 
              variant="ghost" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-profilex-neon"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 glass-effect py-4 px-6 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-4">
              <Link 
                href="#features" 
                className="text-white hover:text-profilex-neon transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-white hover:text-profilex-neon transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="#community" 
                className="text-white hover:text-profilex-neon transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}