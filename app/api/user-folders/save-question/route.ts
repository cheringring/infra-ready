import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { folderId, categoryId, questionId, question, shortAnswer } = await request.json()

    if (!folderId || !categoryId || !questionId || !question) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // 폴더 존재 확인
    const folder = await db.collection('user_question_folders').findOne({
      _id: new ObjectId(folderId),
      userId: session.user.id
    })

    if (!folder) {
      return NextResponse.json({ error: '폴더를 찾을 수 없습니다' }, { status: 404 })
    }

    // 이미 저장된 질문인지 확인
    const existingQuestion = await db.collection('saved_questions').findOne({
      userId: session.user.id,
      folderId: new ObjectId(folderId),
      categoryId,
      questionId
    })

    if (existingQuestion) {
      return NextResponse.json(
        { error: '이미 이 폴더에 저장된 질문입니다' },
        { status: 400 }
      )
    }

    // 질문 저장
    const result = await db.collection('saved_questions').insertOne({
      userId: session.user.id,
      folderId: new ObjectId(folderId),
      categoryId,
      questionId,
      question,
      shortAnswer: shortAnswer || '',
      savedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      savedQuestionId: result.insertedId.toString(),
      message: `"${folder.name}" 폴더에 질문이 저장되었습니다`
    })
  } catch (error) {
    console.error('질문 저장 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
