'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '비밀번호 재설정 요청에 실패했습니다')
      } else {
        setSuccess(data.message)
        // 개발 환경에서 토큰이 반환되면 표시
        if (data.resetToken) {
          setResetToken(data.resetToken)
          console.log('🔐 재설정 코드:', data.resetToken)
        }
      }
    } catch (error) {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header>
        <h1>비밀번호 찾기</h1>
        <p>가입하신 이메일 주소를 입력해주세요</p>
      </header>
      <div className="container">
        <div className="auth-form">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                {success}
                {resetToken && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f0f8ff', borderRadius: '4px' }}>
                    <strong>개발 환경 - 재설정 코드: {resetToken}</strong>
                  </div>
                )}
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

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? '전송 중...' : '재설정 코드 받기'}
            </button>
          </form>

          {success && (
            <div className="reset-link">
              <Link href="/auth/reset-password" className="auth-link">
                재설정 코드가 있으신가요? 비밀번호 재설정하기
              </Link>
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
