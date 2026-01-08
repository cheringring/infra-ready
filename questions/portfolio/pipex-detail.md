---
question: "pipex 프로젝트에서 fork()와 pipe()를 어떻게 사용했나요? 프로세스 간 통신은 어떻게 구현했나요?"
shortAnswer: "pipex는 쉘의 파이프를 구현하는 프로젝트입니다. fork()로 자식 프로세스를 생성하고, pipe()로 프로세스 간 통신 채널을 만들었습니다. 첫 번째 명령의 출력을 파이프로 두 번째 명령의 입력으로 연결했습니다."
---

## 상세 답변

### pipex 프로젝트 개요

**목표**
```bash
# 쉘 명령어
< infile cmd1 | cmd2 > outfile

# pipex로 구현
./pipex infile "cmd1" "cmd2" outfile
```

**예시**
```bash
# 쉘
< input.txt grep "hello" | wc -l > output.txt

# pipex
./pipex input.txt "grep hello" "wc -l" output.txt
```

### 핵심 개념

#### 1. fork() - 프로세스 생성

**동작 원리**
```c
#include <unistd.h>

int main() {
    pid_t pid = fork();
    
    if (pid < 0) {
        // fork 실패
        perror("fork");
        return 1;
    }
    else if (pid == 0) {
        // 자식 프로세스
        printf("자식 프로세스: PID = %d\n", getpid());
    }
    else {
        // 부모 프로세스
        printf("부모 프로세스: PID = %d, 자식 PID = %d\n", getpid(), pid);
        wait(NULL);  // 자식 프로세스 대기
    }
    
    return 0;
}
```

**메모리 구조**
```
fork() 호출 전:
┌─────────────┐
│ 부모 프로세스 │
│  PID: 1234  │
└─────────────┘

fork() 호출 후:
┌─────────────┐     ┌─────────────┐
│ 부모 프로세스 │     │ 자식 프로세스 │
│  PID: 1234  │     │  PID: 5678  │
│  fork() = 5678│   │  fork() = 0 │
└─────────────┘     └─────────────┘
```

#### 2. pipe() - 프로세스 간 통신

**동작 원리**
```c
#include <unistd.h>

int main() {
    int pipefd[2];  // pipefd[0]: 읽기, pipefd[1]: 쓰기
    
    if (pipe(pipefd) == -1) {
        perror("pipe");
        return 1;
    }
    
    pid_t pid = fork();
    
    if (pid == 0) {
        // 자식: 파이프에 쓰기
        close(pipefd[0]);  // 읽기 끝 닫기
        write(pipefd[1], "Hello from child", 16);
        close(pipefd[1]);
    }
    else {
        // 부모: 파이프에서 읽기
        close(pipefd[1]);  // 쓰기 끝 닫기
        char buffer[100];
        read(pipefd[0], buffer, 100);
        printf("부모가 받음: %s\n", buffer);
        close(pipefd[0]);
        wait(NULL);
    }
    
    return 0;
}
```

**파이프 구조**
```
┌─────────────┐     ┌──────┐     ┌─────────────┐
│ 프로세스 A   │ --> │ PIPE │ --> │ 프로세스 B   │
│  write()    │     │ 커널  │     │  read()     │
└─────────────┘     └──────┘     └─────────────┘
```

#### 3. execve() - 프로그램 실행

**동작 원리**
```c
#include <unistd.h>

int main() {
    char *args[] = {"/bin/ls", "-l", NULL};
    char *env[] = {NULL};
    
    execve("/bin/ls", args, env);
    
    // execve 성공 시 이 코드는 실행 안 됨
    perror("execve");
    return 1;
}
```

### pipex 구현

