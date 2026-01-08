---
question: "JVM의 메모리 구조를 설명해주세요."
shortAnswer: "JVM 메모리는 크게 Heap, Stack, Method Area, PC Register, Native Method Stack으로 구성됩니다. Heap은 객체가 저장되고 GC 대상이며, Stack은 메서드 호출과 지역 변수를 저장합니다."
---

## 상세 답변

### JVM (Java Virtual Machine) 메모리 구조

```
┌─────────────────────────────────────┐
│          JVM Memory                 │
├─────────────────────────────────────┤
│  Method Area (Metaspace)            │ ← 클래스 메타데이터
│  - 클래스 정보                       │
│  - 상수 풀                          │
│  - static 변수                      │
├─────────────────────────────────────┤
│  Heap                               │ ← 객체 저장
│  ┌─────────────────────────────┐   │
│  │  Young Generation           │   │
│  │  - Eden                     │   │
│  │  - Survivor 0               │   │
│  │  - Survivor 1               │   │
│  ├─────────────────────────────┤   │
│  │  Old Generation             │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Stack (Thread별로 생성)            │ ← 메서드 호출
│  - 지역 변수                        │
│  - 메서드 파라미터                  │
│  - 리턴 주소                        │
├─────────────────────────────────────┤
│  PC Register (Thread별로 생성)      │ ← 현재 실행 위치
├─────────────────────────────────────┤
│  Native Method Stack                │ ← Native 메서드
└─────────────────────────────────────┘
```

### 1. Heap 영역

**특징**
- 모든 객체와 배열이 저장되는 공간
- 모든 스레드가 공유
- Garbage Collection의 대상
- `-Xms`, `-Xmx`로 크기 조정

**구조**
```
Young Generation (새로 생성된 객체)
├── Eden: 객체가 최초로 생성되는 공간
├── Survivor 0: Eden에서 살아남은 객체
└── Survivor 1: Survivor 0에서 살아남은 객체

Old Generation (오래된 객체)
└── 여러 번의 GC에서 살아남은 객체
```

**예시**
```java
public class HeapExample {
    public static void main(String[] args) {
        // Heap에 저장
        Person person = new Person("홍길동");
        int[] numbers = new int[100];
        List<String> list = new ArrayList<>();
    }
}
```

### 2. Stack 영역

**특징**
- 각 스레드마다 독립적으로 생성
- 메서드 호출 시 스택 프레임 생성
- LIFO (Last In First Out) 구조
- 지역 변수, 매개변수 저장
- `-Xss`로 크기 조정

**스택 프레임 구조**
```
┌─────────────────────┐
│  Local Variables    │ ← 지역 변수
├─────────────────────┤
│  Operand Stack      │ ← 연산 스택
├─────────────────────┤
│  Frame Data         │ ← 메서드 정보
└─────────────────────┘
```

**예시**
```java
public class StackExample {
    public static void main(String[] args) {  // Stack Frame 1
        int a = 10;        // Stack에 저장
        int b = 20;        // Stack에 저장
        int result = add(a, b);  // Stack Frame 2 생성
        System.out.println(result);
    }
    
    public static int add(int x, int y) {  // Stack Frame 2
        int sum = x + y;   // Stack에 저장
        return sum;        // Stack Frame 2 제거
    }
}
```

**메서드 호출 과정**
```
1. main() 호출
   Stack: [main]

2. add() 호출
   Stack: [main] → [add]

3. add() 종료
   Stack: [main]

4. main() 종료
   Stack: []
```

### 3. Method Area (Metaspace)

**특징**
- 클래스 메타데이터 저장
- 모든 스레드가 공유
- Java 8부터 Metaspace로 변경 (Native Memory 사용)
- `-XX:MetaspaceSize`, `-XX:MaxMetaspaceSize`로 조정

**저장 내용**
```
- 클래스 정보 (필드, 메서드, 생성자)
- Runtime Constant Pool (상수 풀)
- static 변수
- 메서드 바이트코드
```

**예시**
```java
public class MethodAreaExample {
    // Method Area에 저장
    static int staticVar = 100;
    static final String CONSTANT = "상수";
    
    // 클래스 정보도 Method Area에 저장
    private String name;
    
    public void method() {
        // 메서드 바이트코드도 Method Area에 저장
    }
}
```

### 4. PC Register

**특징**
- 각 스레드마다 독립적으로 생성
- 현재 실행 중인 JVM 명령어 주소 저장
- 매우 작은 메모리 공간

### 5. Native Method Stack

**특징**
- Native 메서드 (C/C++) 호출 시 사용
- JNI (Java Native Interface)

### Heap vs Stack 비교

| 특성 | Heap | Stack |
|------|------|-------|
| 저장 대상 | 객체, 배열 | 지역 변수, 메서드 호출 |
| 공유 | 모든 스레드 공유 | 스레드별 독립 |
| 크기 | 크다 | 작다 |
| 속도 | 느림 | 빠름 |
| 생명 주기 | GC가 관리 | 메서드 종료 시 자동 제거 |
| 에러 | OutOfMemoryError | StackOverflowError |

