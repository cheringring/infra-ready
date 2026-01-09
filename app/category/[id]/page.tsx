import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import QuestionCard from '@/components/QuestionCard'

interface Question {
  id: string
  category: string
  question: string
  shortAnswer: string
  detailedAnswer: string
}

function getQuestionsByCategory(categoryId: string): Question[] {
  try {
    const questionsDirectory = path.join(process.cwd(), 'questions')
    const categoryPath = path.join(questionsDirectory, categoryId)
    
    if (!fs.existsSync(categoryPath)) {
      return []
    }

    const fileNames = fs.readdirSync(categoryPath)
    const questions = fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(fileName => {
        try {
          const id = fileName.replace(/\.md$/, '')
          const fullPath = path.join(categoryPath, fileName)
          const fileContents = fs.readFileSync(fullPath, 'utf8')
          const { data, content } = matter(fileContents)

          return {
            id,
            category: getCategoryName(categoryId),
            question: data.question || '',
            shortAnswer: data.shortAnswer || '',
            detailedAnswer: content || '',
          }
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error)
          return null
        }
      })
      .filter(Boolean) as Question[]

    return questions
  } catch (error) {
    console.error('Error loading questions:', error)
    return []
  }
}

function getCategoryName(id: string): string {
  const names: Record<string, string> = {
    network: '네트워크',
    linux: 'Linux', 
    cloud: '클라우드',
    container: '컨테이너',
    cicd: 'CI/CD',
    java: 'Java',
    company: '기업별 질문',
    database: '데이터베이스',
    python: 'Python',
    portfolio: '포트폴리오'
  }
  return names[id] || id
}

function getCategoryDescription(id: string): string {
  const descriptions: Record<string, string> = {
    network: 'OSI 모델, TCP/IP, DNS 등',
    linux: '리눅스 시스템 관리 및 명령어',
    cloud: 'AWS, Azure, GCP 등 클라우드 서비스',
    container: 'Docker, Kubernetes 등',
    cicd: '지속적 통합 및 배포',
    java: 'Java 기초, JVM, Spring Framework 등',
    company: '카카오, 네이버, 쿠팡 등 기업별 예상 질문',
    database: 'SQL, NoSQL, 데이터 모델링 등',
    python: 'Python 기초, 웹 개발, 데이터 처리 등',
    portfolio: '프로젝트 및 경험 관련 질문'
  }
  return descriptions[id] || `${id} 관련 질문들`
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const questions = getQuestionsByCategory(params.id)
  const categoryName = getCategoryName(params.id)
  const categoryDescription = getCategoryDescription(params.id)

  return (
    <>
      <header>
        <h1>{categoryName}</h1>
        <p>{categoryDescription}</p>
      </header>
      <div className="container">
        <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>아직 준비된 질문이 없습니다.</p>
            <p>곧 다양한 {categoryName} 관련 질문들을 추가할 예정입니다.</p>
          </div>
        ) : (
          <div className="questions-grid">
            {questions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                categoryId={params.id} 
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
