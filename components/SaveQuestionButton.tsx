'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Folder {
  _id: string
  name: string
  description?: string
}

interface SaveQuestionButtonProps {
  categoryId: string
  questionId: string
  question: string
  shortAnswer: string
}

export default function SaveQuestionButton({ 
  categoryId, 
  questionId, 
  question, 
  shortAnswer 
}: SaveQuestionButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')

  useEffect(() => {
    if (session && showDropdown) {
      fetchFolders()
    }
  }, [session, showDropdown])

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/user-folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('폴더 조회 오류:', error)
    }
  }

  const handleSaveClick = () => {
    if (!session) {
      alert('로그인이 필요합니다')
      router.push('/auth/signin')
      return
    }
    setShowDropdown(!showDropdown)
  }

  const handleFolderSelect = async (folderId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/user-folders/save-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId,
          categoryId,
          questionId,
          question,
          shortAnswer
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        setShowDropdown(false)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('질문 저장 오류:', error)
      alert('저장 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/user-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // 새 폴더 생성 후 바로 질문 저장
        await handleFolderSelect(data.folderId)
        setNewFolderName('')
        setNewFolderDescription('')
        setShowNewFolderModal(false)
        fetchFolders() // 폴더 목록 새로고침
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('폴더 생성 오류:', error)
      alert('폴더 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="save-question-container">
      <button
        onClick={handleSaveClick}
        disabled={loading}
        className="save-btn"
        title="질문 저장하기"
      >
        📁 저장
      </button>

      {showDropdown && (
        <div className="save-dropdown">
          <div className="dropdown-header">폴더 선택</div>
          
          <button
            className="dropdown-item add-folder"
            onClick={() => setShowNewFolderModal(true)}
            disabled={loading}
          >
            ➕ 폴더 추가
          </button>

          {folders.length > 0 && <div className="dropdown-divider"></div>}

          {folders.map((folder) => (
            <button
              key={folder._id}
              className="dropdown-item"
              onClick={() => handleFolderSelect(folder._id)}
              disabled={loading}
            >
              📁 {folder.name}
              {folder.description && (
                <span className="folder-description">{folder.description}</span>
              )}
            </button>
          ))}

          {folders.length === 0 && (
            <div className="dropdown-empty">
              아직 폴더가 없습니다. 새 폴더를 만들어보세요!
            </div>
          )}
        </div>
      )}

      {showNewFolderModal && (
        <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>새 폴더 만들기</h3>
            <form onSubmit={handleCreateFolder}>
              <div className="form-group">
                <label>폴더 이름 *</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="예: 네트워크 질문, 중요한 질문"
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>설명 (선택사항)</label>
                <input
                  type="text"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="폴더에 대한 간단한 설명"
                  maxLength={100}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="cancel-btn"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading || !newFolderName.trim()}
                  className="create-btn"
                >
                  {loading ? '생성 중...' : '폴더 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          className="dropdown-backdrop" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  )
}
