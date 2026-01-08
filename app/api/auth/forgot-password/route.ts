import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // 사용자 확인
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      // 보안상 사용자가 존재하지 않아도 성공 메시지 반환
      return NextResponse.json({
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
      })
    }

    // 재설정 토큰 생성 (6자리 숫자)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10분 후 만료

    // 토큰을 데이터베이스에 저장
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date()
        }
      }
    )

    // 실제 환경에서는 이메일 서비스를 통해 토큰을 전송해야 합니다
    // 개발 환경에서는 콘솔에 토큰을 출력합니다
    console.log(`🔐 비밀번호 재설정 코드 for ${email}: ${resetToken}`)
    console.log(`⏰ 만료 시간: ${resetTokenExpiry.toLocaleString('ko-KR')}`)

    return NextResponse.json({
      message: '비밀번호 재설정 코드가 생성되었습니다.',
      email: email,
      // 개발 환경에서만 토큰 반환 (실제 환경에서는 제거해야 함)
      resetToken: resetToken,
      expiresAt: resetTokenExpiry.toISOString(),
      developmentMode: true
    })
  } catch (error) {
    console.error('비밀번호 재설정 요청 오류:', error)
    return NextResponse.json(
      { error: '비밀번호 재설정 요청 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
