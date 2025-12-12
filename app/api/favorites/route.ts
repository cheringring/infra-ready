import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const favorites = await db.collection('favorites')
      .find({ userId: session.user.id })
      .toArray()

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('찜 목록 조회 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { categoryId, questionId } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const existing = await db.collection('favorites').findOne({
      userId: session.user.id,
      categoryId,
      questionId
    })

    if (existing) {
      await db.collection('favorites').deleteOne({ _id: existing._id })
      return NextResponse.json({ message: '찜 해제', isFavorite: false })
    } else {
      await db.collection('favorites').insertOne({
        userId: session.user.id,
        categoryId,
        questionId,
        createdAt: new Date()
      })
      return NextResponse.json({ message: '찜 추가', isFavorite: true })
    }
  } catch (error) {
    console.error('찜 처리 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
