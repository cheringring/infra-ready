import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth-check'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const questions = await db.collection('portfolio_questions')
      .find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(questions)
  } catch (error) {
    console.error('질문 조회 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { question, suggestedAnswer } = await request.json()

    if (!question || !suggestedAnswer) {
      return NextResponse.json(
        { error: '질문과 답변을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('portfolio_questions').insertOne({
      userId: auth.userId,
      question,
      suggestedAnswer,
      category: 'portfolio',
      isAIGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      questionId: result.insertedId.toString(),
      message: '질문이 추가되었습니다'
    })
  } catch (error) {
    console.error('질문 추가 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
