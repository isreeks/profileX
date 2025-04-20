"use client";
import React from 'react'
import { CreateUserData, UserData } from './user-ui'

const UserFeatures = () => {
  return (
    <div>
        <UserData />
        <CreateUserData />
    </div>
  )
}

export default UserFeatures