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

        <style jsx>{`
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }

          .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #ff6b9d;
            text-decoration: none;
          }

          .back-link:hover {
            text-decoration: underline;
          }

          .question-detail {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          :global(.markdown-content h2) {
            color: #ff6b9d;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ffa6c1;
          }

          :global(.markdown-content h3) {
            color: #333;
            margin-top: 25px;
            margin-bottom: 12px;
          }

          :global(.markdown-content h4) {
            color: #666;
            margin-top: 20px;
            margin-bottom: 10px;
          }

          :global(.markdown-content p) {
            line-height: 1.8;
            margin-bottom: 15px;
          }

          :global(.markdown-content ul, .markdown-content ol) {
            margin-left: 20px;
            margin-bottom: 15px;
          }

          :global(.markdown-content li) {
            margin-bottom: 8px;
            line-height: 1.6;
          }

          :global(.markdown-content code) {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
          }

          :global(.markdown-content pre) {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 15px;
          }

          :global(.markdown-content pre code) {
            background: none;
            padding: 0;
          }

          :global(.markdown-content table) {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          :global(.markdown-content th, .markdown-content td) {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }

          :global(.markdown-content th) {
            background: #ffa6c1;
            color: white;
            font-weight: 600;
          }

          :global(.markdown-content blockquote) {
            border-left: 4px solid #ff6b9d;
            padding-left: 20px;
            margin: 20px 0;
            color: #666;
            font-style: italic;
          }
        `}</style>
      </div>
    </>
  )
}
