import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { email, resetToken, newPassword } = await request.json()

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // 사용자 및 토큰 확인
    const user = await db.collection('users').findOne({
      email,
      resetToken,
      resetTokenExpiry: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 재설정 코드입니다' },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 비밀번호 업데이트 및 토큰 제거
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    )

    return NextResponse.json({
      message: '비밀번호가 성공적으로 재설정되었습니다'
    })
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error)
    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
