import Link from 'next/link'

export default function CategoryPage({ params }: { params: { id: string } }) {
  // 간단한 카테고리 매핑
  const getCategoryName = (id: string) => {
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

  const getCategoryDescription = (id: string) => {
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

  return (
    <>
      <header>
        <h1>{getCategoryName(params.id)}</h1>
        <p>{getCategoryDescription(params.id)}</p>
      </header>
      <div className="container">
        <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
        <div className="empty-state">
          <p>질문 목록을 준비 중입니다.</p>
          <p>곧 다양한 {getCategoryName(params.id)} 관련 질문들을 만나보실 수 있습니다.</p>
        </div>
      </div>
    </>
  )
}
