import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: '이름을 입력해주세요' },
        { status: 400 }
      )
    }

    // 관리자 관련 검색어 차단
    if (name.toLowerCase().includes('관리자') || name.toLowerCase().includes('admin')) {
      console.log(`🚫 관리자 계정 검색 차단: "${name}"`)
      return NextResponse.json({
        message: '해당 이름으로 가입된 계정을 찾을 수 없습니다.',
        emails: []
      })
    }

    const client = await clientPromise
    const db = client.db()

    // 이름으로 사용자 찾기 (관리자 계정 제외)
    const users = await db.collection('users').find(
      { 
        name: { $regex: new RegExp(name, 'i') },
        role: { $ne: 'admin' } // 관리자 계정 제외
      },
      { projection: { email: 1, name: 1, createdAt: 1, role: 1 } }
    ).toArray()

    if (users.length === 0) {
      return NextResponse.json({
        message: '해당 이름으로 가입된 계정을 찾을 수 없습니다.',
        emails: []
      })
    }

    // 이메일 마스킹 처리
    const maskedEmails = users.map(user => {
      const email = user.email
      const [localPart, domain] = email.split('@')
      const maskedLocal = localPart.length > 2 
        ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
        : localPart.substring(0, 1) + '*'
      
      return {
        email: `${maskedLocal}@${domain}`,
        fullEmail: email, // 개발 환경에서만 표시
        createdAt: user.createdAt
      }
    })

    console.log(`📧 아이디 찾기 결과 for ${name}:`, users.map(u => u.email))

    return NextResponse.json({
      message: `${users.length}개의 계정을 찾았습니다.`,
      emails: maskedEmails,
      developmentMode: true
    })
  } catch (error) {
    console.error('아이디 찾기 오류:', error)
    return NextResponse.json(
      { error: '아이디 찾기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
