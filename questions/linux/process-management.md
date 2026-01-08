---
question: "리눅스에서 프로세스 관리 방법과 시그널의 종류, 그리고 백그라운드 작업 관리에 대해 설명해주세요."
shortAnswer: "kill 명령어로 프로세스에 시그널을 보내고, jobs/fg/bg로 백그라운드 작업을 관리하며, nohup으로 터미널 종료 후에도 프로세스가 계속 실행되도록 할 수 있습니다."
---

# 리눅스 프로세스 관리

## 프로세스 확인 및 종료

### 프로세스 확인
```bash
ps aux                  # 모든 프로세스 표시
ps -ef                  # 전체 형식으로 표시
pgrep nginx             # 특정 프로세스 PID 찾기
pidof nginx             # 프로세스명으로 PID 찾기
```

### 프로세스 종료
```bash
kill PID                # 기본 종료 (SIGTERM)
kill -9 PID             # 강제 종료 (SIGKILL)
killall nginx           # 프로세스명으로 모든 관련 프로세스 종료
pkill -f "python script.py"  # 명령어 패턴으로 종료
```

## 주요 시그널 (Signal)

### SIGTERM (15) - 기본 종료 시그널
```bash
kill -15 PID
kill -TERM PID
```
- **특징**: 정상적인 종료 요청
- **동작**: 프로세스가 정리 작업 후 종료
- **차단 가능**: 프로세스가 시그널을 무시할 수 있음

### SIGKILL (9) - 강제 종료
```bash
kill -9 PID
kill -KILL PID
```
- **특징**: 즉시 강제 종료
- **동작**: 운영체제가 직접 프로세스 종료
- **차단 불가**: 프로세스가 무시할 수 없음

### SIGHUP (1) - 재시작/설정 재로드
```bash
kill -1 PID
kill -HUP PID
```
- **용도**: 설정 파일 재로드, 데몬 재시작
- **예시**: `kill -HUP nginx_pid` (nginx 설정 재로드)

### SIGSTOP (19) - 일시 정지
```bash
kill -19 PID
kill -STOP PID
```
- **동작**: 프로세스 일시 정지 (차단 불가)

### SIGCONT (18) - 재개
```bash
kill -18 PID
kill -CONT PID
```
- **동작**: 정지된 프로세스 재개

## 백그라운드 작업 관리

### 백그라운드 실행
```bash
command &               # 명령어를 백그라운드에서 실행
nohup command &         # 터미널 종료 후에도 계속 실행
```

### 작업 관리 명령어
```bash
jobs                    # 현재 세션의 작업 목록
jobs -l                 # PID 포함하여 표시
fg %1                   # 1번 작업을 포그라운드로 이동
bg %1                   # 1번 작업을 백그라운드로 이동
```

### 작업 제어
```bash
Ctrl + Z                # 현재 프로세스 일시 정지
Ctrl + C                # 현재 프로세스 종료 (SIGINT)
```

## 데몬 프로세스 관리

### systemd 서비스 관리
```bash
systemctl start nginx       # 서비스 시작
systemctl stop nginx        # 서비스 중지
systemctl restart nginx     # 서비스 재시작
systemctl reload nginx      # 설정 재로드
systemctl status nginx      # 서비스 상태 확인
systemctl enable nginx      # 부팅 시 자동 시작 설정
systemctl disable nginx     # 자동 시작 해제
```

### 서비스 로그 확인
```bash
journalctl -u nginx         # 특정 서비스 로그
journalctl -f -u nginx      # 실시간 로그 모니터링
```

## 프로세스 우선순위 관리

### nice 값 설정
```bash
nice -n 10 command          # 낮은 우선순위로 실행 (nice 값 10)
nice -n -5 command          # 높은 우선순위로 실행 (nice 값 -5)
```

### 실행 중인 프로세스 우선순위 변경
```bash
renice 10 -p PID            # PID 프로세스의 nice 값을 10으로 변경
renice 5 -u username        # 특정 사용자의 모든 프로세스 nice 값 변경
```

## 실무 시나리오

### 1. 응답하지 않는 웹 서버 재시작
```bash
# 1. 프로세스 확인
ps aux | grep nginx

# 2. 정상 종료 시도
sudo systemctl stop nginx

# 3. 강제 종료 (필요시)
sudo pkill -9 nginx

# 4. 서비스 재시작
sudo systemctl start nginx

# 5. 상태 확인
sudo systemctl status nginx
```

### 2. 메모리를 많이 사용하는 프로세스 찾기
```bash
# CPU 사용률 기준 정렬
ps aux --sort=-%cpu | head -10

# 메모리 사용률 기준 정렬
ps aux --sort=-%mem | head -10

# 특정 프로세스의 자세한 정보
cat /proc/PID/status
```

### 3. 장시간 실행되는 작업 관리
```bash
# 터미널 종료 후에도 계속 실행
nohup python long_running_script.py > output.log 2>&1 &

# screen 사용 (세션 유지)
screen -S mysession
# 작업 실행 후 Ctrl+A, D로 detach
screen -r mysession  # 다시 attach

# tmux 사용 (현대적 대안)
tmux new-session -d -s mysession 'python script.py'
tmux attach-session -t mysession
```

## 프로세스 상태 이해

### 프로세스 상태 코드
- **R (Running)**: 실행 중 또는 실행 대기
- **S (Sleeping)**: 인터럽트 가능한 대기 상태
- **D (Uninterruptible)**: 인터럽트 불가능한 대기 (보통 I/O 대기)
- **Z (Zombie)**: 좀비 프로세스 (종료되었지만 정리되지 않음)
- **T (Stopped)**: 정지된 상태

### 좀비 프로세스 처리
```bash
# 좀비 프로세스 확인
ps aux | grep '<defunct>'

# 부모 프로세스 종료로 해결
kill -9 PPID
```

## 신입 면접 핵심 포인트

### 1. 시그널과 프로세스 종료
- **SIGTERM vs SIGKILL**: 정상 종료 vs 강제 종료
- **언제 kill -9를 사용하나요?**: 프로세스가 응답하지 않을 때

### 2. 백그라운드 작업의 중요성
- **nohup의 용도**: 터미널 종료 후에도 작업 지속
- **screen/tmux**: 세션 관리의 중요성

### 3. 실무 질문 대비
- "서버에서 특정 프로세스가 응답하지 않을 때 어떻게 처리하나요?"
- "백그라운드에서 실행 중인 작업을 어떻게 관리하나요?"
- "시스템 재부팅 없이 서비스를 재시작하는 방법은?"
