import Link from 'next/link'
import { getQuestionsByCategory, getCategoryInfo } from '@/lib/questions'
import QuestionCard from '@/components/QuestionCard'

export default function CategoryPage({ params }: { params: { id: string } }) {
  const questions = getQuestionsByCategory(params.id)
  const categoryInfo = getCategoryInfo(params.id)

  return (
    <>
      <header>
        <h1>{categoryInfo.name}</h1>
        <p>{categoryInfo.description}</p>
      </header>
      <div className="container">
        <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
        <div className="questions-grid">
          {questions.map((q) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              categoryId={params.id} 
            />
          ))}
        </div>
      </div>
    </>
  )
}
