---
question: "⭐ RDBMS 설계 원리를 바탕으로 한 효율적인 데이터 모델링과 SQL 쿼리 최적화 기법, 그리고 인덱스 설계 전략을 설명해주세요."
shortAnswer: "정규화를 통한 데이터 중복 제거, 적절한 인덱스 설계, 쿼리 실행 계획 분석을 통한 성능 최적화가 핵심입니다. 복합 인덱스, 파티셔닝, 쿼리 튜닝을 통해 대용량 데이터 처리 성능을 향상시킬 수 있습니다."
---

# SQL 데이터 모델링 및 최적화

## 데이터베이스 설계 원리

### 정규화 (Normalization)
#### 정규화 원리와 테이블 설계:
- **1NF (제1정규형)**: 원자값 저장, 반복 그룹 제거
- **2NF (제2정규형)**: 부분 함수 종속 제거
- **3NF (제3정규형)**: 이행 함수 종속 제거

#### 정규화된 테이블 구조 설계:
- **customers 테이블**: 고객 정보 (email UNIQUE, 인덱스 설정)
- **categories 테이블**: 카테고리 계층 구조 (self-referencing FK)
- **products 테이블**: 상품 정보 (category_id FK, 복합 인덱스)
- **orders 테이블**: 주문 정보 (customer_id FK, 상태별 인덱스)
- **order_items 테이블**: 주문 상세 (복합 FK, CASCADE 설정)

#### 핵심 설계 원칙:
- **PRIMARY KEY**: 각 테이블마다 고유 식별자 설정
- **FOREIGN KEY**: 참조 무결성 보장, CASCADE 옵션 활용
- **INDEX**: 검색 성능 향상을 위한 단일/복합 인덱스
- **UNIQUE**: 중복 방지가 필요한 컬럼에 제약 조건
```

### 인덱스 설계 전략
#### 인덱스 유형별 활용:
- **단일 컬럼 인덱스**: `CREATE INDEX idx_customer_email ON customers(email)`
- **복합 인덱스**: `CREATE INDEX idx_product_category_price ON products(category_id, price)`
- **커버링 인덱스**: 쿼리에 필요한 모든 컬럼을 인덱스에 포함
- **함수 기반 인덱스**: `UPPER(name)`, `YEAR(order_date)` 등 함수 결과에 인덱스
- **부분 인덱스**: `WHERE is_active = TRUE` 조건부 인덱스

#### 복합 인덱스 설계 원칙:
- **컬럼 순서**: 카디널리티 높은 컬럼 우선 배치
- **WHERE 절 최적화**: 자주 함께 검색되는 컬럼들 조합
- **정렬 최적화**: ORDER BY 절에 사용되는 컬럼 고려

#### 인덱스 모니터링 명령어:
- **사용량 확인**: `information_schema.STATISTICS` 테이블 조회
- **성능 분석**: `SHOW INDEX FROM table_name`
- **실행 계획**: `EXPLAIN` 명령어로 인덱스 사용 여부 확인
```

## 쿼리 최적화 기법

### 실행 계획 분석
#### EXPLAIN 명령어 활용:
- **기본 분석**: `EXPLAIN SELECT ...` 쿼리 실행 계획 확인
- **상세 분석**: `EXPLAIN FORMAT=JSON` JSON 형태로 상세 정보
- **실제 실행**: `EXPLAIN ANALYZE` 실제 실행 시간과 비용 측정

#### 쿼리 최적화 전략:
- **서브쿼리 → JOIN**: 상관 서브쿼리를 JOIN으로 변환하여 성능 향상
- **CTE 활용**: `WITH` 절을 사용한 복잡한 쿼리 단순화
- **윈도우 함수**: `ROW_NUMBER()`, `RANK()` 등으로 집계 최적화
- **인덱스 힌트**: 옵티마이저가 적절한 인덱스를 선택하도록 유도

