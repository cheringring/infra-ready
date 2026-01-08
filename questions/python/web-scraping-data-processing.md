---
question: "⭐ Python을 활용한 웹 데이터 스크래핑 및 전처리 프로세스 구축과 비정형 데이터의 서비스 활용 방법을 설명해주세요."
shortAnswer: "BeautifulSoup, Selenium을 이용한 웹 스크래핑, pandas를 통한 데이터 전처리, 정규표현식을 활용한 텍스트 정제, 그리고 스케줄링을 통한 자동화된 데이터 수집 파이프라인을 구축하여 비정형 데이터를 구조화된 서비스 데이터로 변환합니다."
---

# Python 웹 스크래핑 및 데이터 처리

## 웹 스크래핑 기법

### BeautifulSoup을 이용한 정적 스크래핑
#### 핵심 라이브러리와 도구:
- **requests**: HTTP 요청 처리 및 세션 관리
- **BeautifulSoup**: HTML 파싱 및 CSS 선택자 활용
- **pandas**: 데이터 구조화 및 CSV/JSON 변환
- **logging**: 스크래핑 과정 모니터링 및 디버깅
- **urllib.parse**: URL 조작 및 상대경로 처리

#### 스크래핑 프로세스:
- **세션 관리**: `requests.Session()`으로 쿠키 및 헤더 유지
- **User-Agent 설정**: 브라우저 식별을 위한 헤더 설정
- **CSS 선택자**: `soup.select()` 메서드로 요소 추출
- **에러 처리**: `response.raise_for_status()` 및 예외 처리
- **속도 제어**: `time.sleep()`으로 요청 간격 조절
#### 데이터 추출 기법:
- **텍스트 추출**: `get_text(strip=True)` 메서드로 공백 제거
- **속성 추출**: `get('src')`, `get('href')` 등으로 HTML 속성 값 획득
- **URL 처리**: `urljoin()`으로 상대경로를 절대경로로 변환
- **정규표현식**: `re.findall()`로 가격, 전화번호 등 패턴 추출
- **데이터 구조화**: 딕셔너리 형태로 수집 후 pandas DataFrame 변환

#### 에러 처리 및 로깅:
- **요청 예외**: `requests.RequestException` 처리
- **파싱 에러**: BeautifulSoup 파싱 실패 시 예외 처리
- **로그 레벨**: INFO, ERROR 레벨로 상황별 로깅
- **재시도 로직**: 실패한 페이지에 대한 재시도 메커니즘
```

### Selenium을 이용한 동적 스크래핑
#### 핵심 라이브러리와 모듈:
- **selenium.webdriver**: Chrome, Firefox 등 브라우저 제어
- **WebDriverWait**: 요소 로딩 대기 및 타임아웃 처리
- **expected_conditions**: 요소 상태 확인 조건
- **By**: 요소 선택 방법 (ID, CLASS_NAME, XPATH 등)
- **Chrome Options**: 헤드리스 모드, 창 크기 등 브라우저 옵션

#### Selenium 동적 스크래핑 기법:
- **브라우저 옵션**: `--headless`, `--no-sandbox`, `--disable-gpu` 등
- **대기 전략**: `WebDriverWait`와 `expected_conditions`로 요소 로딩 대기
- **무한 스크롤**: JavaScript `scrollTo()` 명령어로 동적 콘텐츠 로딩
- **JavaScript 실행**: `execute_script()`로 브라우저에서 JavaScript 코드 실행
- **요소 찾기**: `find_element()`, `find_elements()` 메서드 활용

#### SPA(Single Page Application) 처리:
- **동적 로딩**: AJAX로 로드되는 콘텐츠 대기
- **상태 확인**: `presence_of_element_located` 등 조건 확인
- **타임아웃**: 지정된 시간 내 요소 로딩 실패 시 예외 처리
- **리소스 정리**: `driver.quit()`로 브라우저 세션 종료

## 데이터 전처리 및 정제

### 텍스트 데이터 정제
```python
import re
import pandas as pd
from typing import List, Dict, Any

class DataProcessor:
    def __init__(self):
        self.text_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\d{3}[-.]?\d{3,4}[-.]?\d{4})',
            'url': r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',
            'price': r'[\d,]+원?|₩[\d,]+|\$[\d,]+\.?\d*'
        }
    
    def clean_text_data(self, df: pd.DataFrame, text_columns: List[str]) -> pd.DataFrame:
        """텍스트 데이터 정제"""
        df_cleaned = df.copy()
        
        for col in text_columns:
            if col in df_cleaned.columns:
                df_cleaned[col] = df_cleaned[col].apply(self.clean_text)
        
        return df_cleaned
    
    def clean_text(self, text: str) -> str:
        """개별 텍스트 정제"""
        if pd.isna(text):
            return ""
        
        text = str(text)
        
        # HTML 태그 제거
        text = re.sub(r'<[^>]+>', '', text)
        
        # 특수 문자 정규화
        text = re.sub(r'[^\w\s가-힣]', ' ', text)
        
        # 연속된 공백 제거
        text = re.sub(r'\s+', ' ', text)
        
        # 앞뒤 공백 제거
        text = text.strip()
        
        return text
    
    def extract_structured_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """비정형 데이터에서 구조화된 정보 추출"""
        df_processed = df.copy()
        
        # 가격 정보 추출 및 정규화
        if 'description' in df_processed.columns:
            df_processed['extracted_price'] = df_processed['description'].apply(
                lambda x: self.extract_price_from_text(x)
            )
        
        # 연락처 정보 추출
        if 'content' in df_processed.columns:
            df_processed['phone_numbers'] = df_processed['content'].apply(
                lambda x: self.extract_pattern(x, 'phone')
            )
            
            df_processed['email_addresses'] = df_processed['content'].apply(
                lambda x: self.extract_pattern(x, 'email')
            )
        
        return df_processed
    
    def extract_price_from_text(self, text: str) -> float:
        """텍스트에서 가격 추출"""
        if pd.isna(text):
            return 0.0
        
        matches = re.findall(self.text_patterns['price'], str(text))
        
        if matches:
            # 첫 번째 매치에서 숫자만 추출
            price_str = re.sub(r'[^\d]', '', matches[0])
            try:
                return float(price_str)
            except ValueError:
                return 0.0
        
        return 0.0
    
    def extract_pattern(self, text: str, pattern_name: str) -> List[str]:
        """특정 패턴 추출"""
        if pd.isna(text) or pattern_name not in self.text_patterns:
            return []
        
        matches = re.findall(self.text_patterns[pattern_name], str(text))
        return matches
