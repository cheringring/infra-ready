'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  initialCompanies: string[]
}

export default function CompanyClient({ initialCompanies }: Props) {
  const router = useRouter()
  const [companies, setCompanies] = useState(initialCompanies)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCompany, setNewCompany] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    shortAnswer: '',
    detailedAnswer: ''
  })

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: newCompany })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setCompanies([...companies, newCompany])
        setNewCompany('')
        setShowAddForm(false)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('기업 추가 중 오류가 발생했습니다')
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompany) return

    try {
      const response = await fetch('/api/company/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: selectedCompany,
          ...newQuestion
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setNewQuestion({ question: '', shortAnswer: '', detailedAnswer: '' })
        setShowQuestionForm(false)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('질문 추가 중 오류가 발생했습니다')
    }
  }

  const handleDeleteCompany = async (companyName: string) => {
    if (!confirm(`${companyName} 폴더를 삭제하시겠습니까?`)) return

    try {
      const response = await fetch('/api/company/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setCompanies(companies.filter(c => c !== companyName))
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="company-container">
      <Link href="/" className="back-link">← 홈으로 돌아가기</Link>
      
      <div className="section-header">
        <h2>기업 목록 ({companies.length}개)</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-btn"
        >
          {showAddForm ? '취소' : '+ 기업 추가'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCompany} className="add-form">
          <div className="form-group">
            <label>기업명</label>
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="예: 카카오, 네이버, 쿠팡"
              required
            />
          </div>
          <button type="submit" className="submit-btn">추가</button>
        </form>
      )}

      <div className="company-grid">
        {companies.map((company) => (
          <div key={company} className="company-card">
            <h3>{company}</h3>
            <div className="company-actions">
              <Link 
                href={`/category/company/${company}`}
                className="view-btn"
              >
                질문 보기
              </Link>
              <button
                onClick={() => {
                  setSelectedCompany(company)
                  setShowQuestionForm(true)
                }}
                className="add-question-btn"
              >
                질문 추가
              </button>
              <button
                onClick={() => handleDeleteCompany(company)}
                className="delete-btn"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {showQuestionForm && selectedCompany && (
        <div className="modal-overlay" onClick={() => setShowQuestionForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedCompany} 질문 추가</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label>질문</label>
                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  placeholder="예: 대규모 트래픽 처리 경험이 있나요?"
                  required
                />
              </div>
              <div className="form-group">
                <label>간단한 답변</label>
                <textarea
                  value={newQuestion.shortAnswer}
                  onChange={(e) => setNewQuestion({...newQuestion, shortAnswer: e.target.value})}
                  placeholder="2-3문장으로 요약"
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>상세 답변 (선택)</label>
                <textarea
                  value={newQuestion.detailedAnswer}
                  onChange={(e) => setNewQuestion({...newQuestion, detailedAnswer: e.target.value})}
                  placeholder="마크다운 형식으로 작성 가능"
                  rows={10}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">추가</button>
                <button 
                  type="button" 
                  onClick={() => setShowQuestionForm(false)}
                  className="cancel-btn"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .company-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 30px 0 20px;
        }

        .add-btn {
          background: #ff6b9d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .add-btn:hover {
          background: #ff4d7d;
        }

        .add-form {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .submit-btn {
          background: #ff6b9d;
          color: white;
          border: none;
          padding: 10px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .submit-btn:hover {
          background: #ff4d7d;
        }

        .company-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .company-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .company-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .company-card h3 {
          margin: 0 0 15px 0;
          color: #ff6b9d;
          font-size: 20px;
        }

        .company-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .view-btn,
        .add-question-btn,
        .delete-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          text-align: center;
          text-decoration: none;
        }

        .view-btn {
          background: #ff6b9d;
          color: white;
        }

        .view-btn:hover {
          background: #ff4d7d;
        }

        .add-question-btn {
          background: #ffa6c1;
          color: white;
        }

        .add-question-btn:hover {
          background: #ff8db0;
        }

        .delete-btn {
          background: #f44336;
          color: white;
        }

        .delete-btn:hover {
          background: #d32f2f;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          margin-top: 0;
          color: #ff6b9d;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel-btn {
          background: #999;
          color: white;
          border: none;
          padding: 10px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .cancel-btn:hover {
          background: #777;
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
      `}</style>
    </div>
  )
}
