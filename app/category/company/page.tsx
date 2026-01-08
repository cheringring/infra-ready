import CompanyClient from '@/components/CompanyClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'

export default async function CompanyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // 기업 폴더 목록 가져오기
  const companiesDir = path.join(process.cwd(), 'questions', 'company')
  let companies: string[] = []
  
  if (fs.existsSync(companiesDir)) {
    companies = fs.readdirSync(companiesDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
  }

  return (
    <>
      <header>
        <h1>기업별 질문</h1>
        <p>지원하는 기업별로 예상 질문을 정리하세요</p>
      </header>
      <div className="container">
        <CompanyClient initialCompanies={companies} />
      </div>
    </>
  )
}
