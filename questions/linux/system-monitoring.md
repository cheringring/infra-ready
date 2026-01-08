---
question: "리눅스 시스템 모니터링을 위한 주요 명령어들과 각각의 용도를 설명해주세요."
shortAnswer: "top/htop으로 프로세스 모니터링, df/du로 디스크 사용량, free로 메모리 사용량, netstat/ss로 네트워크 연결 상태, iostat으로 I/O 성능을 모니터링할 수 있습니다."
---

# 리눅스 시스템 모니터링 명령어

## 프로세스 모니터링

### top
```bash
top
```
- **기능**: 실시간 프로세스 및 시스템 리소스 모니터링
- **주요 정보**: CPU, 메모리 사용률, 프로세스 목록
- **유용한 옵션**:
  - `top -u username`: 특정 사용자 프로세스만 표시
  - `top -p PID`: 특정 프로세스만 모니터링

### htop
```bash
htop
```
- **특징**: top의 개선된 버전
- **장점**: 컬러 표시, 마우스 지원, 직관적 인터페이스
- **기능**: 프로세스 트리 보기, 검색, 정렬

### ps
```bash
ps aux                    # 모든 프로세스 표시
ps -ef                    # 전체 형식으로 프로세스 표시
ps -u username            # 특정 사용자 프로세스
```

## 메모리 모니터링

### free
```bash
free -h                   # 사람이 읽기 쉬운 형태로 표시
free -m                   # MB 단위로 표시
free -s 5                 # 5초마다 갱신
```
- **정보**: 총 메모리, 사용 중, 여유, 버퍼/캐시

### vmstat
```bash
vmstat 1 5               # 1초 간격으로 5번 출력
```
- **정보**: 가상 메모리, 프로세스, CPU 통계

## 디스크 모니터링

### df (Disk Free)
```bash
df -h                    # 파일시스템 사용량 (사람이 읽기 쉬운 형태)
df -i                    # inode 사용량
df -T                    # 파일시스템 타입 포함
```

### du (Disk Usage)
```bash
du -h /path              # 디렉토리별 사용량
du -sh *                 # 현재 디렉토리 하위 항목별 요약
du -ah /path | head -20  # 큰 파일/디렉토리 상위 20개
```

### iostat
```bash
iostat -x 1 5           # 확장된 I/O 통계, 1초 간격 5번
```
- **정보**: 디스크 I/O 성능, 읽기/쓰기 속도

## 네트워크 모니터링

### netstat
```bash
netstat -tuln           # TCP/UDP 리스닝 포트
netstat -an             # 모든 연결 상태
netstat -rn             # 라우팅 테이블
```

### ss (Socket Statistics)
```bash
ss -tuln                # netstat의 현대적 대안
ss -s                   # 소켓 통계 요약
```

### iftop
```bash
iftop -i eth0           # 네트워크 인터페이스별 트래픽
```

## 로그 모니터링

### tail
```bash
tail -f /var/log/syslog     # 실시간 로그 모니터링
tail -n 100 /var/log/auth.log  # 마지막 100줄
```

### journalctl (systemd)
```bash
journalctl -f               # 실시간 로그
journalctl -u nginx         # 특정 서비스 로그
journalctl --since "1 hour ago"  # 1시간 전부터 로그
```

## 종합 모니터링 도구

### sar (System Activity Reporter)
```bash
sar -u 1 10             # CPU 사용률 1초 간격 10번
sar -r 1 10             # 메모리 사용률
sar -d 1 10             # 디스크 I/O
```

### nmon
```bash
nmon
```
- **특징**: 올인원 성능 모니터링 도구
- **기능**: CPU, 메모리, 디스크, 네트워크 통합 모니터링

## 실무 시나리오별 명령어

### 1. 시스템이 느릴 때
```bash
# 1. CPU 사용률 확인
top
# 2. 메모리 사용률 확인
free -h
# 3. 디스크 I/O 확인
iostat -x 1 5
# 4. 프로세스별 리소스 사용량
ps aux --sort=-%cpu | head -10
```

### 2. 디스크 공간 부족 시
```bash
# 1. 파일시스템 사용량 확인
df -h
# 2. 큰 디렉토리 찾기
du -sh /* | sort -hr
# 3. 큰 파일 찾기
find / -type f -size +100M -exec ls -lh {} \;
```

### 3. 네트워크 문제 진단
```bash
# 1. 네트워크 연결 상태
ss -tuln
# 2. 네트워크 트래픽
iftop
# 3. 연결된 클라이언트 수
ss -s
```

## 신입 면접 핵심 포인트

### 1. 성능 병목 지점 파악
- **CPU 병목**: load average > CPU 코어 수
- **메모리 병목**: swap 사용량 증가
- **디스크 병목**: I/O wait 시간 증가

### 2. 알람 설정 기준
- **CPU 사용률**: 80% 이상
- **메모리 사용률**: 90% 이상
- **디스크 사용률**: 85% 이상

### 3. 실무 질문 대비
- "서버가 느려졌다는 신고가 들어왔을 때 어떤 순서로 확인하나요?"
- "메모리 부족 상황을 어떻게 판단하고 해결하나요?"
- "로그 파일이 너무 클 때 어떻게 관리하나요?"