```

## 데이터 파이프라인 구축

### 자동화된 스크래핑 파이프라인
```python
import schedule
import sqlite3
from datetime import datetime, timedelta
import logging

class ScrapingPipeline:
    def __init__(self, db_path='scraping_data.db'):
        self.db_path = db_path
        self.setup_database()
        self.setup_logging()
    
    def setup_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scraped_products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL,
                category TEXT,
                url TEXT,
                image_url TEXT,
                description TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source_site TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scraping_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_name TEXT,
                status TEXT,
                records_processed INTEGER,
                error_message TEXT,
                started_at TIMESTAMP,
                completed_at TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('scraping.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def run_scraping_job(self, job_name: str, scraper_func, *args, **kwargs):
        """스크래핑 작업 실행"""
        start_time = datetime.now()
        self.logger.info(f"스크래핑 작업 시작: {job_name}")
        
        try:
            # 스크래핑 실행
            data = scraper_func(*args, **kwargs)
            
            # 데이터 저장
            records_saved = self.save_scraped_data(data, job_name)
            
            # 로그 기록
            self.log_job_completion(job_name, 'SUCCESS', records_saved, None, start_time)
            
            self.logger.info(f"작업 완료: {job_name}, {records_saved}개 레코드 저장")
            
        except Exception as e:
            self.log_job_completion(job_name, 'ERROR', 0, str(e), start_time)
            self.logger.error(f"작업 실패: {job_name}, 오류: {e}")
    
    def save_scraped_data(self, data: List[Dict], source: str) -> int:
        """스크래핑된 데이터 저장"""
        if not data:
            return 0
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        
        for item in data:
            try:
                cursor.execute('''
                    INSERT INTO scraped_products 
                    (name, price, category, url, image_url, description, source_site)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('name'),
                    item.get('price'),
                    item.get('category'),
                    item.get('url'),
                    item.get('image_url'),
                    item.get('description'),
                    source
                ))
                saved_count += 1
                
            except sqlite3.Error as e:
                self.logger.error(f"데이터 저장 실패: {e}")
        
        conn.commit()
        conn.close()
        
        return saved_count
    
    def log_job_completion(self, job_name, status, records, error_msg, start_time):
        """작업 완료 로그"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO scraping_logs 
            (job_name, status, records_processed, error_message, started_at, completed_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (job_name, status, records, error_msg, start_time, datetime.now()))
        
        conn.commit()
        conn.close()
    
    def schedule_jobs(self):
        """스크래핑 작업 스케줄링"""
        # 매일 오전 9시에 상품 정보 수집
        schedule.every().day.at("09:00").do(
            self.run_scraping_job, 
            "daily_product_scraping", 
            self.scrape_products
        )
        
        # 매주 월요일에 전체 카테고리 업데이트
        schedule.every().monday.at("02:00").do(
            self.run_scraping_job,
            "weekly_category_update",
            self.scrape_categories
        )
        
        # 스케줄러 실행
        while True:
            schedule.run_pending()
            time.sleep(60)
```

## 실무 면접 예상 질문

### 웹 스크래핑 기술 질문
1. **"정적 스크래핑과 동적 스크래핑의 차이점은?"**
   - 정적: BeautifulSoup, requests (HTML 파싱)
   - 동적: Selenium (JavaScript 실행 필요)

2. **"웹 스크래핑 시 고려해야 할 윤리적, 법적 사항은?"**
   - robots.txt 준수
   - 요청 간격 조절
   - 저작권 및 이용약관 확인

### 데이터 처리 질문
1. **"대용량 스크래핑 데이터를 어떻게 효율적으로 처리하나요?"**
   - 청크 단위 처리
   - 멀티프로세싱 활용
   - 메모리 효율적 데이터 구조 사용

2. **"비정형 텍스트에서 구조화된 정보를 추출하는 방법은?"**
   - 정규표현식 패턴 매칭
   - NLP 라이브러리 활용
   - 머신러닝 기반 정보 추출

### 데이터 사이언스 부트캠프 경험 어필 포인트
- **실무 프로젝트**: 실제 웹사이트에서 데이터 수집 및 분석
- **자동화 구축**: 스케줄링을 통한 정기적 데이터 수집
- **데이터 품질**: 전처리 및 정제를 통한 고품질 데이터 확보
- **통합 서비스**: 수집된 데이터를 웹 애플리케이션에 통합
- **성능 최적화**: 대용량 데이터 처리 최적화 경험
