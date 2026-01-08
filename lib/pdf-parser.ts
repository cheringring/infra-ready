import pdf from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('PDF 파싱 오류:', error)
    throw new Error('PDF 파일을 읽을 수 없습니다')
  }
}
