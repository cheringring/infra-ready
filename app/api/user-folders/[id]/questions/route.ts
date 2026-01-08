import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // 폴더 존재 확인
    const folder = await db.collection('user_question_folders').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    })

    if (!folder) {
      return NextResponse.json({ error: '폴더를 찾을 수 없습니다' }, { status: 404 })
    }

    // 폴더의 질문들 조회
    const questions = await db.collection('saved_questions')
      .find({ 
        userId: session.user.id,
        folderId: new ObjectId(params.id)
      })
      .sort({ savedAt: -1 })
      .toArray()

    return NextResponse.json({
      folder: {
        _id: folder._id.toString(),
        name: folder.name,
        description: folder.description
      },
      questions: questions.map(q => ({
        _id: q._id.toString(),
        categoryId: q.categoryId,
        questionId: q.questionId,
        question: q.question,
        shortAnswer: q.shortAnswer,
        savedAt: q.savedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('폴더 질문 조회 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
