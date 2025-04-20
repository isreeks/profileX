
import LoginButton from '@/components/ui/LoginButton'
import { signIn } from 'next-auth/react'

import React from 'react'

const page = () => {
  return (
     <div>

      <LoginButton />
  
     </div>
  )
}

export default page