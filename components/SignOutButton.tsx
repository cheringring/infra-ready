'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })}
      className="signout-btn"
    >
      로그아웃
    </button>
  )
}
