import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const folders = await db.collection('user_question_folders')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(folders)
  } catch (error) {
    console.error('폴더 조회 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: '폴더 이름을 입력해주세요' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // 중복 폴더명 확인
    const existingFolder = await db.collection('user_question_folders').findOne({
      userId: session.user.id,
      name
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: '이미 존재하는 폴더 이름입니다' },
        { status: 400 }
      )
    }

    const result = await db.collection('user_question_folders').insertOne({
      userId: session.user.id,
      name,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      folderId: result.insertedId.toString(),
      message: '폴더가 생성되었습니다'
    })
  } catch (error) {
    console.error('폴더 생성 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
