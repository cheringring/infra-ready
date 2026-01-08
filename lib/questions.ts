import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const questionsDirectory = path.join(process.cwd(), 'questions')

export interface Question {
  id: string
  category: string
  question: string
  shortAnswer: string
  detailedAnswer: string
}

export interface Category {
  id: string
  name: string
  description: string
  count: number
}

const categories: Record<string, { name: string; description: string }> = {
  network: { name: '네트워크', description: 'OSI 모델, TCP/IP, DNS 등' },
  linux: { name: 'Linux', description: '리눅스 시스템 관리 및 명령어' },
  cloud: { name: '클라우드', description: 'AWS, Azure, GCP 등 클라우드 서비스' },
  container: { name: '컨테이너', description: 'Docker, Kubernetes 등' },
  cicd: { name: 'CI/CD', description: '지속적 통합 및 배포' },
  java: { name: 'Java', description: 'Java 기초, JVM, Spring Framework 등' },
  company: { name: '기업별 질문', description: '카카오, 네이버, 쿠팡 등 기업별 예상 질문' },
}

export function getCategories(): Category[] {
  return Object.entries(categories).map(([id, info]) => {
    const categoryPath = path.join(questionsDirectory, id)
    let count = 0
    if (fs.existsSync(categoryPath)) {
      count = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md')).length
    }
    return {
      id,
      name: info.name,
      description: info.description,
      count,
    }
  })
}

export function getCategoryInfo(categoryId: string) {
  return {
    id: categoryId,
    ...categories[categoryId],
  }
}

export function getQuestionsByCategory(categoryId: string): Question[] {
  const categoryPath = path.join(questionsDirectory, categoryId)
  
  if (!fs.existsSync(categoryPath)) {
    return []
  }

  const fileNames = fs.readdirSync(categoryPath)
  const questions = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(categoryPath, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        id,
        category: categories[categoryId].name,
        question: data.question,
        shortAnswer: data.shortAnswer,
        detailedAnswer: content,
      }
    })

  return questions
}

export function getQuestionDetail(categoryId: string, questionId: string): Question {
  const fullPath = path.join(questionsDirectory, categoryId, `${questionId}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    id: questionId,
    category: categories[categoryId].name,
    question: data.question,
    shortAnswer: data.shortAnswer,
    detailedAnswer: content,
  }
}