#### 기본 구조
```c
// pipex.c
#include <unistd.h>
#include <fcntl.h>
#include <sys/wait.h>

int main(int argc, char **argv, char **envp) {
    // ./pipex infile "cmd1" "cmd2" outfile
    if (argc != 5) {
        write(2, "Usage: ./pipex infile cmd1 cmd2 outfile\n", 41);
        return 1;
    }
    
    int pipefd[2];
    pipe(pipefd);
    
    // 첫 번째 명령 실행
    pid_t pid1 = fork();
    if (pid1 == 0) {
        execute_cmd1(argv, envp, pipefd);
    }
    
    // 두 번째 명령 실행
    pid_t pid2 = fork();
    if (pid2 == 0) {
        execute_cmd2(argv, envp, pipefd);
    }
    
    // 부모는 파이프 닫고 자식 대기
    close(pipefd[0]);
    close(pipefd[1]);
    waitpid(pid1, NULL, 0);
    waitpid(pid2, NULL, 0);
    
    return 0;
}
```

#### 첫 번째 명령 실행
```c
void execute_cmd1(char **argv, char **envp, int *pipefd) {
    // infile 열기
    int infile = open(argv[1], O_RDONLY);
    if (infile < 0) {
        perror("infile");
        exit(1);
    }
    
    // stdin을 infile로 리다이렉트
    dup2(infile, STDIN_FILENO);
    close(infile);
    
    // stdout을 파이프 쓰기로 리다이렉트
    dup2(pipefd[1], STDOUT_FILENO);
    close(pipefd[0]);  // 읽기 끝 닫기
    close(pipefd[1]);
    
    // 명령 실행
    char **cmd = parse_command(argv[2]);  // "grep hello" -> ["grep", "hello"]
    execve(find_path(cmd[0], envp), cmd, envp);
    
    // execve 실패 시
    perror("cmd1");
    exit(1);
}
```

#### 두 번째 명령 실행
```c
void execute_cmd2(char **argv, char **envp, int *pipefd) {
    // outfile 열기
    int outfile = open(argv[4], O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (outfile < 0) {
        perror("outfile");
        exit(1);
    }
    
    // stdin을 파이프 읽기로 리다이렉트
    dup2(pipefd[0], STDIN_FILENO);
    close(pipefd[1]);  // 쓰기 끝 닫기
    close(pipefd[0]);
    
    // stdout을 outfile로 리다이렉트
    dup2(outfile, STDOUT_FILENO);
    close(outfile);
    
    // 명령 실행
    char **cmd = parse_command(argv[3]);  // "wc -l" -> ["wc", "-l"]
    execve(find_path(cmd[0], envp), cmd, envp);
    
    // execve 실패 시
    perror("cmd2");
    exit(1);
}
```

### 파일 디스크립터 리다이렉션

#### dup2() 동작
```c
// dup2(oldfd, newfd)
// newfd를 닫고, oldfd를 newfd로 복사

int fd = open("file.txt", O_RDONLY);
dup2(fd, STDIN_FILENO);  // stdin이 file.txt를 가리킴
close(fd);

// 이제 read(STDIN_FILENO, ...)는 file.txt에서 읽음
```

**시각화**
```
Before dup2(fd, STDIN_FILENO):
STDIN_FILENO (0) -> 터미널
fd (3)           -> file.txt

After dup2(fd, STDIN_FILENO):
STDIN_FILENO (0) -> file.txt
fd (3)           -> file.txt

After close(fd):
STDIN_FILENO (0) -> file.txt
fd (3)           -> (닫힘)
```

### 전체 흐름

```
1. 부모 프로세스
   ├─ pipe() 생성
   │
   ├─ fork() -> 자식1
   │   ├─ infile 열기
   │   ├─ dup2(infile, STDIN)
   │   ├─ dup2(pipe[1], STDOUT)
   │   └─ execve("grep", ["grep", "hello"])
   │
   ├─ fork() -> 자식2
   │   ├─ dup2(pipe[0], STDIN)
   │   ├─ outfile 열기
   │   ├─ dup2(outfile, STDOUT)
   │   └─ execve("wc", ["wc", "-l"])
   │
   └─ wait() 자식들 대기
```

**데이터 흐름**
```
infile -> grep (자식1) -> pipe -> wc (자식2) -> outfile
```

### 에러 처리

