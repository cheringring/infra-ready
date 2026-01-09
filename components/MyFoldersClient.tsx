'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  initialFolders: Folder[]
}

export default function MyFoldersClient({ initialFolders }: Props) {
  const router = useRouter()
  const [folders, setFolders] = useState(initialFolders)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null)
  const [newFolder, setNewFolder] = useState({ name: '', description: '' })
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    shortAnswer: '',
    detailedAnswer: ''
  })

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/folders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolder)
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setNewFolder({ name: '', description: '' })
        setShowFolderForm(false)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('폴더 생성 중 오류가 발생했습니다')
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFolder) return

    try {
      const response = await fetch('/api/folders/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: selectedFolder,
          ...newQuestion
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setNewQuestion({ question: '', shortAnswer: '', detailedAnswer: '' })
        setShowQuestionForm(false)
        setSelectedFolder(null)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('질문 추가 중 오류가 발생했습니다')
    }
  }

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`"${folderName}" 폴더를 삭제하시겠습니까? 폴더 안의 모든 질문도 삭제됩니다.`)) return

    try {
      const response = await fetch('/api/folders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId })
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('질문을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/folders/question/${questionId}`, {
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
    <div className="my-folders-section">
      <div className="section-header">
        <h2>내 질문 모음 ({folders.length}개 폴더)</h2>
        <button 
          onClick={() => setShowFolderForm(!showFolderForm)}
          className="add-btn"
        >
          {showFolderForm ? '취소' : '+ 폴더 추가'}
        </button>
      </div>

      {showFolderForm && (
        <form onSubmit={handleCreateFolder} className="add-form">
          <div className="form-group">
            <label>폴더명</label>
            <input
              type="text"
              value={newFolder.name}
              onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
              placeholder="예: 카카오 면접 준비, AWS 자격증 공부"
              required
            />
          </div>
          <div className="form-group">
            <label>설명 (선택)</label>
            <input
              type="text"
              value={newFolder.description}
              onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
              placeholder="폴더에 대한 간단한 설명"
            />
          </div>
          <button type="submit" className="submit-btn">생성</button>
        </form>
      )}

      {folders.length === 0 ? (
        <p className="empty-message">아직 폴더가 없습니다. 폴더를 만들어 질문을 정리해보세요!</p>
      ) : (
        <div className="folders-list">
          {folders.map((folder) => (
            <div key={folder._id} className="folder-card">
              <div className="folder-header">
                <div 
                  className="folder-title"
                  onClick={() => setExpandedFolder(expandedFolder === folder._id ? null : folder._id)}
                >
                  <div className="folder-info">
                    <h3>📁 {folder.name}</h3>
                    <span className="folder-hint">클릭하여 {expandedFolder === folder._id ? '접기' : '펼치기'}</span>
                  </div>
                  <div className="folder-status">
                    <span className="question-count">{folder.questions.length}개 질문</span>
                    <span className="expand-icon">{expandedFolder === folder._id ? '▼' : '▶'}</span>
                  </div>
                </div>
                <div className="folder-actions">
                  <button
                    onClick={() => {
                      setSelectedFolder(folder._id)
                      setShowQuestionForm(true)
                    }}
                    className="add-question-btn"
                  >
                    + 질문
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder._id, folder.name)}
                    className="delete-folder-btn"
                  >
                    삭제
                  </button>
                </div>
              </div>
              
              {folder.description && (
                <p className="folder-description">{folder.description}</p>
              )}

              {expandedFolder === folder._id && (
                <div className="questions-in-folder">
                  {folder.questions.length === 0 ? (
                    <p className="empty-message">질문이 없습니다</p>
                  ) : (
                    folder.questions.map((q) => (
                      <div key={q._id} className="question-item">
                        <div className="question-header">
                          <h4>Q: {q.question}</h4>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="delete-question-btn"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="answer">
                          <strong>A:</strong> {q.shortAnswer}
                        </div>
                        {q.detailedAnswer && (
                          <details className="detailed-answer">
                            <summary>상세 답변 보기</summary>
                            <div className="detailed-content">
                              {q.detailedAnswer}
                            </div>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showQuestionForm && selectedFolder && (
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

      <style jsx>{`
        .my-folders-section {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          color: #333;
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
          margin-bottom: 20px;
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
          font-family: inherit;
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

        .empty-message {
          text-align: center;
          color: #999;
          padding: 40px 20px;
        }

        .folders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .folder-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .folder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .folder-title {
          flex: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .folder-title:hover h3 {
          color: #ff6b9d;
        }

        .folder-title h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
          transition: color 0.2s;
        }

        .question-count {
          background: #ffa6c1;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        .folder-actions {
          display: flex;
          gap: 8px;
        }

        .add-question-btn,
        .delete-folder-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 13px;
        }

        .add-question-btn {
          background: #ffa6c1;
          color: white;
        }

        .add-question-btn:hover {
          background: #ff8db0;
        }

        .delete-folder-btn {
          background: #f44336;
          color: white;
        }

        .delete-folder-btn:hover {
          background: #d32f2f;
        }

        .folder-description {
          color: #666;
          font-size: 14px;
          margin: 10px 0;
        }

        .questions-in-folder {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .question-item {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }

        .question-header h4 {
          margin: 0;
          color: #333;
          font-size: 16px;
          flex: 1;
        }

        .delete-question-btn {
          background: #f44336;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-question-btn:hover {
          background: #d32f2f;
        }

        .answer {
          color: #666;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .detailed-answer {
          margin-top: 10px;
        }

        .detailed-answer summary {
          cursor: pointer;
          color: #ff6b9d;
          font-size: 14px;
        }

        .detailed-answer summary:hover {
          text-decoration: underline;
        }

        .detailed-content {
          margin-top: 10px;
          padding: 10px;
          background: white;
          border-radius: 6px;
          white-space: pre-wrap;
          line-height: 1.6;
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
      `}</style>
    </div>
  )
}
