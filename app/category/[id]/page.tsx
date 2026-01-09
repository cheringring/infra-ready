import Link from 'next/link'
import { getQuestionsByCategory, getCategoryInfo } from '@/lib/questions'
import QuestionCard from '@/components/QuestionCard'

export default function CategoryPage({ params }: { params: { id: string } }) {
  try {
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
          {questions.length === 0 ? (
            <div className="empty-state">
              <p>아직 준비된 질문이 없습니다.</p>
            </div>
          ) : (
            <div className="questions-grid">
              {questions.map((q) => (
                <QuestionCard 
                  key={q.id} 
                  question={q} 
                  categoryId={params.id} 
                />
              ))}
            </div>
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error('Category page error:', error)
    return (
      <>
        <header>
          <h1>오류 발생</h1>
          <p>카테고리를 불러오는 중 오류가 발생했습니다.</p>
        </header>
        <div className="container">
          <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
          <div className="error-message">
            <p>페이지를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </>
    )
  }
}
