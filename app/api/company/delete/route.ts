import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json({ error: '기업명이 필요합니다' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'questions', 'company', `${companyName}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '기업 파일을 찾을 수 없습니다' }, { status: 404 })
    }

    fs.unlinkSync(filePath)

    return NextResponse.json({
      success: true,
      message: `${companyName} 폴더가 삭제되었습니다`
    })
  } catch (error) {
    console.error('기업 삭제 오류:', error)
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