#### 1. 파일 열기 실패
```c
int fd = open(argv[1], O_RDONLY);
if (fd < 0) {
    perror("Error opening file");
    exit(1);
}
```

#### 2. 명령어 찾기 실패
```c
char *path = find_path("grep", envp);
if (!path) {
    write(2, "command not found: grep\n", 24);
    exit(127);
}
```

#### 3. 파이프 실패
```c
if (pipe(pipefd) == -1) {
    perror("pipe");
    exit(1);
}
```

### PATH 환경 변수 처리

```c
char *find_path(char *cmd, char **envp) {
    // PATH 찾기
    char *path_env = NULL;
    for (int i = 0; envp[i]; i++) {
        if (strncmp(envp[i], "PATH=", 5) == 0) {
            path_env = envp[i] + 5;
            break;
        }
    }
    
    if (!path_env)
        return NULL;
    
    // PATH를 ':'로 분리
    char *paths = strdup(path_env);
    char *dir = strtok(paths, ":");
    
    while (dir) {
        // /usr/bin/grep 형태로 조합
        char *full_path = malloc(strlen(dir) + strlen(cmd) + 2);
        sprintf(full_path, "%s/%s", dir, cmd);
        
        // 실행 가능한지 확인
        if (access(full_path, X_OK) == 0) {
            free(paths);
            return full_path;
        }
        
        free(full_path);
        dir = strtok(NULL, ":");
    }
    
    free(paths);
    return NULL;
}
```

### 보너스: here_doc

```bash
# 쉘
<< LIMITER cmd1 | cmd2 > outfile

# pipex
./pipex here_doc LIMITER "cmd1" "cmd2" outfile
```

**구현**
```c
void handle_here_doc(char *limiter, int *pipefd) {
    char *line;
    
    while (1) {
        write(1, "> ", 2);
        line = get_next_line(STDIN_FILENO);
        
        if (strcmp(line, limiter) == 0)
            break;
        
        write(pipefd[1], line, strlen(line));
        free(line);
    }
    
    close(pipefd[1]);
}
```

### 실무 연관성

#### 1. 쉘 스크립트 이해
```bash
# 파이프라인 이해
cat access.log | grep "ERROR" | wc -l

# 리다이렉션 이해
command > output.txt 2>&1
```

#### 2. 프로세스 관리
- Docker: 컨테이너는 프로세스
- Kubernetes: Pod는 프로세스 그룹
- Systemd: 서비스 프로세스 관리

#### 3. IPC (Inter-Process Communication)
- Pipe: 단방향 통신
- Socket: 양방향 통신
- Message Queue: 비동기 통신
- Shared Memory: 고속 통신

### 디버깅 팁

```bash
# 프로세스 확인
ps aux | grep pipex

# 파일 디스크립터 확인
lsof -p [PID]

# strace로 시스템 콜 추적
strace ./pipex infile "grep hello" "wc -l" outfile
```

### 면접 답변 예시

**질문**: "pipex에서 fork()와 pipe()를 어떻게 사용했나요?"

**답변**:
"pipex는 쉘의 파이프를 구현하는 프로젝트입니다. 먼저 pipe()로 프로세스 간 통신 채널을 만들고, fork()로 두 개의 자식 프로세스를 생성했습니다. 첫 번째 자식은 infile에서 읽어 첫 번째 명령을 실행하고, 결과를 파이프에 씁니다. 두 번째 자식은 파이프에서 읽어 두 번째 명령을 실행하고, 결과를 outfile에 씁니다. dup2()로 파일 디스크립터를 리다이렉트하고, execve()로 실제 명령을 실행했습니다. 이 프로젝트를 통해 Linux의 프로세스 관리와 IPC를 깊이 이해하게 되었고, 실무에서 Docker나 Kubernetes의 프로세스 격리 개념을 이해하는 데 도움이 되었습니다."

**추가 질문 대비**:
- "fork()와 exec()의 차이는?"
- "파이프 외에 다른 IPC 방법은?"
- "좀비 프로세스는 무엇인가요?"
