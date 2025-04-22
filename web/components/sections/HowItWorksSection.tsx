'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileUp, Users, CheckCircle, Coins } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const steps = stepsRef.current;

    if (!section || !heading || !steps) return;

    // Animate heading
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

    // Animate steps
    const stepItems = steps.querySelectorAll('.step-item');
    gsap.fromTo(
      stepItems,
      { 
        opacity: 0,
        y: 50
      },
      { 
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: steps,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      }
    );

    // Animate line
    const line = steps.querySelector('.step-line');
    if (line) {
      gsap.fromTo(
        line,
        { 
          scaleY: 0,
          transformOrigin: 'top'
        },
        { 
          scaleY: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: steps,
            start: 'top bottom-=100',
            end: 'bottom bottom-=200',
            scrub: 0.5
          }
        }
      );
    }
  }, []);

  const steps = [
    {
      icon: <FileUp className="h-6 w-6" />,
      title: 'Submit Your Project',
      description: 'Create your project profile and submit it to the platform with all relevant details and documentation.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Review',
      description: 'The community reviews your project based on predefined criteria and provides feedback.'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Validation Process',
      description: 'Your project undergoes a transparent validation process through community voting and verification.'
    },
    {
      icon: <Coins className="h-6 w-6" />,
      title: 'Earn Rewards',
      description: 'Once validated, you earn SOL tokens as rewards. You can also earn by participating in the validation process.'
    }
  ];

  return (
    <div ref={sectionRef} id="how-it-works" className="relative py-24 md:py-32 bg-profilex-black/50">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-profilex-green/10 border border-profilex-green/30 text-profilex-green text-sm">
            Simple Process
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-white">
            How <span className="text-gradient">ProfileX</span> Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our platform makes it easy to showcase your projects, get community validation, and earn rewards through a simple four-step process.
          </p>
        </div>

        <div ref={stepsRef} className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="step-line absolute left-[28px] sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-profilex-neon via-profilex-green to-profilex-neon transform -translate-x-1/2 hidden sm:block"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="step-item relative flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-16 last:mb-0">
              {/* Mobile line (visible only on small screens) */}
              {index < steps.length - 1 && (
                <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-gradient-to-b from-profilex-neon to-profilex-green h-full sm:hidden"></div>
              )}
              
              {/* Step number with icon */}
              <div className={`z-10 flex items-center justify-center h-14 w-14 rounded-full border-2 ${index % 2 === 0 ? 'border-profilex-neon bg-profilex-neon/10' : 'border-profilex-green bg-profilex-green/10'} text-white sm:mr-8 sm:ml-auto`}>
                {step.icon}
              </div>
              
              {/* Step content */}
              <div className={`glass-effect p-6 rounded-xl max-w-lg ${index % 2 === 0 ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                <h3 className="font-poppins font-semibold text-xl text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}