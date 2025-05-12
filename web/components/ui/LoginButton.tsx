'use client'
import { signIn } from 'next-auth/react'
import React from 'react'
import { Button } from './button'

const LoginButton = () => {
  return (
    <div>
        <Button className="btn btn-primary text-white" onClick={() => signIn('github')}>Login</Button>
    </div>
  )
}

export default LoginButton