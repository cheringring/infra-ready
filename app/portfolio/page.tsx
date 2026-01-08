import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import clientPromise from '@/lib/mongodb'
import PortfolioClient from '@/components/PortfolioClient'

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  const client = await clientPromise
  const db = client.db()

  const portfolios = await db.collection('portfolios')
    .find({ userId: session.user.id })
    .sort({ uploadedAt: -1 })
    .limit(1)
    .toArray()

  const questions = await db.collection('portfolio_questions')
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  const folders = await db.collection('question_folders')
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  const latestPortfolio = portfolios[0]

  return (
    <>
      <header>
        <h1>포트폴리오 면접 준비</h1>
        <p>AI가 분석한 맞춤형 면접 질문</p>
      </header>
      <div className="container">
        <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
        
        <PortfolioClient 
          latestPortfolio={latestPortfolio ? {
            _id: latestPortfolio._id.toString(),
            fileName: latestPortfolio.fileName,
            uploadedAt: latestPortfolio.uploadedAt.toISOString(),
            analyzedAt: latestPortfolio.analyzedAt?.toISOString()
          } : null}
          initialQuestions={questions.map(q => ({
            _id: q._id.toString(),
            question: q.question,
            suggestedAnswer: q.suggestedAnswer,
            isAIGenerated: q.isAIGenerated,
            folderId: q.folderId?.toString(),
            createdAt: q.createdAt.toISOString()
          }))}
          initialFolders={folders.map(f => ({
            _id: f._id.toString(),
            name: f.name,
            description: f.description,
            color: f.color,
            createdAt: f.createdAt.toISOString()
          }))}
        />
      </div>
    </>
  )
}