### 메모리 할당 예시

```java
public class MemoryExample {
    // Method Area에 저장
    static int staticValue = 100;
    
    // Method Area에 저장
    private int instanceValue;
    
    public void method(int param) {
        // Stack에 저장
        int localVar = 10;
        
        // Heap에 객체 생성, Stack에 참조 저장
        String str = new String("Hello");
        
        // Heap에 배열 생성, Stack에 참조 저장
        int[] arr = new int[5];
    }
}
```

**메모리 배치**
```
Method Area:
- MemoryExample 클래스 정보
- staticValue = 100

Stack (method 호출 시):
- param = (매개변수 값)
- localVar = 10
- str = 0x1234 (Heap 주소)
- arr = 0x5678 (Heap 주소)

Heap:
- 0x1234: String 객체 "Hello"
- 0x5678: int[5] 배열
```

### Garbage Collection

**Minor GC (Young Generation)**
```
1. Eden 영역이 가득 참
2. 살아있는 객체를 Survivor 0으로 이동
3. Eden 영역 비움
4. Survivor 0과 1을 번갈아 사용
```

**Major GC (Old Generation)**
```
1. Old 영역이 가득 참
2. Mark: 살아있는 객체 표시
3. Sweep: 죽은 객체 제거
4. Compact: 메모리 압축 (선택적)
```

**GC 알고리즘**
- Serial GC: 단일 스레드
- Parallel GC: 멀티 스레드
- CMS GC: 동시 마크 스윕
- G1 GC: 리전 기반 (Java 9+ 기본)
- ZGC: 초저지연 (Java 11+)

### 메모리 튜닝

```bash
# Heap 크기 설정
java -Xms512m -Xmx2g MyApp

# Stack 크기 설정
java -Xss1m MyApp

# Metaspace 크기 설정
java -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m MyApp

# GC 로그
java -Xlog:gc* -Xlog:gc:gc.log MyApp

# GC 알고리즘 선택
java -XX:+UseG1GC MyApp
```

### 메모리 누수 예시

```java
// 나쁜 예: 메모리 누수
public class MemoryLeak {
    private static List<Object> list = new ArrayList<>();
    
    public void addObject() {
        // 계속 추가만 하고 제거 안 함
        list.add(new Object());
    }
}

// 좋은 예: 적절한 관리
public class GoodPractice {
    private List<Object> list = new ArrayList<>();
    
    public void addObject(Object obj) {
        list.add(obj);
    }
    
    public void clear() {
        list.clear();  // 명시적으로 제거
    }
}
```

### 메모리 에러

#### StackOverflowError
```java
// 무한 재귀
public void recursive() {
    recursive();  // StackOverflowError!
}
```

#### OutOfMemoryError: Java heap space
```java
// Heap 메모리 부족
List<byte[]> list = new ArrayList<>();
while (true) {
    list.add(new byte[1024 * 1024]);  // OutOfMemoryError!
}
```

#### OutOfMemoryError: Metaspace
```java
// 클래스를 동적으로 계속 생성
while (true) {
    ClassLoader loader = new CustomClassLoader();
    loader.loadClass("MyClass");  // OutOfMemoryError: Metaspace!
}
```

### 모니터링 도구

```bash
# Heap 덤프 생성
jmap -dump:format=b,file=heap.bin [PID]

# Heap 사용량 확인
jmap -heap [PID]

# GC 통계
jstat -gc [PID] 1000

# 스레드 덤프
jstack [PID]

# JVM 정보
jinfo [PID]
```

### 실무 팁

1. **적절한 Heap 크기 설정**
   - 너무 작으면: 빈번한 GC
   - 너무 크면: GC 시간 증가

2. **GC 로그 분석**
   - GC 빈도와 시간 모니터링
   - 병목 지점 파악

3. **메모리 프로파일링**
   - VisualVM, JProfiler 사용
   - 메모리 누수 탐지

### 면접 팁

**좋은 답변 구조**:
1. 전체 구조 설명
2. Heap과 Stack 중심으로 설명
3. GC 간단히 언급
4. 실무 경험 연결

**예시 답변**:
"JVM 메모리는 크게 Heap, Stack, Method Area로 구성됩니다. Heap은 모든 객체가 저장되고 GC의 대상이 되며, Stack은 각 스레드마다 독립적으로 생성되어 메서드 호출과 지역 변수를 저장합니다. Method Area는 클래스 메타데이터와 static 변수를 저장합니다. 제 프로젝트에서 OutOfMemoryError가 발생했을 때, jmap으로 Heap 덤프를 분석해 메모리 누수를 찾아 해결한 경험이 있습니다."

**추가 질문 대비**:
- "Garbage Collection은 어떻게 동작하나요?"
- "메모리 누수를 어떻게 찾나요?"
- "Stack과 Heap의 차이는?"
