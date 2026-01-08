---
question: "프로세스와 스레드의 차이점을 설명해주세요."
shortAnswer: "프로세스는 독립적인 메모리 공간을 가진 실행 단위이고, 스레드는 프로세스 내에서 메모리를 공유하는 실행 단위입니다. 프로세스 간 통신은 IPC가 필요하지만, 스레드는 메모리를 공유하므로 통신이 쉽습니다."
---

## 상세 답변

### 프로세스 (Process)

#### 정의
- 실행 중인 프로그램의 인스턴스
- 독립적인 메모리 공간 보유
- 최소 하나의 스레드(메인 스레드) 포함

#### 메모리 구조
```
┌─────────────────┐
│     Stack       │ ← 지역 변수, 함수 호출
├─────────────────┤
│       ↓         │
│                 │
│       ↑         │
├─────────────────┤
│     Heap        │ ← 동적 할당 (malloc, new)
├─────────────────┤
│     Data        │ ← 전역 변수, 정적 변수
├─────────────────┤
│     Code        │ ← 실행 코드
└─────────────────┘
```

#### 특징
- **독립성**: 각 프로세스는 독립적인 메모리 공간
- **안정성**: 한 프로세스 오류가 다른 프로세스에 영향 없음
- **무겁다**: 생성/전환 비용이 큼
- **IPC 필요**: 프로세스 간 통신에 별도 메커니즘 필요

### 스레드 (Thread)

#### 정의
- 프로세스 내의 실행 단위
- 프로세스의 자원을 공유
- 경량 프로세스(LWP)라고도 함

#### 메모리 구조
```
프로세스
┌─────────────────────────────┐
│  Thread 1   Thread 2        │
│  ┌──────┐   ┌──────┐        │
│  │Stack │   │Stack │        │ ← 각자의 Stack
│  └──────┘   └──────┘        │
├─────────────────────────────┤
│      Heap (공유)             │ ← 공유
├─────────────────────────────┤
│      Data (공유)             │ ← 공유
├─────────────────────────────┤
│      Code (공유)             │ ← 공유
└─────────────────────────────┘
```

#### 특징
- **공유**: Code, Data, Heap 영역 공유
- **독립**: 각자의 Stack, PC(Program Counter), Register
- **가볍다**: 생성/전환 비용이 적음
- **통신 쉬움**: 메모리 공유로 빠른 통신

### 비교표

| 특성 | 프로세스 | 스레드 |
|------|---------|--------|
| 메모리 | 독립적 | 공유 (Stack만 독립) |
| 생성 비용 | 크다 | 작다 |
| 전환 비용 | 크다 (Context Switching) | 작다 |
| 통신 | IPC 필요 | 메모리 공유 |
| 안정성 | 높음 (격리) | 낮음 (공유) |
| 동기화 | 불필요 | 필요 (Mutex, Semaphore) |

### Context Switching

#### 프로세스 Context Switching
```
1. 현재 프로세스 상태 저장 (PCB)
2. 다음 프로세스 상태 복원
3. 메모리 맵 전환 (페이지 테이블)
4. 캐시 무효화 (TLB flush)
→ 비용이 큼!
```

#### 스레드 Context Switching
```
1. 현재 스레드 상태 저장 (TCB)
2. 다음 스레드 상태 복원
3. 메모리 맵 유지 (같은 프로세스)
→ 비용이 적음!
```

### 멀티프로세스 vs 멀티스레드

#### 멀티프로세스
**장점**
- 안정성: 한 프로세스 죽어도 다른 프로세스 영향 없음
- 보안: 메모리 격리

**단점**
- 메모리 사용량 많음
- 통신 복잡 (IPC)
- 생성/전환 비용 큼

**사용 사례**
- Chrome 브라우저 (탭마다 프로세스)
- Nginx (워커 프로세스)
- 독립적인 작업 처리

#### 멀티스레드
**장점**
- 메모리 효율적
- 빠른 통신
- 생성/전환 빠름

**단점**
- 동기화 문제 (Race Condition)
- 한 스레드 오류가 전체 프로세스 영향
- 디버깅 어려움

