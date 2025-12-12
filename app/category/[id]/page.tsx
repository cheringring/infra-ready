import Link from 'next/link'
import { getQuestionsByCategory, getCategoryInfo } from '@/lib/questions'
import FavoriteButton from '@/components/FavoriteButton'

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
        <div className="question-list">
          {questions.map((q) => (
            <div key={q.id} className="question-item">
              <div className="question-header">
                <h3>Q: {q.question}</h3>
                <FavoriteButton categoryId={params.id} questionId={q.id} />
              </div>
              <div className="answer">
                <strong>A:</strong> {q.shortAnswer}
              </div>
              <Link 
                href={`/category/${params.id}/${q.id}`}
                className="detail-link"
              >
                자세히 보기 →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
