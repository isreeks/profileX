'use client'
import { signIn } from 'next-auth/react'
import React from 'react'

const LoginButton = () => {
  return (
    <div>
        <button className="btn btn-primary" onClick={() => signIn('github')}>Login</button>
    </div>
  )
}

export default LoginButton