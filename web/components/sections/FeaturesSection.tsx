'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileCode, Shield, Coins, Award, Users, AreaChart, Server, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    gsap.fromTo(
      card,
      { 
        opacity: 0,
        y: 50
      },
      { 
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        },
        delay: delay * 0.15
      }
    );
  }, [delay]);

  return (
    <div ref={cardRef} className="feature-card">
      <div className="mb-4 p-3 inline-flex rounded-xl bg-profilex-neon/10 text-profilex-neon">
        {icon}
      </div>
      <h3 className="text-white font-poppins font-semibold text-xl mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;

    if (!section || !heading) return;

    gsap.fromTo(
      heading.children,
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
          trigger: heading,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  const features = [
    {
      icon: <FileCode className="h-6 w-6" />,
      title: 'Submit Projects',
      description: 'Easily submit your projects to the platform for community review and validation.',
      delay: 0
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Community Validation',
      description: 'Get your projects validated by the community through a transparent voting process.',
      delay: 1
    },
    {
      icon: <Coins className="h-6 w-6" />,
      title: 'Earn Rewards',
      description: 'Earn SOL tokens as rewards for submitting quality projects and participating in validation.',
      delay: 2
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Build Reputation',
      description: 'Build your on-chain reputation through successful submissions and validations.',
      delay: 3
    },
    {
      icon: <AreaChart className="h-6 w-6" />,
      title: 'Analytics Dashboard',
      description: 'Access detailed analytics about your projects, validation rates, and rewards.',
      delay: 4
    },
    {
      icon: <Server className="h-6 w-6" />,
      title: 'Decentralized Storage',
      description: 'Store your project data securely on decentralized storage networks.',
      delay: 5
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'NFT Certificates',
      description: 'Receive NFT certificates for successful project validations and achievements.',
      delay: 6
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Fast Transactions',
      description: 'Enjoy lightning-fast transactions and low fees on the Solana blockchain.',
      delay: 7
    }
  ];

  return (
    <div ref={sectionRef} id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-profilex-green/10 to-transparent opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-profilex-neon/10 to-transparent opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-profilex-neon/10 border border-profilex-neon/30 text-profilex-neon text-sm">
            Key Features
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-white">
            Take Your Projects to the <span className="text-gradient">Next Level</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            ProfileX provides a comprehensive suite of features designed to help you showcase your projects, get validated, and earn rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}