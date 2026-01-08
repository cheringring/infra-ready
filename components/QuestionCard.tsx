'use client'

import { useState } from 'react'
import Link from 'next/link'
import FavoriteButton from './FavoriteButton'
import SaveQuestionButton from './SaveQuestionButton'

interface Question {
  id: string
  category: string
  question: string
  shortAnswer: string
}

interface QuestionCardProps {
  question: Question
  categoryId: string
}

// 질문에서 키워드를 추출하고 아이콘을 매핑하는 함수
function getKeywordIcon(question: string): { icon: string; keyword: string } {
  const keywords = [
    { words: ['클라우드', 'cloud', 'aws', 'azure', 'gcp'], icon: '☁️', keyword: '클라우드' },
    { words: ['보안', 'security', 'iam', '인증', '권한'], icon: '🔒', keyword: '보안' },
    { words: ['네트워크', 'network', 'tcp', 'ip', 'dns'], icon: '🌐', keyword: '네트워크' },
    { words: ['데이터베이스', 'database', 'db', 'sql'], icon: '🗄️', keyword: 'DB' },
    { words: ['컨테이너', 'container', 'docker', 'kubernetes'], icon: '📦', keyword: '컨테이너' },
    { words: ['모니터링', 'monitoring', '로그', 'log'], icon: '📊', keyword: '모니터링' },
    { words: ['배포', 'deploy', 'cicd', 'pipeline'], icon: '🚀', keyword: '배포' },
    { words: ['리눅스', 'linux', '명령어', 'command'], icon: '🐧', keyword: 'Linux' },
    { words: ['자바', 'java', 'jvm', 'spring'], icon: '☕', keyword: 'Java' },
    { words: ['성능', 'performance', '최적화', 'optimization'], icon: '⚡', keyword: '성능' },
    { words: ['아키텍처', 'architecture', '설계', 'design'], icon: '🏗️', keyword: '아키텍처' },
    { words: ['api', 'rest', 'http'], icon: '🔗', keyword: 'API' }
  ]

  const lowerQuestion = question.toLowerCase()
  
  for (const keywordGroup of keywords) {
    if (keywordGroup.words.some(word => lowerQuestion.includes(word))) {
      return { icon: keywordGroup.icon, keyword: keywordGroup.keyword }
    }
  }
  
  return { icon: '❓', keyword: '기타' }
}

export default function QuestionCard({ question, categoryId }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { icon, keyword } = getKeywordIcon(question.question)

  return (
    <div className="question-card">
      <div 
        className="question-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="question-preview">
          <div className="keyword-badge">
            <span className="keyword-icon">{icon}</span>
            <span className="keyword-text">{keyword}</span>
          </div>
          <h3 className="question-title">
            {question.question.length > 60 
              ? question.question.substring(0, 60) + '...' 
              : question.question
            }
          </h3>
        </div>
        <div className="expand-controls">
          <SaveQuestionButton 
            categoryId={categoryId}
            questionId={question.id}
            question={question.question}
            shortAnswer={question.shortAnswer}
          />
          <FavoriteButton categoryId={categoryId} questionId={question.id} />
          <button className="expand-btn">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="question-card-content">
          <div className="full-question">
            <strong>Q:</strong> {question.question}
          </div>
          <div className="answer">
            <strong>A:</strong> {question.shortAnswer}
          </div>
          <div className="question-actions">
            <Link 
              href={`/category/${categoryId}/${question.id}`}
              className="detail-link"
            >
              자세히 보기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
