'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    gsap.fromTo(
      content.children,
      { 
        opacity: 0,
        y: 50
      },
      { 
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  return (
    <div 
      ref={sectionRef} 
      id="community" 
      className="relative py-24 md:py-32"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-radial from-profilex-neon/20 to-transparent opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="glass-effect p-8 md:p-12 lg:p-16 rounded-2xl glowing-border max-w-5xl mx-auto">
          <div ref={contentRef} className="space-y-8 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-white">
              Join the <span className="text-gradient">ProfileX</span> Community
            </h2>
            
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Be part of a growing ecosystem of creators, validators, and enthusiasts shaping the future of decentralized project validation on Solana.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <WalletMultiButton className="!bg-profilex-neon hover:!bg-opacity-90 !text-profilex-black !rounded-lg !px-8 !py-3 !text-base transition-all duration-300 !font-poppins !font-medium glow-button" />
              
              <Button variant="outline" className="border-profilex-green text-white hover:bg-profilex-green/10 rounded-lg px-8 py-6 font-medium flex items-center gap-2 group">
                Learn More 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-profilex-neon">500+</p>
                <p className="text-gray-400">Projects Submitted</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-profilex-neon">10K+</p>
                <p className="text-gray-400">Community Members</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-profilex-neon">100K+</p>
                <p className="text-gray-400">SOL Distributed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-profilex-neon">98%</p>
                <p className="text-gray-400">Validation Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}