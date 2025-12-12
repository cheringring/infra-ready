import Link from 'next/link'
import { getQuestionDetail } from '@/lib/questions'
import { marked } from 'marked'

export default function QuestionDetailPage({ 
  params 
}: { 
  params: { id: string; questionId: string } 
}) {
  const question = getQuestionDetail(params.id, params.questionId)
  const detailHtml = marked(question.detailedAnswer)

  return (
    <>
      <header>
        <h1>상세 설명</h1>
      </header>
      <div className="container">
        <Link href={`/category/${params.id}`} className="back-link">
          ← {question.category}로 돌아가기
        </Link>
        <div className="detail-content">
          <h1>{question.question}</h1>
          <div dangerouslySetInnerHTML={{ __html: detailHtml }} />
        </div>
      </div>
    </>
  )
}
