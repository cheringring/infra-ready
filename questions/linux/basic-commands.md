---
question: "자주 사용하는 Linux 명령어들을 설명해보세요"
shortAnswer: "ls(파일 목록), cd(디렉토리 이동), pwd(현재 경로), cat(파일 내용 출력), grep(텍스트 검색), ps(프로세스 확인), top(시스템 모니터링), chmod(권한 변경), chown(소유자 변경), df(디스크 사용량), free(메모리 사용량) 등이 있습니다."
---

## Linux 필수 명령어 상세 가이드

### 파일 및 디렉토리 관리

#### ls - 파일 목록 조회
```bash
ls -la          # 숨김 파일 포함 상세 정보
ls -lh          # 사람이 읽기 쉬운 형식
ls -lt          # 수정 시간 순 정렬
```

#### cd - 디렉토리 이동
```bash
cd /path/to/dir # 절대 경로 이동
cd ..           # 상위 디렉토리
cd ~            # 홈 디렉토리
cd -            # 이전 디렉토리
```

#### pwd - 현재 경로 출력
```bash
pwd             # 현재 작업 디렉토리 출력
```

#### mkdir - 디렉토리 생성
```bash
mkdir dir_name          # 디렉토리 생성
mkdir -p path/to/dir    # 중간 경로 자동 생성
```

#### rm - 파일/디렉토리 삭제
```bash
rm file.txt             # 파일 삭제
rm -r directory         # 디렉토리 삭제
rm -rf directory        # 강제 삭제 (주의!)
```

### 파일 내용 확인

#### cat - 파일 내용 출력
```bash
cat file.txt            # 전체 내용 출력
cat file1 file2         # 여러 파일 연결 출력
```

#### less/more - 페이지 단위 출력
```bash
less file.txt           # 스크롤 가능한 뷰어
more file.txt           # 페이지 단위 출력
```

#### head/tail - 파일 일부 출력
```bash
head -n 10 file.txt     # 처음 10줄
tail -n 10 file.txt     # 마지막 10줄
tail -f log.txt         # 실시간 로그 모니터링
```

### 검색 및 필터링

#### grep - 텍스트 검색
```bash
grep "pattern" file.txt         # 패턴 검색
grep -r "pattern" /path         # 재귀 검색
grep -i "pattern" file.txt      # 대소문자 무시
grep -v "pattern" file.txt      # 패턴 제외
```

#### find - 파일 검색
```bash
find /path -name "*.txt"        # 이름으로 검색
find /path -type f -mtime -7    # 7일 이내 수정된 파일
find /path -size +100M          # 100MB 이상 파일
```

### 프로세스 관리

#### ps - 프로세스 확인
```bash
ps aux                  # 모든 프로세스
ps aux | grep nginx     # 특정 프로세스 검색
```

#### top/htop - 실시간 모니터링
```bash
top                     # 시스템 리소스 모니터링
htop                    # 향상된 인터페이스 (설치 필요)
```

#### kill - 프로세스 종료
```bash
kill PID                # 프로세스 종료
kill -9 PID             # 강제 종료
killall process_name    # 이름으로 종료
```

### 권한 관리

#### chmod - 파일 권한 변경
```bash
chmod 755 file.sh       # rwxr-xr-x
chmod +x file.sh        # 실행 권한 추가
chmod -R 644 /path      # 재귀적 권한 변경
```

#### chown - 소유자 변경
```bash
chown user:group file   # 소유자:그룹 변경
chown -R user /path     # 재귀적 변경
```

### 시스템 정보

#### df - 디스크 사용량
```bash
df -h                   # 사람이 읽기 쉬운 형식
df -i                   # inode 사용량
```

#### free - 메모리 사용량
```bash
free -h                 # 메모리 사용 현황
```

#### du - 디렉토리 크기
```bash
du -sh /path            # 디렉토리 총 크기
du -h --max-depth=1     # 하위 디렉토리별 크기
```

### 네트워크

#### netstat - 네트워크 연결 확인
```bash
netstat -tuln           # 리스닝 포트 확인
netstat -anp            # 모든 연결과 프로세스
```

#### curl - HTTP 요청
```bash
curl https://api.example.com    # GET 요청
curl -X POST -d "data" url      # POST 요청
```

### 실무 팁

1. **파이프(|) 활용**: 명령어 조합
   ```bash
   ps aux | grep nginx | grep -v grep
   ```

2. **리다이렉션**: 출력 저장
   ```bash
   command > output.txt        # 덮어쓰기
   command >> output.txt       # 추가
   ```

3. **백그라운드 실행**:
   ```bash
   command &                   # 백그라운드 실행
   nohup command &             # 로그아웃 후에도 실행
   ```
