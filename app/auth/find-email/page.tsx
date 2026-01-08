'use client'

import { useState } from 'react'
import Link from 'next/link'

interface EmailResult {
  email: string
  fullEmail: string
  createdAt: string
}

export default function FindEmail() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState<EmailResult[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setEmails([])
    setLoading(true)

    try {
      const response = await fetch('/api/auth/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '아이디 찾기에 실패했습니다')
      } else {
        setSuccess(data.message)
        setEmails(data.emails || [])
        if (data.emails && data.emails.length > 0) {
          console.log('📧 찾은 이메일들:', data.emails.map((e: EmailResult) => e.fullEmail))
        }
      }
    } catch (error) {
      setError('아이디 찾기 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header>
        <h1>아이디 찾기</h1>
        <p>가입 시 입력한 이름을 입력해주세요</p>
      </header>
      <div className="container">
        <div className="auth-form">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}
            
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="홍길동"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? '검색 중...' : '아이디 찾기'}
            </button>
          </form>

          {emails.length > 0 && (
            <div className="email-results">
              <h3>찾은 계정</h3>
              {emails.map((emailData, index) => (
                <div key={index} className="email-item">
                  <div className="masked-email">{emailData.email}</div>
                  <div className="email-date">
                    가입일: {new Date(emailData.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="full-email-dev">
                    <strong>개발 환경 - 전체 이메일: {emailData.fullEmail}</strong>
                  </div>
                </div>
              ))}
              
              <div className="found-email-actions">
                <Link href="/auth/signin" className="auth-link">
                  로그인하기
                </Link>
                <Link href="/auth/forgot-password" className="auth-link">
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          )}

          <p className="auth-link">
            <Link href="/auth/signin">로그인으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </>
  )
}
