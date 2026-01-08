---
question: "리눅스 파일 권한 시스템을 설명하고, chmod, chown 명령어 사용법과 특수 권한(SUID, SGID, Sticky bit)에 대해 설명해주세요."
shortAnswer: "리눅스는 소유자, 그룹, 기타 사용자별로 읽기(r), 쓰기(w), 실행(x) 권한을 관리하며, chmod로 권한 변경, chown으로 소유권 변경, SUID/SGID/Sticky bit로 특수 권한을 설정할 수 있습니다."
---

# 리눅스 파일 권한 시스템

## 기본 권한 구조

### 권한 표시 방법
```bash
ls -l filename
-rwxr-xr-- 1 user group 1024 Jan 1 12:00 filename
```

**권한 구조 분석**:
- **첫 번째 문자**: 파일 타입 (`-`: 일반파일, `d`: 디렉토리, `l`: 심볼릭 링크)
- **2-4번째**: 소유자(user) 권한
- **5-7번째**: 그룹(group) 권한  
- **8-10번째**: 기타(others) 권한

### 권한 종류
- **r (read, 4)**: 읽기 권한
- **w (write, 2)**: 쓰기 권한
- **x (execute, 1)**: 실행 권한

## chmod 명령어 (권한 변경)

### 숫자 모드
```bash
chmod 755 filename      # rwxr-xr-x
chmod 644 filename      # rw-r--r--
chmod 600 filename      # rw-------
chmod 777 filename      # rwxrwxrwx (모든 권한)
```

**숫자 계산**:
- 7 = 4+2+1 (rwx)
- 6 = 4+2 (rw-)
- 5 = 4+1 (r-x)
- 4 = 4 (r--)

### 문자 모드
```bash
chmod u+x filename      # 소유자에게 실행 권한 추가
chmod g-w filename      # 그룹에서 쓰기 권한 제거
chmod o=r filename      # 기타 사용자에게 읽기 권한만 부여
chmod a+r filename      # 모든 사용자에게 읽기 권한 추가
```

**문자 기호**:
- **u**: user (소유자)
- **g**: group (그룹)
- **o**: others (기타)
- **a**: all (모든 사용자)

### 재귀적 권한 변경
```bash
chmod -R 755 directory/     # 디렉토리와 하위 모든 파일/디렉토리
```

## chown 명령어 (소유권 변경)

### 기본 사용법
```bash
chown user filename         # 소유자만 변경
chown user:group filename   # 소유자와 그룹 변경
chown :group filename       # 그룹만 변경
chown -R user:group dir/    # 재귀적 변경
```

### 실무 예시
```bash
# 웹 서버 파일 소유권 설정
sudo chown -R www-data:www-data /var/www/html/

# 로그 파일 권한 설정
sudo chown syslog:adm /var/log/application.log
sudo chmod 640 /var/log/application.log
```

## 특수 권한

### SUID (Set User ID) - 4000
```bash
chmod 4755 filename     # -rwsr-xr-x
chmod u+s filename      # SUID 설정
```
- **기능**: 파일 실행 시 소유자 권한으로 실행
- **예시**: `/usr/bin/passwd` (일반 사용자가 패스워드 변경 가능)
- **보안 주의**: 잘못 설정 시 보안 위험

### SGID (Set Group ID) - 2000
```bash
chmod 2755 filename     # -rwxr-sr-x
chmod g+s filename      # SGID 설정
```
- **파일**: 그룹 권한으로 실행
- **디렉토리**: 새로 생성되는 파일이 디렉토리 그룹을 상속

### Sticky Bit - 1000
```bash
chmod 1755 directory    # drwxr-xr-t
chmod +t directory      # Sticky bit 설정
```
- **기능**: 디렉토리에서 파일 소유자만 삭제 가능
- **예시**: `/tmp` 디렉토리 (모든 사용자가 파일 생성 가능하지만 자신의 파일만 삭제 가능)

## 디렉토리 권한의 특별한 의미

### 디렉토리 권한 해석
- **r**: 디렉토리 내용 조회 (`ls`)
- **w**: 파일 생성/삭제 가능
- **x**: 디렉토리 진입 가능 (`cd`)

### 실무 시나리오
```bash
# 공유 디렉토리 설정 (모든 사용자가 파일 생성 가능, 자신 파일만 삭제)
mkdir /shared
chmod 1777 /shared

# 웹 디렉토리 설정 (웹서버가 읽기 가능, 관리자만 수정)
chmod 755 /var/www/html
chown -R root:www-data /var/www/html
```

## umask (기본 권한 설정)

### umask 확인 및 설정
```bash
umask               # 현재 umask 값 확인
umask 022           # umask 설정
```

### umask 계산
- **파일 기본 권한**: 666 - umask
- **디렉토리 기본 권한**: 777 - umask

**예시**:
- umask 022: 파일 644, 디렉토리 755
- umask 077: 파일 600, 디렉토리 700

## 실무 권한 설정 예시

### 웹 서버 권한 설정
```bash
# 웹 루트 디렉토리
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

### 데이터베이스 파일 권한
```bash
# MySQL 데이터 디렉토리
sudo chown -R mysql:mysql /var/lib/mysql
sudo chmod 700 /var/lib/mysql
```

### SSH 키 권한 설정
```bash
chmod 700 ~/.ssh                    # SSH 디렉토리
chmod 600 ~/.ssh/id_rsa            # 개인키
chmod 644 ~/.ssh/id_rsa.pub        # 공개키
chmod 600 ~/.ssh/authorized_keys   # 인증된 키 목록
```

## 권한 문제 해결

### 권한 문제 진단
```bash
# 파일 권한 상세 확인
ls -la filename

# 디렉토리 권한 확인
ls -ld directory

# 프로세스가 파일에 접근할 수 있는지 확인
sudo -u username test -r filename && echo "readable" || echo "not readable"
```

### 일반적인 권한 오류
1. **Permission denied**: 실행 권한 없음
2. **Access denied**: 읽기/쓰기 권한 없음
3. **Operation not permitted**: 소유권 문제

## 신입 면접 핵심 포인트

### 1. 보안 관점에서의 권한 관리
- **최소 권한 원칙**: 필요한 최소한의 권한만 부여
- **SUID 파일 관리**: 정기적인 점검 필요
- **월드 라이터블 파일**: 보안 위험 요소

### 2. 실무 시나리오 질문
- "웹 서버 파일 권한을 어떻게 설정하나요?"
- "사용자가 파일에 접근할 수 없다고 할 때 어떻게 해결하나요?"
- "공유 디렉토리를 만들 때 권한을 어떻게 설정하나요?"

### 3. 권한 관련 보안
```bash
# 위험한 SUID 파일 찾기
find / -perm -4000 -type f 2>/dev/null

# 월드 라이터블 파일 찾기
find / -perm -002 -type f 2>/dev/null

# 소유자가 없는 파일 찾기
find / -nouser -o -nogroup 2>/dev/null
```
