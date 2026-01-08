import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { companyName, question, shortAnswer, detailedAnswer } = await request.json()

    if (!companyName || !question || !shortAnswer) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'questions', 'company', `${companyName}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '기업 파일을 찾을 수 없습니다' }, { status: 404 })
    }

    // 기존 파일 읽기
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // 새 질문 추가
    const newQuestionSection = `

### ${question}

**답변**:
${shortAnswer}

${detailedAnswer ? `\n**상세 답변**:\n${detailedAnswer}\n` : ''}
`

    const updatedContent = content + newQuestionSection

    // 파일 업데이트
    const updatedFile = matter.stringify(updatedContent, data)
    fs.writeFileSync(filePath, updatedFile, 'utf-8')

    return NextResponse.json({
      success: true,
      message: '질문이 추가되었습니다'
    })
  } catch (error) {
    console.error('질문 추가 오류:', error)
    return NextResponse.json(
      { error: '질문 추가 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