**사용 사례**
- 웹 서버 (요청마다 스레드)
- 게임 (렌더링, 물리, AI 스레드)
- 병렬 처리

### IPC (Inter-Process Communication)

프로세스 간 통신 방법:

#### 1. Pipe
```bash
# 익명 파이프
ls | grep txt

# 명명된 파이프 (FIFO)
mkfifo mypipe
echo "hello" > mypipe &
cat < mypipe
```

#### 2. Message Queue
```c
// 메시지 큐 생성
int msgid = msgget(key, IPC_CREAT | 0666);

// 메시지 전송
msgsnd(msgid, &message, sizeof(message), 0);

// 메시지 수신
msgrcv(msgid, &message, sizeof(message), 1, 0);
```

#### 3. Shared Memory
```c
// 공유 메모리 생성
int shmid = shmget(key, size, IPC_CREAT | 0666);

// 연결
char *str = (char*) shmat(shmid, NULL, 0);

// 사용
strcpy(str, "Hello");

// 분리
shmdt(str);
```

#### 4. Socket
```python
# 서버
server = socket.socket()
server.bind(('localhost', 8080))
server.listen()
conn, addr = server.accept()

# 클라이언트
client = socket.socket()
client.connect(('localhost', 8080))
```

### 동기화 문제

#### Race Condition
```python
# 문제 상황
counter = 0

def increment():
    global counter
    for _ in range(100000):
        counter += 1  # 원자적 연산 아님!

# 두 스레드가 동시 실행
thread1 = Thread(target=increment)
thread2 = Thread(target=increment)
thread1.start()
thread2.start()
thread1.join()
thread2.join()

print(counter)  # 200000이 아닐 수 있음!
```

#### 해결: Mutex (Mutual Exclusion)
```python
from threading import Lock

counter = 0
lock = Lock()

def increment():
    global counter
    for _ in range(100000):
        with lock:  # 임계 영역
            counter += 1

# 이제 안전!
```

### 실무 예시

#### Chrome 브라우저
- **멀티프로세스**: 각 탭이 별도 프로세스
- **이유**: 한 탭 크래시가 다른 탭에 영향 없음
- **단점**: 메모리 사용량 많음

#### Node.js
- **싱글 스레드**: 이벤트 루프
- **워커 스레드**: CPU 집약적 작업용
- **클러스터**: CPU 코어마다 프로세스

```javascript
// 워커 스레드
const { Worker } = require('worker_threads');
const worker = new Worker('./worker.js');

// 클러스터
const cluster = require('cluster');
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

#### Python GIL (Global Interpreter Lock)
- CPython은 GIL로 인해 멀티스레드가 CPU 병렬 처리 못 함
- **해결책**: 멀티프로세싱 사용

```python
# 멀티스레딩 (I/O 작업에 유리)
from threading import Thread

# 멀티프로세싱 (CPU 작업에 유리)
from multiprocessing import Process
```

### Linux 명령어

```bash
# 프로세스 확인
ps aux
ps -ef
top
htop

# 특정 프로세스의 스레드 확인
ps -eLf | grep [프로세스명]
top -H -p [PID]

# 프로세스 트리
pstree

# 프로세스 종료
kill [PID]
kill -9 [PID]  # 강제 종료
killall [프로세스명]
```

### 면접 팁

**좋은 답변 구조**:
1. 정의 설명
2. 메모리 구조 차이
3. 장단점 비교
4. 실무 사례

**예시 답변**:
"프로세스는 독립적인 메모리 공간을 가진 실행 단위이고, 스레드는 프로세스 내에서 Code, Data, Heap을 공유하며 Stack만 독립적으로 가집니다. Chrome은 안정성을 위해 탭마다 프로세스를 사용하고, 웹 서버는 효율성을 위해 요청마다 스레드를 사용합니다. 제가 진행한 프로젝트에서는 [구체적 경험]..."

**추가 질문 대비**:
- "멀티프로세스와 멀티스레드 중 어떤 것을 선택하시겠습니까?"
- "Race Condition을 어떻게 해결하나요?"
- "Context Switching이 무엇인가요?"
