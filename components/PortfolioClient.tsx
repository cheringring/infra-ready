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
  folderId?: string
  createdAt: string
}

interface Folder {
  _id: string
  name: string
  description?: string
  color?: string
  createdAt: string
}

interface Props {
  latestPortfolio: Portfolio | null
  initialQuestions: Question[]
  initialFolders: Folder[]
}

export default function PortfolioClient({ latestPortfolio, initialQuestions, initialFolders }: Props) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ question: '', suggestedAnswer: '' })
  const [newFolder, setNewFolder] = useState({ name: '', description: '', color: '#3B82F6' })
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/portfolio/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolder)
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setNewFolder({ name: '', description: '', color: '#3B82F6' })
        setShowFolderForm(false)
        router.refresh()
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('폴더 생성 중 오류가 발생했습니다')
    }
  }

  const handleMoveToFolder = async (questionId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/portfolio/questions/${questionId}/move`, {
        method: 'PUT',
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
      alert('질문 이동 중 오류가 발생했습니다')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('정말 폴더를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/portfolio/folders/${folderId}`, {
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
      alert('폴더 삭제 중 오류가 발생했습니다')
    }
  }

  const filteredQuestions = selectedFolder === 'all' 
    ? questions 
    : selectedFolder === 'unorganized'
    ? questions.filter(q => !q.folderId)
    : questions.filter(q => q.folderId === selectedFolder)

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
          <h2>면접 질문 ({questions.length}개)</h2>
          <div className="header-buttons">
            <button 
              onClick={() => setShowFolderForm(!showFolderForm)}
              className="add-btn folder-btn"
            >
              {showFolderForm ? '취소' : '📁 폴더 생성'}
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-btn"
            >
              {showAddForm ? '취소' : '+ 질문 추가'}
            </button>
          </div>
        </div>

        {showFolderForm && (
          <form onSubmit={handleCreateFolder} className="add-folder-form">
            <div className="form-group">
              <label>폴더 이름</label>
              <input
                type="text"
                value={newFolder.name}
                onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                required
                placeholder="예: 기술 면접, 인성 면접"
              />
            </div>
            <div className="form-group">
              <label>설명 (선택사항)</label>
              <input
                type="text"
                value={newFolder.description}
                onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                placeholder="폴더에 대한 간단한 설명"
              />
            </div>
            <div className="form-group">
              <label>색상</label>
              <input
                type="color"
                value={newFolder.color}
                onChange={(e) => setNewFolder({...newFolder, color: e.target.value})}
              />
            </div>
            <button type="submit" className="submit-btn">폴더 생성</button>
          </form>
        )}

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

        <div className="folder-tabs">
          <button 
            className={`tab ${selectedFolder === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFolder('all')}
          >
            전체 ({questions.length})
          </button>
          <button 
            className={`tab ${selectedFolder === 'unorganized' ? 'active' : ''}`}
            onClick={() => setSelectedFolder('unorganized')}
          >
            미분류 ({questions.filter(q => !q.folderId).length})
          </button>
          {folders.map(folder => (
            <button 
              key={folder._id}
              className={`tab ${selectedFolder === folder._id ? 'active' : ''}`}
              onClick={() => setSelectedFolder(folder._id)}
              style={{ borderColor: folder.color }}
            >
              📁 {folder.name} ({questions.filter(q => q.folderId === folder._id).length})
              <button 
                className="delete-folder-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFolder(folder._id)
                }}
              >
                ×
              </button>
            </button>
          ))}
        </div>

        <div className="question-list">
          {filteredQuestions.length === 0 ? (
            <p className="empty-message">
              {selectedFolder === 'all' 
                ? '아직 질문이 없습니다. 포트폴리오를 업로드하고 분석해보세요!'
                : selectedFolder === 'unorganized'
                ? '미분류 질문이 없습니다.'
                : '이 폴더에 질문이 없습니다.'
              }
            </p>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q._id} className="question-item portfolio-question">
                <div className="question-header">
                  <h3>Q: {q.question}</h3>
                  <div className="question-badges">
                    {q.isAIGenerated && <span className="ai-badge">🤖 AI</span>}
                    {q.folderId && (
                      <span className="folder-badge" style={{ backgroundColor: folders.find(f => f._id === q.folderId)?.color }}>
                        📁 {folders.find(f => f._id === q.folderId)?.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="answer">
                  <strong>A:</strong> {q.suggestedAnswer}
                </div>
                <div className="question-actions">
                  <select 
                    value={q.folderId || ''}
                    onChange={(e) => handleMoveToFolder(q._id, e.target.value || null)}
                    className="folder-select"
                  >
                    <option value="">미분류</option>
                    {folders.map(folder => (
                      <option key={folder._id} value={folder._id}>
                        📁 {folder.name}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleDelete(q._id)}
                    className="delete-btn"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
