'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, ExternalLink } from 'lucide-react';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    const headingEl = headingRef.current;
    const subheadingEl = subheadingRef.current;
    const ctaEl = ctaRef.current;
    const imageEl = imageRef.current;

    if (!heroEl || !headingEl || !subheadingEl || !ctaEl || !imageEl) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      headingEl,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )
      .fromTo(
        subheadingEl,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )
      .fromTo(
        ctaEl,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        imageEl,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.2 },
        '-=0.8'
      );

    // Particles
    const createParticles = () => {
      const particles = document.createElement('div');
      particles.className = 'particles';
      particles.style.position = 'absolute';
      particles.style.width = '100%';
      particles.style.height = '100%';
      particles.style.top = '0';
      particles.style.left = '0';
      particles.style.pointerEvents = 'none';
      heroEl.appendChild(particles);

      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = 'rgba(0, 255, 153, ' + (Math.random() * 0.5 + 0.1) + ')';
        particle.style.borderRadius = '50%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.opacity = '0';
        particles.appendChild(particle);

        gsap.to(particle, {
          opacity: Math.random() * 0.5 + 0.1,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 3,
          repeat: -1,
          yoyo: true,
        });

        gsap.to(particle, {
          y: Math.random() * 100 - 50,
          x: Math.random() * 100 - 50,
          duration: Math.random() * 15 + 15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    };

    createParticles();

    // Cleanup
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.97) 0%, rgba(26,26,26,0.9) 100%)',
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-profilex-neon/20 to-transparent opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-profilex-green/20 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-profilex-neon/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-profilex-green/10 border border-profilex-green/30 text-profilex-neon text-sm mb-6">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profilex-neon opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-profilex-neon"></span>
                </span>
                Now Live on Solana Mainnet
              </div>
              <h1 
                ref={headingRef}
                className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight"
              >
                Decentralized <span className="text-gradient">Project</span> Validation & <span className="text-gradient">Rewards</span>
              </h1>
            </div>
            
            <p 
              ref={subheadingRef}
              className="text-gray-300 text-lg md:text-xl max-w-xl"
            >
              ProfileX enables creators to submit projects for community validation while earning rewards through a transparent, decentralized system on Solana.
            </p>
            
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
              <WalletMultiButton className="!bg-profilex-neon hover:!bg-opacity-90 !text-profilex-black !rounded-lg !px-8 !py-3 !text-base transition-all duration-300 !font-poppins !font-medium glow-button" />
              
              <Button variant="outline" className="border-profilex-green text-white hover:bg-profilex-green/10 rounded-lg px-8 py-6 font-medium flex items-center gap-2 group">
                Explore Projects 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-profilex-neon"></div>
                <span>500+ Projects</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-profilex-green"></div>
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-profilex-neon"></div>
                <span>100K+ SOL Rewarded</span>
              </div>
            </div>
          </div>
          
          <div 
            ref={imageRef} 
            className="relative"
          >
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-radial from-profilex-neon/20 to-transparent opacity-60 blur-3xl -z-10"></div>
              <div className="glass-effect p-3 rounded-2xl glowing-border overflow-hidden">
                <div className="rounded-xl overflow-hidden bg-profilex-black">
                  <Image
                    src="https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="ProfileX Platform Dashboard"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">DeFi Dashboard</h3>
                      <p className="text-gray-400 text-sm">Connected with Phantom</p>
                    </div>
                    <Button size="sm" className="bg-profilex-neon text-black hover:bg-profilex-neon/90 rounded-full h-8 px-3 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" /> View Demo
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 animate-float">
                <div className="glass-effect p-4 rounded-lg glowing-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-profilex-neon/20 flex items-center justify-center border border-profilex-neon/30">
                      <span className="text-profilex-neon text-xl font-bold">$</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Rewards Earned</p>
                      <p className="text-profilex-neon font-bold">+24.5 SOL</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-8 -left-8 animate-float" style={{ animationDelay: "1s" }}>
                <div className="glass-effect p-3 rounded-lg glowing-border">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-profilex-green/20 flex items-center justify-center border border-profilex-green/30">
                      <span className="text-profilex-green">✓</span>
                    </div>
                    <div>
                      <p className="text-white text-sm">Validation Rate</p>
                      <p className="text-profilex-green font-bold text-sm">98%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}