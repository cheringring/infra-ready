---
question: "Bash 쉘 스크립팅의 기본 문법과 조건문, 반복문, 함수 사용법을 설명하고, 실무에서 자주 사용하는 스크립트 예시를 들어주세요."
shortAnswer: "Bash는 변수, if/case 조건문, for/while 반복문, function 정의를 지원하며, 시스템 관리, 로그 분석, 백업 자동화 등에 활용됩니다. $1, $2로 인자를 받고 $?로 종료 상태를 확인할 수 있습니다."
---

# Bash 쉘 스크립팅

## 기본 문법

### 스크립트 시작
```bash
#!/bin/bash
# 스크립트 설명
# 작성자: 홍길동
# 작성일: 2024-01-01

echo "Hello, World!"
```

### 변수 사용
```bash
# 변수 선언 (공백 없이)
NAME="홍길동"
AGE=25
TODAY=$(date +%Y-%m-%d)

# 변수 사용
echo "이름: $NAME"
echo "나이: ${AGE}세"
echo "오늘 날짜: $TODAY"

# 읽기 전용 변수
readonly PI=3.14159

# 환경 변수
export PATH="/usr/local/bin:$PATH"
```

### 특수 변수
```bash
#!/bin/bash
echo "스크립트 이름: $0"
echo "첫 번째 인자: $1"
echo "두 번째 인자: $2"
echo "모든 인자: $@"
echo "인자 개수: $#"
echo "마지막 명령 종료 상태: $?"
echo "현재 프로세스 ID: $$"
```

## 조건문

### if 문
```bash
#!/bin/bash
AGE=20

if [ $AGE -ge 18 ]; then
    echo "성인입니다"
elif [ $AGE -ge 13 ]; then
    echo "청소년입니다"
else
    echo "어린이입니다"
fi

# 파일 존재 확인
if [ -f "/etc/passwd" ]; then
    echo "passwd 파일이 존재합니다"
fi

# 디렉토리 존재 확인
if [ -d "/var/log" ]; then
    echo "log 디렉토리가 존재합니다"
fi

# 문자열 비교
if [ "$USER" = "root" ]; then
    echo "관리자로 실행 중입니다"
fi
```

### case 문
```bash
#!/bin/bash
echo "운영체제를 선택하세요 (1:Linux, 2:Windows, 3:macOS):"
read choice

case $choice in
    1)
        echo "Linux를 선택했습니다"
        ;;
    2)
        echo "Windows를 선택했습니다"
        ;;
    3)
        echo "macOS를 선택했습니다"
        ;;
    *)
        echo "잘못된 선택입니다"
        ;;
esac
```

### 비교 연산자
```bash
# 숫자 비교
-eq  # 같음
-ne  # 다름
-gt  # 큼
-ge  # 크거나 같음
-lt  # 작음
-le  # 작거나 같음

# 문자열 비교
=    # 같음
!=   # 다름
-z   # 빈 문자열
-n   # 비어있지 않은 문자열

# 파일 테스트
-f   # 일반 파일
-d   # 디렉토리
-r   # 읽기 가능
-w   # 쓰기 가능
-x   # 실행 가능
-e   # 존재함
```

## 반복문

### for 문
```bash
#!/bin/bash

# 기본 for 문
for i in 1 2 3 4 5; do
    echo "숫자: $i"
done

# 범위 for 문
for i in {1..10}; do
    echo "카운트: $i"
done

# 파일 목록 처리
for file in *.txt; do
    if [ -f "$file" ]; then
        echo "처리 중: $file"
        # 파일 처리 로직
    fi
done

# 배열 처리
servers=("web1" "web2" "db1" "cache1")
for server in "${servers[@]}"; do
    echo "서버 점검: $server"
    ping -c 1 $server > /dev/null
    if [ $? -eq 0 ]; then
        echo "$server: 정상"
    else
        echo "$server: 응답 없음"
    fi
done
```

### while 문
```bash
#!/bin/bash

# 기본 while 문
counter=1
while [ $counter -le 5 ]; do
    echo "반복 $counter"
    counter=$((counter + 1))
done

# 파일 읽기
while IFS= read -r line; do
    echo "라인: $line"
done < "/etc/passwd"

# 무한 루프 (서비스 모니터링)
while true; do
    if ! pgrep nginx > /dev/null; then
        echo "$(date): nginx가 실행되지 않음. 재시작 중..."
        systemctl start nginx
    fi
    sleep 60
done
```

## 함수

### 함수 정의와 호출
```bash
#!/bin/bash

# 함수 정의
greet() {
    echo "안녕하세요, $1님!"
}

# 반환값이 있는 함수
add_numbers() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

# 함수 호출
greet "홍길동"
result=$(add_numbers 10 20)
echo "결과: $result"
```

