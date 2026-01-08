import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth-check'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { question, suggestedAnswer } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('portfolio_questions').updateOne(
      { _id: new ObjectId(params.id), userId: auth.userId },
      {
        $set: {
          question,
          suggestedAnswer,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: '질문을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '질문이 수정되었습니다' })
  } catch (error) {
    console.error('질문 수정 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('portfolio_questions').deleteOne({
      _id: new ObjectId(params.id),
      userId: auth.userId
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: '질문을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '질문이 삭제되었습니다' })
  } catch (error) {
    console.error('질문 삭제 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
