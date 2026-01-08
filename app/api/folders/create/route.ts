import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: '폴더명을 입력해주세요' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // 같은 이름의 폴더가 있는지 확인
    const existingFolder = await db.collection('user_folders').findOne({
      userId: session.user.id,
      name: name.trim()
    })

    if (existingFolder) {
      return NextResponse.json({ error: '이미 같은 이름의 폴더가 있습니다' }, { status: 400 })
    }

    const result = await db.collection('user_folders').insertOne({
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || '',
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
    return NextResponse.json(
      { error: '폴더 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