#### 성능 개선 포인트:
- **WHERE 절 최적화**: 선택도가 높은 조건을 앞쪽에 배치
- **JOIN 순서**: 작은 테이블을 먼저 JOIN하여 중간 결과 최소화
- **GROUP BY 최적화**: 인덱스를 활용한 정렬 없는 그룹핑
```

### 고급 쿼리 최적화
#### 페이지네이션 최적화:
- **OFFSET 문제점**: 대용량 데이터에서 `LIMIT 1000 OFFSET 50000` 비효율
- **커서 기반 해결**: `WHERE product_id > 50000` 조건으로 성능 향상
- **인덱스 활용**: 정렬 컬럼에 인덱스 설정으로 빠른 탐색

#### 조건절 최적화:
- **EXISTS vs IN**: 대용량 데이터에서 EXISTS가 일반적으로 더 효율적
- **조건부 집계**: `COUNT(CASE WHEN ...)` 패턴으로 한 번의 스캔으로 다중 집계
- **WHERE 절 순서**: 선택도 높은 조건을 앞쪽에 배치

#### 윈도우 함수 활용:
- **랭킹 함수**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`
- **분석 함수**: `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`
- **집계 함수**: `SUM() OVER()`, `AVG() OVER()` 등

#### CTE (Common Table Expression):
- **복잡한 쿼리 단순화**: `WITH` 절로 가독성 향상
- **재귀 CTE**: 계층 구조 데이터 처리
- **성능 고려사항**: 임시 테이블 vs 인라인 뷰 선택
```

## 성능 모니터링 및 튜닝

### 쿼리 성능 분석
#### 슬로우 쿼리 모니터링:
- **설정 파일**: `my.cnf`에서 `slow_query_log = 1`, `long_query_time = 2` 설정
- **로그 분석**: `/var/log/mysql/slow.log` 파일에서 느린 쿼리 확인
- **성능 스키마**: `performance_schema.events_statements_summary_by_digest` 테이블 활용

#### 인덱스 사용률 분석:
- **인덱스 모니터링**: `performance_schema.table_io_waits_summary_by_index_usage`
- **테이블 스캔 분석**: `performance_schema.table_io_waits_summary_by_table`
- **실행 통계**: 평균 실행 시간, 최대 실행 시간, 검사한 행 수 등

### 파티셔닝 전략
#### 파티셔닝 유형:
- **범위 파티셔닝**: `PARTITION BY RANGE (YEAR(order_date))` 날짜 기반 분할
- **해시 파티셔닝**: `PARTITION BY HASH(customer_id)` 고객 ID 기반 분할
- **리스트 파티셔닝**: `PARTITION BY LIST` 특정 값 목록 기반
- **키 파티셔닝**: `PARTITION BY KEY` 자동 해시 분할

#### 파티션 관리 명령어:
- **파티션 추가**: `ALTER TABLE ... ADD PARTITION`
- **파티션 삭제**: `ALTER TABLE ... DROP PARTITION`
- **파티션 정보**: `information_schema.PARTITIONS` 테이블 조회
- **파티션 프루닝**: 오래된 데이터 자동 삭제

#### 파티셔닝 이점:
- **쿼리 성능**: 필요한 파티션만 스캔하여 성능 향상
- **유지보수**: 파티션별 독립적인 백업 및 복구
- **병렬 처리**: 여러 파티션에서 동시 작업 가능
```

## 데이터 웨어하우스 설계

