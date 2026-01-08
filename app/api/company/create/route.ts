import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { companyName } = await request.json()

    if (!companyName || companyName.trim() === '') {
      return NextResponse.json({ error: '기업명을 입력해주세요' }, { status: 400 })
    }

    const companiesDir = path.join(process.cwd(), 'questions', 'company')
    const filePath = path.join(companiesDir, `${companyName}.md`)

    // 이미 존재하는지 확인
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: '이미 존재하는 기업입니다' }, { status: 400 })
    }

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(companiesDir)) {
      fs.mkdirSync(companiesDir, { recursive: true })
    }

    // 기본 템플릿 생성
    const template = `---
question: "${companyName} 인프라 엔지니어 예상 질문"
shortAnswer: "${companyName}에서 물어볼 만한 질문들을 정리합니다."
---

## ${companyName} 면접 예상 질문

### 1. 기술 스택

#### Q1: 질문을 추가해주세요

**답변 포인트**:
- 답변 내용을 작성하세요

### 면접 준비 팁

1. **회사 조사**
   - 기술 블로그 확인
   - 사용하는 기술 스택 파악

2. **실무 경험 준비**
   - STAR 기법으로 답변 준비
   - 구체적인 수치와 결과
`

    fs.writeFileSync(filePath, template, 'utf-8')

    return NextResponse.json({
      success: true,
      message: `${companyName} 폴더가 생성되었습니다`
    })
  } catch (error) {
    console.error('기업 생성 오류:', error)
    return NextResponse.json(
      { error: '기업 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
