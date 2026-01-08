import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth-check'
import { extractTextFromPDF } from '@/lib/pdf-parser'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDF 파일만 업로드 가능합니다' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const content = await extractTextFromPDF(buffer)

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('portfolios').insertOne({
      userId: auth.userId,
      fileName: file.name,
      content,
      uploadedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      portfolioId: result.insertedId.toString(),
      message: '포트폴리오가 업로드되었습니다'
    })
  } catch (error) {
    console.error('업로드 오류:', error)
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
