'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '비밀번호 재설정에 실패했습니다')
      } else {
        setSuccess(data.message)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    } catch (error) {
      setError('비밀번호 재설정 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header>
        <h1>비밀번호 재설정</h1>
        <p>이메일로 받은 재설정 코드와 새 비밀번호를 입력해주세요</p>
      </header>
      <div className="container">
        <div className="auth-form">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                {success}
                <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                  2초 후 로그인 페이지로 이동합니다...
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>

            <div className="form-group">
              <label>재설정 코드</label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                placeholder="6자리 숫자 코드"
                maxLength={6}
              />
            </div>

            <div className="form-group">
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="최소 6자 이상"
              />
            </div>

            <div className="form-group">
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>

            <button type="submit" disabled={loading || !!success} className="submit-btn">
              {loading ? '재설정 중...' : '비밀번호 재설정'}
            </button>
          </form>

          <p className="auth-link">
            <Link href="/auth/forgot-password">재설정 코드 다시 받기</Link> | 
            <Link href="/auth/signin"> 로그인으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </>
  )
}
