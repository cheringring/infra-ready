import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export default function CompanyDetailPage({ params }: { params: { name: string } }) {
  const filePath = path.join(process.cwd(), 'questions', 'company', `${params.name}.md`)
  
  if (!fs.existsSync(filePath)) {
    return (
      <div className="container">
        <h1>기업을 찾을 수 없습니다</h1>
        <Link href="/category/company">← 기업 목록으로</Link>
      </div>
    )
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  const htmlContent = marked(content)

  return (
    <>
      <header>
        <h1>{params.name}</h1>
        <p>{data.shortAnswer}</p>
      </header>
      <div className="container">
        <Link href="/category/company" className="back-link">← 기업 목록으로</Link>
        
        <div className="question-detail">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </>
  )
}
