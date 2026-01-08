---
question: "DNS 동작 과정을 단계별로 설명하고, DNS 서버의 종류와 역할을 설명해주세요."
shortAnswer: "DNS는 도메인명을 IP 주소로 변환하는 시스템으로, 재귀적 질의를 통해 Root DNS → TLD DNS → Authoritative DNS 순서로 조회하여 최종 IP 주소를 반환합니다."
---

# DNS (Domain Name System) 동작 과정

## DNS 서버 종류

### 1. 재귀 DNS 서버 (Recursive DNS Server)
- **역할**: 클라이언트 대신 DNS 조회 수행
- **예시**: ISP DNS, Google DNS (8.8.8.8), Cloudflare DNS (1.1.1.1)
- **특징**: 캐싱 기능으로 응답 속도 향상

### 2. 루트 DNS 서버 (Root DNS Server)
- **역할**: 최상위 도메인 정보 제공
- **개수**: 전 세계 13개 (A~M)
- **관리**: ICANN에서 관리

### 3. TLD DNS 서버 (Top Level Domain)
- **역할**: .com, .org, .kr 등 최상위 도메인 관리
- **예시**: .com → Verisign, .kr → KISA

### 4. 권한 DNS 서버 (Authoritative DNS Server)
- **역할**: 특정 도메인의 실제 IP 주소 정보 보유
- **예시**: naver.com의 실제 IP 주소 정보

## DNS 조회 과정 (www.naver.com 예시)

### 1단계: 로컬 캐시 확인
```
브라우저 캐시 → OS 캐시 → 라우터 캐시
```

### 2단계: 재귀 DNS 서버 질의
```
클라이언트 → 재귀 DNS 서버 (예: 8.8.8.8)
```

### 3단계: 루트 DNS 서버 질의
```
재귀 DNS → 루트 DNS 서버
응답: ".com을 관리하는 TLD 서버 주소"
```

### 4단계: TLD DNS 서버 질의
```
재귀 DNS → .com TLD 서버
응답: "naver.com을 관리하는 권한 서버 주소"
```

### 5단계: 권한 DNS 서버 질의
```
재귀 DNS → naver.com 권한 서버
응답: "www.naver.com의 실제 IP 주소"
```

### 6단계: 클라이언트에 응답
```
재귀 DNS → 클라이언트
최종 응답: www.naver.com = 223.130.195.200
```

## DNS 레코드 타입

### 주요 레코드 타입
- **A 레코드**: 도메인 → IPv4 주소
- **AAAA 레코드**: 도메인 → IPv6 주소
- **CNAME 레코드**: 도메인 → 다른 도메인 (별칭)
- **MX 레코드**: 메일 서버 정보
- **NS 레코드**: 네임서버 정보
- **TXT 레코드**: 텍스트 정보 (SPF, DKIM 등)

## 신입 면접 핵심 포인트

### 1. DNS 캐싱의 중요성
- **TTL (Time To Live)**: 캐시 유지 시간
- **성능 향상**: 반복 조회 시 빠른 응답
- **부하 분산**: DNS 서버 부하 감소

### 2. DNS 보안
- **DNS Spoofing**: 가짜 DNS 응답으로 악성 사이트 유도
- **DNS over HTTPS (DoH)**: 암호화된 DNS 조회
- **DNSSEC**: DNS 응답 무결성 검증

### 3. 실무 관련 질문 대비
- "DNS 서버가 응답하지 않을 때 어떻게 해결하나요?"
- "nslookup, dig 명령어 사용법을 아시나요?"
- "CDN과 DNS의 관계를 설명해주세요."
