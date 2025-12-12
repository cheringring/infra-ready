'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  categoryId: string
  questionId: string
}

export default function FavoriteButton({ categoryId, questionId }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      checkFavorite()
    }
  }, [session])

  const checkFavorite = async () => {
    try {
      const response = await fetch('/api/favorites')
      const favorites = await response.json()
      const exists = favorites.some(
        (fav: any) => fav.categoryId === categoryId && fav.questionId === questionId
      )
      setIsFavorite(exists)
    } catch (error) {
      console.error('찜 확인 오류:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!session) {
      alert('로그인이 필요합니다')
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, questionId })
      })

      const data = await response.json()
      setIsFavorite(data.isFavorite)
    } catch (error) {
      console.error('찜 처리 오류:', error)
      alert('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`favorite-btn ${isFavorite ? 'active' : ''}`}
    >
      {isFavorite ? '❤️ 찜 해제' : '🤍 찜하기'}
    </button>
  )
}
