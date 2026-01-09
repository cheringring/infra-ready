import Link from 'next/link'
import { notFound } from 'next/navigation'

// 임시로 간단한 카테고리 정보
const categories: Record<string, { name: string; description: string }> = {
  network: { name: '네트워크', description: 'OSI 모델, TCP/IP, DNS 등' },
  linux: { name: 'Linux', description: '리눅스 시스템 관리 및 명령어' },
  cloud: { name: '클라우드', description: 'AWS, Azure, GCP 등 클라우드 서비스' },
  container: { name: '컨테이너', description: 'Docker, Kubernetes 등' },
  cicd: { name: 'CI/CD', description: '지속적 통합 및 배포' },
  java: { name: 'Java', description: 'Java 기초, JVM, Spring Framework 등' },
  company: { name: '기업별 질문', description: '카카오, 네이버, 쿠팡 등 기업별 예상 질문' },
  database: { name: '데이터베이스', description: 'SQL, NoSQL, 데이터 모델링 등' },
  python: { name: 'Python', description: 'Python 기초, 웹 개발, 데이터 처리 등' },
  portfolio: { name: '포트폴리오', description: '프로젝트 및 경험 관련 질문' },
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const categoryInfo = categories[params.id]
  
  if (!categoryInfo) {
    notFound()
  }

  return (
    <>
      <header>
        <h1>{categoryInfo.name}</h1>
        <p>{categoryInfo.description}</p>
      </header>
      <div className="container">
        <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
        <div className="empty-state">
          <p>질문 목록을 준비 중입니다.</p>
          <p>곧 다양한 {categoryInfo.name} 관련 질문들을 만나보실 수 있습니다.</p>
        </div>
      </div>
    </>
  )
}
