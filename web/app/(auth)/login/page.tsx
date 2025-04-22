
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { CTASection } from '@/components/sections/CTASection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import LoginButton from '@/components/ui/LoginButton'
import { signIn } from 'next-auth/react'

import React from 'react'

const page = () => {
  return (
     <div>

<Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
  
     </div>
  )
}

export default page