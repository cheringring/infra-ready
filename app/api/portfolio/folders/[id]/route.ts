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

    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: '폴더 이름을 입력해주세요' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Check if folder name already exists for this user (excluding current folder)
    const existingFolder = await db.collection('question_folders').findOne({
      userId: auth.userId,
      name,
      _id: { $ne: new ObjectId(params.id) }
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: '이미 존재하는 폴더 이름입니다' },
        { status: 400 }
      )
    }

    const result = await db.collection('question_folders').updateOne(
      { _id: new ObjectId(params.id), userId: auth.userId },
      {
        $set: {
          name,
          description: description || '',
          color: color || '#3B82F6',
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: '폴더를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '폴더가 수정되었습니다' })
  } catch (error) {
    console.error('폴더 수정 오류:', error)
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

    // Check if folder has questions
    const questionsInFolder = await db.collection('portfolio_questions').countDocuments({
      folderId: params.id,
      userId: auth.userId
    })

    if (questionsInFolder > 0) {
      return NextResponse.json(
        { error: '폴더에 질문이 있어 삭제할 수 없습니다. 먼저 질문들을 다른 폴더로 이동하거나 삭제해주세요.' },
        { status: 400 }
      )
    }

    const result = await db.collection('question_folders').deleteOne({
      _id: new ObjectId(params.id),
      userId: auth.userId
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: '폴더를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: '폴더가 삭제되었습니다' })
  } catch (error) {
    console.error('폴더 삭제 오류:', error)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
