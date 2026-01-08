---
question: "HTTP와 HTTPS의 차이점은 무엇이며, HTTPS는 어떻게 보안을 제공하나요?"
shortAnswer: "HTTP는 평문으로 데이터를 전송하지만, HTTPS는 SSL/TLS를 사용해 암호화된 통신을 제공합니다. HTTPS는 데이터 암호화, 서버 인증, 데이터 무결성을 보장하여 중간자 공격을 방지합니다."
---

## 상세 답변

### HTTP (HyperText Transfer Protocol)

#### 특징
- **포트**: 80번
- **평문 전송**: 데이터가 암호화되지 않음
- **빠른 속도**: 암호화 오버헤드 없음
- **보안 취약**: 패킷 스니핑으로 데이터 노출 가능

#### 문제점
```
사용자 → [ID: admin, PW: 1234] → 서버
         ↑ 중간에 누구나 볼 수 있음!
```

### HTTPS (HTTP Secure)

#### 특징
- **포트**: 443번
- **암호화 통신**: SSL/TLS 프로토콜 사용
- **서버 인증**: 인증서로 서버 신원 확인
- **데이터 무결성**: 변조 방지
- **SEO 우대**: 구글 검색 순위 상승

#### 동작 원리 (SSL/TLS Handshake)

```
1. Client Hello
   - 클라이언트가 지원하는 암호화 방식 목록 전송
   - 랜덤 데이터 생성

2. Server Hello
   - 서버가 선택한 암호화 방식
   - 서버 인증서 전송 (공개키 포함)
   - 랜덤 데이터 생성

3. 인증서 검증
   - 클라이언트가 CA(인증기관)를 통해 인증서 검증
   - 서버의 공개키 추출

4. 세션 키 생성
   - 클라이언트가 Pre-Master Secret 생성
   - 서버의 공개키로 암호화하여 전송
   - 양측이 동일한 세션 키 생성

5. 암호화 통신 시작
   - 세션 키로 대칭키 암호화 통신
```

### 암호화 방식

#### 비대칭키 암호화 (공개키/개인키)
- **용도**: 초기 핸드셰이크, 세션 키 교환
- **특징**: 안전하지만 느림
- **예시**: RSA, ECC

```
공개키로 암호화 → 개인키로만 복호화 가능
개인키로 서명 → 공개키로 검증 가능
```

#### 대칭키 암호화
- **용도**: 실제 데이터 전송
- **특징**: 빠르지만 키 공유 문제
- **예시**: AES, ChaCha20

```
동일한 키로 암호화/복호화
```

### 인증서 (Certificate)

#### 구성 요소
- 도메인 정보
- 공개키
- 발급 기관 (CA)
- 유효 기간
- 디지털 서명

#### CA (Certificate Authority)
신뢰할 수 있는 인증 기관
- Let's Encrypt (무료)
- DigiCert
- GlobalSign
- Comodo

### 실무 적용

#### 1. Let's Encrypt로 HTTPS 적용

```bash
# Certbot 설치 (Ubuntu)
sudo apt install certbot python3-certbot-nginx

# 인증서 발급 및 Nginx 자동 설정
sudo certbot --nginx -d example.com

# 자동 갱신 설정 (90일마다)
sudo certbot renew --dry-run
```

#### 2. Nginx 설정

```nginx
server {
    listen 80;
    server_name example.com;
    
    # HTTP를 HTTPS로 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # 보안 강화
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 성능 최적화

#### HTTP/2
- HTTPS 필수
- 멀티플렉싱: 하나의 연결로 여러 요청 동시 처리
- 헤더 압축
- 서버 푸시

#### HTTP/3 (QUIC)
- UDP 기반
- 더 빠른 연결 수립
- 패킷 손실에 강함

### 보안 위협과 방어

#### 중간자 공격 (MITM)
**공격**: 공격자가 통신 중간에서 데이터 가로채기
**방어**: HTTPS 인증서 검증

#### SSL Stripping
**공격**: HTTPS를 HTTP로 다운그레이드
**방어**: HSTS 헤더 설정

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 비용과 성능

#### 성능 영향
- **초기 연결**: 약간 느림 (핸드셰이크)
- **데이터 전송**: 거의 차이 없음 (하드웨어 가속)
- **HTTP/2 사용 시**: 오히려 더 빠를 수 있음

#### 비용
- **Let's Encrypt**: 무료
- **상용 인증서**: 연간 수만원~수십만원
- **EV 인증서**: 수백만원 (주소창에 회사명 표시)

### 실무 체크리스트

✅ 모든 페이지를 HTTPS로 전환
✅ HTTP → HTTPS 리다이렉트 설정
✅ Mixed Content 제거 (HTTPS 페이지에서 HTTP 리소스 로드 금지)
✅ HSTS 헤더 설정
✅ 인증서 자동 갱신 설정
✅ TLS 1.2 이상 사용
✅ 약한 암호화 알고리즘 비활성화

### 면접 팁

**좋은 답변 예시**:
"HTTPS는 SSL/TLS를 사용해 암호화 통신을 제공합니다. 핸드셰이크 과정에서 비대칭키로 세션 키를 안전하게 교환하고, 이후 대칭키로 빠른 데이터 전송을 합니다. 실제로 제 개인 프로젝트에서도 Let's Encrypt로 무료 인증서를 발급받아 HTTPS를 적용했습니다."

**추가 포인트**:
- 최근 브라우저들은 HTTP 사이트에 '안전하지 않음' 경고 표시
- 구글은 HTTPS 사이트에 SEO 가점 부여
- 쿠키의 Secure 플래그는 HTTPS에서만 작동