### 고급 함수 예시
```bash
#!/bin/bash

# 로그 함수
log() {
    local level=$1
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
}

# 파일 백업 함수
backup_file() {
    local source_file=$1
    local backup_dir=${2:-"/backup"}
    
    if [ ! -f "$source_file" ]; then
        log "ERROR" "파일이 존재하지 않음: $source_file"
        return 1
    fi
    
    local filename=$(basename "$source_file")
    local backup_file="$backup_dir/${filename}.$(date +%Y%m%d_%H%M%S)"
    
    cp "$source_file" "$backup_file"
    if [ $? -eq 0 ]; then
        log "INFO" "백업 완료: $source_file -> $backup_file"
        return 0
    else
        log "ERROR" "백업 실패: $source_file"
        return 1
    fi
}

# 함수 사용
log "INFO" "스크립트 시작"
backup_file "/etc/nginx/nginx.conf" "/backup/nginx"
```

## 실무 스크립트 예시

### 1. 시스템 상태 점검 스크립트
```bash
#!/bin/bash

# 시스템 상태 점검 스크립트
LOG_FILE="/var/log/system_check.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_disk_usage() {
    log_message "=== 디스크 사용량 점검 ==="
    df -h | while read filesystem size used avail capacity mounted; do
        if [[ $capacity =~ ^[0-9]+% ]]; then
            usage=${capacity%?}
            if [ $usage -gt 80 ]; then
                log_message "경고: $mounted 디스크 사용량이 ${capacity}입니다"
            fi
        fi
    done
}

check_memory_usage() {
    log_message "=== 메모리 사용량 점검 ==="
    memory_usage=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        log_message "경고: 메모리 사용량이 ${memory_usage}%입니다"
    else
        log_message "정보: 메모리 사용량 ${memory_usage}% (정상)"
    fi
}

check_services() {
    log_message "=== 서비스 상태 점검 ==="
    services=("nginx" "mysql" "redis")
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            log_message "정보: $service 서비스 정상 실행 중"
        else
            log_message "경고: $service 서비스가 실행되지 않음"
            # 자동 재시작 시도
            systemctl start "$service"
            if systemctl is-active --quiet "$service"; then
                log_message "정보: $service 서비스 재시작 완료"
            else
                log_message "오류: $service 서비스 재시작 실패"
            fi
        fi
    done
}

# 메인 실행
log_message "시스템 점검 시작"
check_disk_usage
check_memory_usage
check_services
log_message "시스템 점검 완료"
```

### 2. 로그 분석 스크립트
```bash
#!/bin/bash

# 웹 서버 로그 분석 스크립트
ACCESS_LOG="/var/log/nginx/access.log"
REPORT_FILE="/tmp/log_report_$(date +%Y%m%d).txt"

analyze_logs() {
    echo "=== 웹 서버 로그 분석 리포트 ===" > "$REPORT_FILE"
    echo "분석 시간: $(date)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # 상위 10개 IP 주소
    echo "=== 상위 10개 접속 IP ===" >> "$REPORT_FILE"
    awk '{print $1}' "$ACCESS_LOG" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # 상위 10개 요청 URL
    echo "=== 상위 10개 요청 URL ===" >> "$REPORT_FILE"
    awk '{print $7}' "$ACCESS_LOG" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # HTTP 상태 코드 통계
    echo "=== HTTP 상태 코드 통계 ===" >> "$REPORT_FILE"
    awk '{print $9}' "$ACCESS_LOG" | sort | uniq -c | sort -nr >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # 404 에러 URL
    echo "=== 404 에러 URL ===" >> "$REPORT_FILE"
    awk '$9 == "404" {print $7}' "$ACCESS_LOG" | sort | uniq -c | sort -nr | head -20 >> "$REPORT_FILE"
    
    echo "리포트가 생성되었습니다: $REPORT_FILE"
}

# 실행
if [ -f "$ACCESS_LOG" ]; then
    analyze_logs
else
    echo "로그 파일을 찾을 수 없습니다: $ACCESS_LOG"
    exit 1
fi
```

### 3. 데이터베이스 백업 스크립트
```bash
#!/bin/bash

# MySQL 데이터베이스 백업 스크립트
DB_USER="backup_user"
DB_PASS="backup_password"
BACKUP_DIR="/backup/mysql"
RETENTION_DAYS=7

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

backup_database() {
    local db_name=$1
    local backup_file="$BACKUP_DIR/${db_name}_$(date +%Y%m%d_%H%M%S).sql"
    
    echo "데이터베이스 백업 시작: $db_name"
    
    mysqldump -u"$DB_USER" -p"$DB_PASS" \
        --single-transaction \
        --routines \
        --triggers \
        "$db_name" > "$backup_file"
    
    if [ $? -eq 0 ]; then
        # 압축
        gzip "$backup_file"
        echo "백업 완료: ${backup_file}.gz"
        
        # 이메일 알림 (선택사항)
        echo "데이터베이스 $db_name 백업이 완료되었습니다." | \
        mail -s "DB Backup Success: $db_name" admin@company.com
    else
        echo "백업 실패: $db_name"
        echo "데이터베이스 $db_name 백업이 실패했습니다." | \
        mail -s "DB Backup Failed: $db_name" admin@company.com
        return 1
    fi
}

cleanup_old_backups() {
    echo "오래된 백업 파일 정리 중..."
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "정리 완료"
}

# 백업할 데이터베이스 목록
databases=("webapp" "userdb" "logdb")

# 백업 실행
for db in "${databases[@]}"; do
    backup_database "$db"
done

# 오래된 백업 정리
cleanup_old_backups

echo "모든 백업 작업 완료"
```

