import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // 질문이 사용자의 것인지 확인
    const question = await db.collection('user_questions').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    })

    if (!question) {
      return NextResponse.json({ error: '질문을 찾을 수 없습니다' }, { status: 404 })
    }

    await db.collection('user_questions').deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({
      success: true,
      message: '질문이 삭제되었습니다'
    })
  } catch (error) {
    console.error('질문 삭제 오류:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
