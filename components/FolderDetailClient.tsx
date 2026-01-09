'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Question {
  _id: string
  question: string
  shortAnswer: string
  detailedAnswer?: string
  createdAt: Date
}

interface Folder {
  _id: string
  name: string
  description: string
  createdAt: Date
  questions: Question[]
}

interface Props {
  folder: Folder
}

export default function FolderDetailClient({ folder }: Props) {
  const router = useRouter()
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    shortAnswer: '',
    detailedAnswer: ''
  })

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user-folders/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: folder._id,
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('질문을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/user-folders/question/${questionId}`, {
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
    <div className="folder-detail-page">
      {/* 뒤로가기 버튼 */}
      <div className="folder-detail-header">
        <Link href="/mypage" className="back-link">
          ← 내 질문 모음으로 돌아가기
        </Link>
      </div>

      {/* 폴더 정보 */}
      <div className="folder-info-card">
        <div className="folder-title-section">
          <h1>📁 {folder.name}</h1>
          <div className="folder-meta">
            <span className="question-count">{folder.questions.length}개 질문</span>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="add-question-btn"
            >
              + 질문 추가
            </button>
          </div>
        </div>
        {folder.description && (
          <p className="folder-description">{folder.description}</p>
        )}
      </div>

      {/* 질문 목록 */}
      <div className="questions-container">
        {folder.questions.length === 0 ? (
          <div className="empty-state">
            <p>아직 저장된 질문이 없습니다.</p>
            <button
              onClick={() => setShowQuestionForm(true)}
              className="add-first-question-btn"
            >
              첫 번째 질문 추가하기
            </button>
          </div>
        ) : (
          <div className="questions-grid">
            {folder.questions.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <h3>Q: {question.question}</h3>
                  <button
                    onClick={() => handleDeleteQuestion(question._id)}
                    className="delete-question-btn"
                  >
                    ✕
                  </button>
                </div>
                <div className="answer">
                  <strong>A:</strong> {question.shortAnswer}
                </div>
                {question.detailedAnswer && (
                  <details className="detailed-answer">
                    <summary>상세 답변 보기</summary>
                    <div className="detailed-content">
                      {question.detailedAnswer}
                    </div>
                  </details>
                )}
                <div className="question-date">
                  {new Date(question.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 질문 추가 모달 */}
      {showQuestionForm && (
        <div className="modal-overlay" onClick={() => setShowQuestionForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>질문 추가</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label>질문</label>
                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  placeholder="예: Docker와 VM의 차이점은?"
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
                  placeholder="더 자세한 설명을 작성하세요"
                  rows={8}
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
    </div>
  )
}
