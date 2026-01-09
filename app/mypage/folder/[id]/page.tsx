import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import FolderDetailClient from '../../../../components/FolderDetailClient'

interface Question {
  _id: string
  question: string
  shortAnswer: string
  detailedAnswer?: string
  createdAt: Date
}

interface Folder {
  _id: string
  name: string
  description: string
  createdAt: Date
  questions: Question[]
}

async function getFolder(folderId: string, userId: string): Promise<Folder | null> {
  try {
    const client = await clientPromise
    const db = client.db('interview_questions')
    
    const folder = await db.collection('user_folders').findOne({
      _id: new ObjectId(folderId),
      userId: userId
    })

    if (!folder) return null

    // 폴더의 질문들 가져오기
    const questions = await db.collection('user_questions').find({
      folderId: folderId
    }).sort({ createdAt: -1 }).toArray()

    return {
      _id: folder._id.toString(),
      name: folder.name,
      description: folder.description || '',
      createdAt: folder.createdAt,
      questions: questions.map(q => ({
        _id: q._id.toString(),
        question: q.question,
        shortAnswer: q.shortAnswer,
        detailedAnswer: q.detailedAnswer,
        createdAt: q.createdAt
      }))
    }
  } catch (error) {
    console.error('폴더 조회 오류:', error)
    return null
  }
}

export default async function FolderDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return (
      <div className="container">
        <p>로그인이 필요합니다.</p>
      </div>
    )
  }

  const folder = await getFolder(params.id, session.user.email)

  if (!folder) {
    notFound()
  }

  return (
    <div className="container">
      <FolderDetailClient folder={folder} />
    </div>
  )
}
