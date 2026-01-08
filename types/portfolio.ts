export interface Portfolio {
  _id?: string
  userId: string
  fileName: string
  content: string
  uploadedAt: Date
  analyzedAt?: Date
}

export interface PortfolioQuestion {
  _id?: string
  userId: string
  portfolioId?: string
  folderId?: string
  question: string
  suggestedAnswer: string
  category: 'portfolio'
  isAIGenerated: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QuestionFolder {
  _id?: string
  userId: string
  name: string
  description?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}
