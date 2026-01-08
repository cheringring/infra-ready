import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return { isAdmin: false, userId: null, error: '로그인이 필요합니다' }
  }
  
  if (session.user.role !== 'admin') {
    return { isAdmin: false, userId: session.user.id, error: '관리자 권한이 필요합니다' }
  }
  
  return { isAdmin: true, userId: session.user.id, error: null }
}
