import Link from 'next/link'
import { getCategories } from '@/lib/questions'

export default function Home() {
  const categories = getCategories()

  return (
    <>
      <header>
        <h1>클라우드/인프라 면접 질문</h1>
      </header>
      <div className="container">
        <div className="categories">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.id}`}
              className="category-card"
            >
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9rem' }}>
                {category.count}개의 질문
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
