import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth-check'
import { analyzePortfolio } from '@/lib/ai-analyzer'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { portfolioId } = await request.json()

    if (!portfolioId) {
      return NextResponse.json({ error: '포트폴리오 ID가 필요합니다' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const portfolio = await db.collection('portfolios').findOne({
      _id: new ObjectId(portfolioId),
      userId: auth.userId
    })

    if (!portfolio) {
      return NextResponse.json({ error: '포트폴리오를 찾을 수 없습니다' }, { status: 404 })
    }

    const questions = await analyzePortfolio(portfolio.content, auth.userId!)

    const questionsWithPortfolioId = questions.map(q => ({
      ...q,
      portfolioId: new ObjectId(portfolioId)
    }))

    await db.collection('portfolio_questions').insertMany(questionsWithPortfolioId)

    await db.collection('portfolios').updateOne(
      { _id: new ObjectId(portfolioId) },
      { $set: { analyzedAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      count: questions.length,
      message: `${questions.length}개의 질문이 생성되었습니다`
    })
  } catch (error) {
    console.error('분석 오류:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
