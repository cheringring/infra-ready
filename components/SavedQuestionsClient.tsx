'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SavedQuestion {
  _id: string
  categoryId: string
  questionId: string
  question: string
  shortAnswer: string
  savedAt: string
}

interface QuestionFolder {
  _id: string
  name: string
  description: string
  createdAt: Date
  questions: SavedQuestion[]
}

interface Props {
  initialFolders: QuestionFolder[]
}

export default function SavedQuestionsClient({ initialFolders }: Props) {
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null)

  const handleDeleteQuestion = async (questionId: string, folderName: string) => {
    if (!confirm(`"${folderName}" 폴더에서 이 질문을 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`/api/user-folders/questions/${questionId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        window.location.reload()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  const totalQuestions = initialFolders.reduce((sum, folder) => sum + folder.questions.length, 0)

  return (
    <div className="saved-questions-section">
      <div className="section-header">
        <h2>내 질문 모음 ({totalQuestions}개 질문, {initialFolders.length}개 폴더)</h2>
      </div>

      {initialFolders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">아직 저장된 질문이 없습니다.</p>
          <p className="empty-hint">질문 페이지에서 📁 저장 버튼을 눌러 질문을 폴더에 저장해보세요!</p>
        </div>
      ) : (
        <div className="folders-list">
          {initialFolders.map((folder) => (
            <div key={folder._id} className="saved-folder-card">
              <div 
                className="folder-header"
                onClick={() => setExpandedFolder(expandedFolder === folder._id ? null : folder._id)}
              >
                <div className="folder-info">
                  <h3>📁 {folder.name}</h3>
                  {folder.description && (
                    <p className="folder-description">{folder.description}</p>
                  )}
                </div>
                <div className="folder-stats">
                  <span className="question-count">{folder.questions.length}개 질문</span>
                  <span className="expand-icon">
                    {expandedFolder === folder._id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedFolder === folder._id && (
                <div className="questions-list">
                  {folder.questions.length === 0 ? (
                    <p className="empty-folder">이 폴더에는 아직 질문이 없습니다.</p>
                  ) : (
                    folder.questions.map((question) => (
                      <div key={question._id} className="saved-question-item">
                        <div className="question-content">
                          <div className="question-text">
                            <strong>Q:</strong> {question.question}
                          </div>
                          <div className="answer-text">
                            <strong>A:</strong> {question.shortAnswer}
                          </div>
                          <div className="question-meta">
                            <span className="saved-date">
                              저장일: {new Date(question.savedAt).toLocaleDateString('ko-KR')}
                            </span>
                            <Link 
                              href={`/category/${question.categoryId}/${question.questionId}`}
                              className="view-detail-link"
                            >
                              자세히 보기 →
                            </Link>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question._id, folder.name)}
                          className="delete-question-btn"
                          title="질문 삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .saved-questions-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .section-header h2 {
          color: #ff6b9d;
          margin-bottom: 20px;
          font-size: 1.3rem;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-message {
          color: #999;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }

        .empty-hint {
          color: #666;
          font-size: 0.9rem;
        }

        .folders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .saved-folder-card {
          border: 1px solid #e9ecef;
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }

        .saved-folder-card:hover {
          box-shadow: 0 4px 12px rgba(255,107,157,0.1);
        }

        .folder-header {
          padding: 20px;
          background: #f8f9fa;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s ease;
        }

        .folder-header:hover {
          background: #f0f0f0;
        }

        .folder-info h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .folder-description {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .folder-stats {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .question-count {
          background: linear-gradient(135deg, #ff6b9d 0%, #ffa6c1 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .expand-icon {
          color: #666;
          font-size: 0.9rem;
        }

        .questions-list {
          padding: 0 20px 20px 20px;
        }

        .empty-folder {
          text-align: center;
          color: #999;
          padding: 20px;
          font-style: italic;
        }

        .saved-question-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 15px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          margin-bottom: 10px;
          background: #fafafa;
          gap: 15px;
        }

        .question-content {
          flex: 1;
        }

        .question-text {
          margin-bottom: 8px;
          color: #333;
          line-height: 1.5;
        }

        .answer-text {
          margin-bottom: 10px;
          color: #666;
          line-height: 1.5;
        }

        .question-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .saved-date {
          color: #999;
        }

        .view-detail-link {
          color: #ff6b9d;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-detail-link:hover {
          color: #ff8fb3;
          text-decoration: underline;
        }

        .delete-question-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 5px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          opacity: 0.6;
        }

        .delete-question-btn:hover {
          background: #ffe6ee;
          opacity: 1;
        }

        @media (max-width: 768px) {
          .folder-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .folder-stats {
            justify-content: space-between;
          }

          .question-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .saved-question-item {
            flex-direction: column;
            gap: 10px;
          }

          .delete-question-btn {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  )
}
