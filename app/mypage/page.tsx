import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import clientPromise from '@/lib/mongodb'
import { getQuestionDetail } from '@/lib/questions'
import SignOutButton from '@/components/SignOutButton'
import SavedQuestionsClient from '@/components/SavedQuestionsClient'

export default async function MyPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const client = await clientPromise
  const db = client.db()

  const favorites = await db.collection('favorites')
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  const favoriteQuestions = favorites.map(fav => {
    try {
      const question = getQuestionDetail(fav.categoryId, fav.questionId)
      return {
        ...question,
        categoryId: fav.categoryId,
        favoriteId: fav._id.toString()
      }
    } catch {
      return null
    }
  }).filter(Boolean)

  // 사용자의 질문 폴더 가져오기
  const questionFolders = await db.collection('user_question_folders')
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  const foldersWithQuestions = await Promise.all(
    questionFolders.map(async (folder) => {
      const questions = await db.collection('saved_questions')
        .find({ 
          userId: session.user.id,
          folderId: folder._id
        })
        .sort({ savedAt: -1 })
        .toArray()
      
      return {
        _id: folder._id.toString(),
        name: folder.name,
        description: folder.description,
        createdAt: folder.createdAt,
        questions: questions.map(q => ({
          _id: q._id.toString(),
          categoryId: q.categoryId,
          questionId: q.questionId,
          question: q.question,
          shortAnswer: q.shortAnswer,
          savedAt: q.savedAt
        }))
      }
    })
  )

  return (
    <>
      <header>
        <h1>마이페이지</h1>
        <p>{session.user.name}님 환영합니다</p>
      </header>
      <div className="container">
        <div className="mypage-container">
          <div className="user-info">
            <h2>내 정보</h2>
            <p><strong>이름:</strong> {session.user.name}</p>
            <p><strong>이메일:</strong> {session.user.email}</p>
            <p><strong>권한:</strong> {session.user.role === 'admin' ? '관리자' : '일반 회원'}</p>
            <SignOutButton />
          </div>

          <SavedQuestionsClient initialFolders={foldersWithQuestions} />

          <div className="favorites-section">
            <h2>찜한 질문 ({favoriteQuestions.length}개)</h2>
            {favoriteQuestions.length === 0 ? (
              <p className="empty-message">찜한 질문이 없습니다</p>
            ) : (
              <div className="question-list">
                {favoriteQuestions.map((q: any) => (
                  <div key={q.favoriteId} className="question-item">
                    <h3>Q: {q.question}</h3>
                    <div className="answer">
                      <strong>A:</strong> {q.shortAnswer}
                    </div>
                    <Link 
                      href={`/category/${q.categoryId}/${q.id}`}
                      className="detail-link"
                    >
                      자세히 보기 →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
