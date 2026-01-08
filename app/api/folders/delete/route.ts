import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { folderId } = await request.json()

    if (!folderId) {
      return NextResponse.json({ error: '폴더 ID가 필요합니다' }, { status: 400 })
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

    // 폴더 안의 모든 질문 삭제
    await db.collection('user_questions').deleteMany({ folderId })

    // 폴더 삭제
    await db.collection('user_folders').deleteOne({ _id: new ObjectId(folderId) })

    return NextResponse.json({
      success: true,
      message: '폴더가 삭제되었습니다'
    })
  } catch (error) {
    console.error('폴더 삭제 오류:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
