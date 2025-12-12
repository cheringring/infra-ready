'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          Infra Ready
        </Link>
        <div className="nav-links">
          {session ? (
            <>
              <span className="nav-user">
                {session.user.name}님
                {session.user.role === 'admin' && ' (관리자)'}
              </span>
              <Link href="/mypage" className="nav-link">마이페이지</Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="nav-link">로그인</Link>
              <Link href="/auth/signup" className="nav-link">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
