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

    const { folderId } = await request.json()

    const client = await clientPromise
    const db = client.db()

    // Verify folder exists and belongs to user (if folderId is provided)
    if (folderId) {
      const folder = await db.collection('question_folders').findOne({
        _id: new ObjectId(folderId),
        userId: auth.userId
      })

      if (!folder) {
        return NextResponse.json({ error: '폴더를 찾을 수 없습니다' }, { status: 404 })
      }
    }

    const result = await db.collection('portfolio_questions').updateOne(
      { _id: new ObjectId(params.id), userId: auth.userId },
      {
        $set: {
          folderId: folderId ? new ObjectId(folderId) : null,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: '질문을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: folderId ? '질문이 폴더로 이동되었습니다' : '질문이 폴더에서 제거되었습니다'
    })
  } catch (error) {
    console.error('질문 이동 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
