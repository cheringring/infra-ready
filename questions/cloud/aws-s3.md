---
question: "AWS S3란 무엇이며 주요 특징은?"
shortAnswer: "S3(Simple Storage Service)는 AWS의 객체 스토리지 서비스입니다. 무제한 용량, 99.999999999%(11 9's) 내구성, 버전 관리, 정적 웹사이트 호스팅, 다양한 스토리지 클래스 등의 특징이 있습니다."
---

## AWS S3 완벽 가이드

### S3란?

Amazon Simple Storage Service(S3)는 업계 최고의 확장성, 데이터 가용성, 보안 및 성능을 제공하는 객체 스토리지 서비스입니다.

### 주요 특징

#### 1. 무제한 확장성
- 용량 제한 없음
- 단일 객체 최대 5TB
- 자동 확장/축소

#### 2. 높은 내구성
- 99.999999999%(11 9's) 내구성
- 여러 AZ에 자동 복제
- 데이터 손실 방지

#### 3. 스토리지 클래스

**S3 Standard**
- 자주 액세스하는 데이터
- 낮은 지연 시간
- 높은 처리량

**S3 Intelligent-Tiering**
- 액세스 패턴에 따라 자동 이동
- 비용 최적화

**S3 Standard-IA (Infrequent Access)**
- 자주 액세스하지 않는 데이터
- Standard보다 저렴
- 검색 비용 발생

**S3 One Zone-IA**
- 단일 AZ 저장
- IA보다 20% 저렴
- 재생성 가능한 데이터

**S3 Glacier**
- 아카이브 데이터
- 분~시간 단위 검색
- 매우 저렴

**S3 Glacier Deep Archive**
- 장기 보관 (7-10년)
- 12시간 검색
- 가장 저렴

### 주요 기능

#### 버전 관리
```bash
# 버전 관리 활성화
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled
```

#### 수명 주기 정책
- 자동으로 스토리지 클래스 전환
- 오래된 버전 삭제
- 비용 절감

#### 정적 웹사이트 호스팅
```bash
# 정적 웹사이트 설정
aws s3 website s3://my-bucket/ \
  --index-document index.html \
  --error-document error.html
```

#### 암호화
- **SSE-S3**: S3 관리 키
- **SSE-KMS**: KMS 관리 키
- **SSE-C**: 고객 제공 키
- **클라이언트 측 암호화**

### 액세스 제어

#### 버킷 정책
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```

#### ACL (Access Control List)
- 객체/버킷 수준 권한
- 간단한 권한 관리

#### IAM 정책
- 사용자/역할 기반 권한
- 세밀한 제어

### 성능 최적화

#### 멀티파트 업로드
- 100MB 이상 파일 권장
- 병렬 업로드
- 실패 시 재시작 가능

#### Transfer Acceleration
- CloudFront 엣지 로케이션 활용
- 장거리 전송 속도 향상
- 추가 비용 발생

#### S3 Select
- SQL로 객체 내용 쿼리
- 전체 다운로드 불필요
- 비용 및 시간 절감

### 데이터 관리

#### 복제
- **CRR (Cross-Region Replication)**: 다른 리전으로 복제
- **SRR (Same-Region Replication)**: 같은 리전 내 복제
- 재해 복구, 규정 준수

#### 이벤트 알림
- Lambda 함수 트리거
- SQS 큐로 메시지 전송
- SNS 토픽 게시

### CLI 명령어

```bash
# 파일 업로드
aws s3 cp file.txt s3://my-bucket/

# 폴더 동기화
aws s3 sync ./local-folder s3://my-bucket/

# 파일 다운로드
aws s3 cp s3://my-bucket/file.txt ./

# 버킷 목록
aws s3 ls

# 객체 목록
aws s3 ls s3://my-bucket/

# 파일 삭제
aws s3 rm s3://my-bucket/file.txt

# 버킷 삭제 (비어있어야 함)
aws s3 rb s3://my-bucket/
```

### 보안 베스트 프랙티스

1. **퍼블릭 액세스 차단**
   - 기본적으로 모든 퍼블릭 액세스 차단
   - 필요한 경우만 선택적 허용

2. **암호화 활성화**
   - 저장 데이터 암호화
   - 전송 중 암호화 (HTTPS)

3. **버전 관리 활성화**
   - 실수로 삭제 방지
   - 이전 버전 복구 가능

4. **MFA Delete**
   - 중요 데이터 삭제 시 MFA 요구
   - 추가 보안 계층

5. **액세스 로깅**
   - 모든 요청 기록
   - 감사 및 분석

### 비용 최적화

1. **적절한 스토리지 클래스 선택**
2. **수명 주기 정책 설정**
3. **불필요한 데이터 삭제**
4. **Intelligent-Tiering 활용**
5. **S3 Select 사용**

### 실무 활용 사례

- **백업 및 복구**: 데이터베이스, 로그 백업
- **데이터 레이크**: 빅데이터 분석
- **정적 웹사이트**: HTML, CSS, JS 호스팅
- **미디어 저장**: 이미지, 비디오 저장
- **로그 저장**: 애플리케이션 로그 중앙화
- **재해 복구**: 다른 리전에 복제