### 스타 스키마 설계
```sql
-- 팩트 테이블 (매출 데이터)
CREATE TABLE fact_sales (
    sale_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date_key INT NOT NULL,
    customer_key INT NOT NULL,
    product_key INT NOT NULL,
    store_key INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    
    INDEX idx_date (date_key),
    INDEX idx_customer (customer_key),
    INDEX idx_product (product_key),
    INDEX idx_store (store_key),
    INDEX idx_date_store (date_key, store_key)
);

-- 차원 테이블들
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE NOT NULL,
    year INT NOT NULL,
    quarter INT NOT NULL,
    month INT NOT NULL,
    day INT NOT NULL,
    day_of_week INT NOT NULL,
    day_name VARCHAR(10) NOT NULL,
    month_name VARCHAR(10) NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    
    INDEX idx_year_month (year, month),
    INDEX idx_quarter (quarter)
);

CREATE TABLE dim_customer (
    customer_key INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    age_group VARCHAR(20),
    gender VARCHAR(10),
    city VARCHAR(50),
    country VARCHAR(50),
    customer_segment VARCHAR(30),
    registration_date DATE,
    
    INDEX idx_segment (customer_segment),
    INDEX idx_city (city),
    INDEX idx_age_group (age_group)
);

-- OLAP 쿼리 예시
SELECT 
    dd.year,
    dd.quarter,
    dc.customer_segment,
    dp.category_name,
    SUM(fs.total_amount) as total_revenue,
    COUNT(fs.sale_id) as transaction_count,
    AVG(fs.total_amount) as avg_transaction_value,
    COUNT(DISTINCT fs.customer_key) as unique_customers
FROM fact_sales fs
JOIN dim_date dd ON fs.date_key = dd.date_key
JOIN dim_customer dc ON fs.customer_key = dc.customer_key
JOIN dim_product dp ON fs.product_key = dp.product_key
WHERE dd.year = 2024
GROUP BY dd.year, dd.quarter, dc.customer_segment, dp.category_name
WITH ROLLUP
ORDER BY total_revenue DESC;
```

## 실무 면접 예상 질문

### 데이터 모델링 질문
1. **"정규화와 비정규화의 장단점은 무엇인가요?"**
   - 정규화: 데이터 중복 제거, 무결성 보장 vs 조인 비용 증가
   - 비정규화: 조회 성능 향상 vs 데이터 중복, 무결성 위험

2. **"1NF, 2NF, 3NF의 차이점을 설명해주세요"**
   - 1NF: 원자값, 반복 그룹 제거
   - 2NF: 부분 함수 종속 제거
   - 3NF: 이행 함수 종속 제거

### 인덱스 설계 질문
1. **"복합 인덱스 설계 시 컬럼 순서를 어떻게 결정하나요?"**
   - 카디널리티가 높은 컬럼 우선
   - WHERE 절에서 자주 사용되는 컬럼 우선
   - 등호 조건 → 범위 조건 순서

2. **"인덱스가 성능에 미치는 부정적 영향은?"**
   - INSERT/UPDATE/DELETE 성능 저하
   - 저장 공간 추가 사용
   - 메모리 사용량 증가

### 쿼리 최적화 질문
1. **"N+1 문제를 어떻게 해결하나요?"**
   - JOIN 사용으로 한 번에 조회
   - 배치 쿼리 사용
   - 캐싱 전략 적용

2. **"대용량 데이터 페이지네이션 최적화 방법은?"**
   - 커서 기반 페이지네이션
   - 인덱스 활용한 SEEK 방식
   - 캐싱 및 비동기 처리

### 데이터 사이언스 부트캠프 경험 어필 포인트
- **실무 데이터 모델링**: 웹 스크래핑 데이터의 효율적 저장 구조 설계
- **성능 최적화**: 대용량 데이터 처리를 위한 쿼리 튜닝 경험
- **데이터 분석**: SQL을 활용한 비즈니스 인사이트 도출
- **통합 시스템**: 데이터 수집부터 웹 서비스까지 전체 파이프라인 구축
- **실시간 처리**: 스크래핑 데이터의 실시간 분석 및 시각화

### 실무 시나리오 질문
1. **"웹 스크래핑으로 수집한 대용량 데이터를 어떻게 효율적으로 저장하고 조회하시겠습니까?"**
2. **"실시간 데이터 분석을 위한 데이터베이스 아키텍처를 어떻게 설계하시겠습니까?"**
3. **"데이터 품질 관리와 무결성 보장을 위한 전략은 무엇인가요?"**
