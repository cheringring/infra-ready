'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Portfolio {
  _id: string
  fileName: string
  uploadedAt: string
  analyzedAt?: string
}

interface Question {
  _id: string
  question: string
  suggestedAnswer: string
  isAIGenerated: boolean
  createdAt: string
}

interface Props {
  latestPortfolio: Portfolio | null
  initialQuestions: Question[]
}

export default function PortfolioClient({ latestPortfolio, initialQuestions }: Props) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ question: '', suggestedAnswer: '' })

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setUploading(true)
    try {
      const response = await fetch('/api/portfolio/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!latestPortfolio) return

    setAnalyzing(true)
    try {
      const response = await fetch('/api/portfolio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: latestPortfolio._id })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('분석 중 오류가 발생했습니다')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/portfolio/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setNewQuestion({ question: '', suggestedAnswer: '' })
        setShowAddForm(false)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('질문 추가 중 오류가 발생했습니다')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/portfolio/questions/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="portfolio-container">
      <div className="upload-section">
        <h2>포트폴리오 업로드</h2>
        {latestPortfolio ? (
          <div className="portfolio-info">
            <p>📄 {latestPortfolio.fileName}</p>
            <p className="upload-date">
              업로드: {new Date(latestPortfolio.uploadedAt).toLocaleString('ko-KR')}
            </p>
            {!latestPortfolio.analyzedAt && (
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="analyze-btn"
              >
                {analyzing ? '분석 중...' : '🤖 AI 분석 시작'}
              </button>
            )}
            {latestPortfolio.analyzedAt && (
              <p className="analyzed-date">
                ✅ 분석 완료: {new Date(latestPortfolio.analyzedAt).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpload} className="upload-form">
            <input 
              type="file" 
              name="file" 
              accept=".pdf"
              required
              disabled={uploading}
            />
            <button type="submit" disabled={uploading} className="submit-btn">
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </form>
        )}
      </div>

      <div className="questions-section">
        <div className="section-header">
          <h2>면접 질문 ({initialQuestions.length}개)</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-btn"
          >
            {showAddForm ? '취소' : '+ 질문 추가'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddQuestion} className="add-question-form">
            <div className="form-group">
              <label>질문</label>
              <input
                type="text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>추천 답변</label>
              <textarea
                value={newQuestion.suggestedAnswer}
                onChange={(e) => setNewQuestion({...newQuestion, suggestedAnswer: e.target.value})}
                rows={4}
                required
              />
            </div>
            <button type="submit" className="submit-btn">추가</button>
          </form>
        )}

        <div className="question-list">
          {initialQuestions.length === 0 ? (
            <p className="empty-message">아직 질문이 없습니다. 포트폴리오를 업로드하고 분석해보세요!</p>
          ) : (
            initialQuestions.map((q) => (
              <div key={q._id} className="question-item portfolio-question">
                <div className="question-header">
                  <h3>Q: {q.question}</h3>
                  {q.isAIGenerated && <span className="ai-badge">🤖 AI</span>}
                </div>
                <div className="answer">
                  <strong>A:</strong> {q.suggestedAnswer}
                </div>
                <button 
                  onClick={() => handleDelete(q._id)}
                  className="delete-btn"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
