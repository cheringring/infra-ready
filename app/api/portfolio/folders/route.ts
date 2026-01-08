import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth-check'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const folders = await db.collection('question_folders')
      .find({ userId: auth.userId })
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
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: '폴더 이름을 입력해주세요' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Check if folder name already exists for this user
    const existingFolder = await db.collection('question_folders').findOne({
      userId: auth.userId,
      name
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: '이미 존재하는 폴더 이름입니다' },
        { status: 400 }
      )
    }

    const result = await db.collection('question_folders').insertOne({
      userId: auth.userId,
      name,
      description: description || '',
      color: color || '#3B82F6',
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
