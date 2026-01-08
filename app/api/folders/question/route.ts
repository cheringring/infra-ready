import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { folderId, question, shortAnswer, detailedAnswer } = await request.json()

    if (!folderId || !question || !shortAnswer) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // 폴더가 사용자의 것인지 확인
    const folder = await db.collection('user_folders').findOne({
      _id: new ObjectId(folderId),
      userId: session.user.id
    })

    if (!folder) {
      return NextResponse.json({ error: '폴더를 찾을 수 없습니다' }, { status: 404 })
    }

    const result = await db.collection('user_questions').insertOne({
      folderId,
      userId: session.user.id,
      question: question.trim(),
      shortAnswer: shortAnswer.trim(),
      detailedAnswer: detailedAnswer?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // 폴더 업데이트 시간 갱신
    await db.collection('user_folders').updateOne(
      { _id: new ObjectId(folderId) },
      { $set: { updatedAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      questionId: result.insertedId.toString(),
      message: '질문이 추가되었습니다'
    })
  } catch (error) {
    console.error('질문 추가 오류:', error)
    return NextResponse.json(
      { error: '질문 추가 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