### 4. 서버 배포 스크립트
```bash
#!/bin/bash

# 웹 애플리케이션 배포 스크립트
APP_NAME="myapp"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/backup/deployments"
GIT_REPO="https://github.com/company/myapp.git"
BRANCH="main"

deploy() {
    echo "=== 배포 시작: $(date) ==="
    
    # 현재 버전 백업
    if [ -d "$APP_DIR" ]; then
        echo "현재 버전 백업 중..."
        backup_name="$BACKUP_DIR/${APP_NAME}_$(date +%Y%m%d_%H%M%S)"
        cp -r "$APP_DIR" "$backup_name"
        echo "백업 완료: $backup_name"
    fi
    
    # 새 버전 다운로드
    echo "새 버전 다운로드 중..."
    cd /tmp
    git clone -b "$BRANCH" "$GIT_REPO" "${APP_NAME}_new"
    
    if [ $? -ne 0 ]; then
        echo "Git clone 실패"
        exit 1
    fi
    
    # 의존성 설치
    echo "의존성 설치 중..."
    cd "${APP_NAME}_new"
    npm install --production
    
    if [ $? -ne 0 ]; then
        echo "의존성 설치 실패"
        exit 1
    fi
    
    # 애플리케이션 중지
    echo "애플리케이션 중지 중..."
    systemctl stop "$APP_NAME"
    
    # 파일 교체
    echo "파일 교체 중..."
    rm -rf "$APP_DIR"
    mv "/tmp/${APP_NAME}_new" "$APP_DIR"
    chown -R www-data:www-data "$APP_DIR"
    
    # 애플리케이션 시작
    echo "애플리케이션 시작 중..."
    systemctl start "$APP_NAME"
    
    # 상태 확인
    sleep 5
    if systemctl is-active --quiet "$APP_NAME"; then
        echo "배포 성공!"
        # 헬스 체크
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo "헬스 체크 통과"
        else
            echo "헬스 체크 실패 - 롤백 필요할 수 있음"
        fi
    else
        echo "배포 실패 - 롤백 중..."
        rollback
    fi
}

rollback() {
    echo "롤백 시작..."
    latest_backup=$(ls -t "$BACKUP_DIR" | head -1)
    if [ -n "$latest_backup" ]; then
        systemctl stop "$APP_NAME"
        rm -rf "$APP_DIR"
        cp -r "$BACKUP_DIR/$latest_backup" "$APP_DIR"
        systemctl start "$APP_NAME"
        echo "롤백 완료"
    else
        echo "백업을 찾을 수 없습니다"
    fi
}

# 실행
case "$1" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    *)
        echo "사용법: $0 {deploy|rollback}"
        exit 1
        ;;
esac
```

## 디버깅과 오류 처리

### 디버깅 옵션
```bash
#!/bin/bash

# 디버깅 모드
set -x  # 명령어 실행 전 출력
set -e  # 오류 발생 시 즉시 종료
set -u  # 정의되지 않은 변수 사용 시 오류

# 함수에서 오류 처리
safe_command() {
    local command="$1"
    
    if ! $command; then
        echo "명령어 실행 실패: $command"
        return 1
    fi
}

# trap을 이용한 정리 작업
cleanup() {
    echo "정리 작업 수행 중..."
    rm -f /tmp/temp_file
}

trap cleanup EXIT
```

## 신입 면접 핵심 포인트

### 1. 쉘 스크립팅의 활용
- **자동화**: 반복 작업 자동화
- **시스템 관리**: 모니터링, 백업, 배포
- **데이터 처리**: 로그 분석, 파일 처리

### 2. 모범 사례
- **오류 처리**: set -e, 조건문으로 오류 확인
- **변수 인용**: "$variable" 형태로 사용
- **함수 활용**: 재사용 가능한 코드 작성

### 3. 실무 질문 대비
- "시스템 모니터링 스크립트를 어떻게 작성하시겠습니까?"
- "cron과 연동하여 정기적인 작업을 어떻게 설정하나요?"
- "스크립트에서 오류가 발생했을 때 어떻게 처리하나요?"

### 4. 성능 고려사항
- **파이프라인 활용**: 명령어 조합으로 효율성 향상
- **병렬 처리**: 백그라운드 작업 활용
- **리소스 관리**: 메모리, CPU 사용량 고려
