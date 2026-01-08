import OpenAI from 'openai'
import { PortfolioQuestion } from '@/types/portfolio'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function analyzePortfolio(content: string, userId: string): Promise<Omit<PortfolioQuestion, '_id'>[]> {
  try {
    const prompt = `다음은 지원자의 포트폴리오입니다. 이 포트폴리오를 분석하여 면접관이 물어볼 만한 질문 10-15개를 생성해주세요.

포트폴리오 내용:
${content}

각 질문에 대해 다음 형식의 JSON 배열로 응답해주세요:
[
  {
    "question": "질문 내용",
    "suggestedAnswer": "추천 답변 (2-3문장)"
  }
]

질문은 다음을 포함해야 합니다:
- 프로젝트 경험에 대한 구체적인 질문
- 사용한 기술 스택에 대한 심화 질문
- 문제 해결 과정에 대한 질문
- 협업 경험에 대한 질문
- 기술적 의사결정에 대한 질문`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })

    const content_text = response.choices[0].message.content
    if (!content_text) {
      throw new Error('AI 응답이 비어있습니다')
    }

    const questions = JSON.parse(content_text)
    
    return questions.map((q: any) => ({
      userId,
      question: q.question,
      suggestedAnswer: q.suggestedAnswer,
      category: 'portfolio' as const,
      isAIGenerated: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  } catch (error) {
    console.error('AI 분석 오류:', error)
    throw new Error('포트폴리오 분석 중 오류가 발생했습니다')
  }
}
