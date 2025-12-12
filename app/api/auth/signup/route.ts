import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const existingUser = await db.collection('users').findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 존재하는 이메일입니다' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user'

    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date()
    })

    return NextResponse.json({
      message: '회원가입이 완료되었습니다',
      userId: result.insertedId
    })
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
