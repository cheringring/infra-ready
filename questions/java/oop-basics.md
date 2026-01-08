---
question: "객체지향 프로그래밍(OOP)의 4가지 특징을 설명해주세요."
shortAnswer: "OOP의 4가지 특징은 캡슐화(데이터 은닉), 상속(코드 재사용), 다형성(같은 인터페이스 다른 구현), 추상화(핵심만 표현)입니다."
---

## 상세 답변

### 객체지향 프로그래밍 (OOP)의 4가지 특징

### 1. 캡슐화 (Encapsulation)

**정의**
- 데이터와 메서드를 하나로 묶고, 외부에서 직접 접근을 제한
- 정보 은닉 (Information Hiding)

**목적**
- 데이터 보호
- 내부 구현 숨김
- 유지보수 용이

**예시**
```java
// 나쁜 예: 캡슐화 안 됨
public class BadAccount {
    public int balance;  // 직접 접근 가능
}

// 사용
BadAccount account = new BadAccount();
account.balance = -1000;  // 음수 잔액 가능! 문제!

// 좋은 예: 캡슐화
public class GoodAccount {
    private int balance;  // 외부 접근 불가
    
    public int getBalance() {
        return balance;
    }
    
    public void deposit(int amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    public void withdraw(int amount) {
        if (amount > 0 && balance >= amount) {
            balance -= amount;
        } else {
            throw new IllegalArgumentException("잔액 부족");
        }
    }
}

// 사용
GoodAccount account = new GoodAccount();
account.deposit(1000);
account.withdraw(500);
// account.balance = -1000;  // 컴파일 에러!
```

**접근 제어자**
```java
public class AccessModifiers {
    public int publicVar;        // 어디서나 접근 가능
    protected int protectedVar;  // 같은 패키지 + 상속받은 클래스
    int defaultVar;              // 같은 패키지 (default)
    private int privateVar;      // 같은 클래스 내부만
}
```

### 2. 상속 (Inheritance)

**정의**
- 기존 클래스의 속성과 메서드를 물려받아 재사용
- 코드 중복 제거

**목적**
- 코드 재사용
- 계층 구조 표현
- 확장성

**예시**
```java
// 부모 클래스
public class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + "이(가) 먹습니다.");
    }
    
    public void sleep() {
        System.out.println(name + "이(가) 잡니다.");
    }
}

// 자식 클래스
public class Dog extends Animal {
    public Dog(String name) {
        super(name);  // 부모 생성자 호출
    }
    
    // 메서드 오버라이딩
    @Override
    public void eat() {
        System.out.println(name + "이(가) 사료를 먹습니다.");
    }
    
    // 새로운 메서드 추가
    public void bark() {
        System.out.println(name + "이(가) 짖습니다: 멍멍!");
    }
}

public class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }
    
    @Override
    public void eat() {
        System.out.println(name + "이(가) 생선을 먹습니다.");
    }
    
    public void meow() {
        System.out.println(name + "이(가) 웁니다: 야옹!");
    }
}

// 사용
Dog dog = new Dog("바둑이");
dog.eat();    // "바둑이이(가) 사료를 먹습니다."
dog.sleep();  // 부모 메서드 사용
dog.bark();   // "바둑이이(가) 짖습니다: 멍멍!"

Cat cat = new Cat("나비");
cat.eat();    // "나비이(가) 생선을 먹습니다."
cat.meow();   // "나비이(가) 웁니다: 야옹!"
```

**상속의 문제점과 해결**
```java
// 문제: 다중 상속 불가
// public class Bat extends Animal, Bird { }  // 컴파일 에러!

// 해결: 인터페이스 사용
public interface Flyable {
    void fly();
}

public class Bird extends Animal implements Flyable {
    public Bird(String name) {
        super(name);
    }
    
    @Override
    public void fly() {
        System.out.println(name + "이(가) 날아갑니다.");
    }
}
```

### 3. 다형성 (Polymorphism)

**정의**
- 같은 인터페이스나 부모 타입으로 여러 구현체를 다룰 수 있음
- "하나의 타입, 여러 형태"

**목적**
- 유연한 코드
- 확장성
- 결합도 감소

**종류**

#### 오버로딩 (Overloading) - 컴파일 타임 다형성
```java
public class Calculator {
    // 같은 이름, 다른 매개변수
    public int add(int a, int b) {
        return a + b;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

// 사용
Calculator calc = new Calculator();
calc.add(1, 2);        // int 버전 호출
calc.add(1.5, 2.5);    // double 버전 호출
calc.add(1, 2, 3);     // 3개 매개변수 버전 호출
```

#### 오버라이딩 (Overriding) - 런타임 다형성
```java
public class Shape {
    public void draw() {
        System.out.println("도형을 그립니다.");
    }
}

public class Circle extends Shape {
    @Override
    public void draw() {
        System.out.println("원을 그립니다.");
    }
}

public class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.println("사각형을 그립니다.");
    }
}

// 다형성 활용
public class DrawingApp {
    public static void main(String[] args) {
        // 부모 타입으로 선언
        Shape shape1 = new Circle();
        Shape shape2 = new Rectangle();
        
        // 실제 객체의 메서드 호출 (런타임에 결정)
        shape1.draw();  // "원을 그립니다."
        shape2.draw();  // "사각형을 그립니다."
        
        // 배열로 관리
        Shape[] shapes = {
            new Circle(),
            new Rectangle(),
            new Circle()
        };
        
        for (Shape shape : shapes) {
            shape.draw();  // 각 객체의 draw() 호출
        }
    }
}
```

**인터페이스를 통한 다형성**
```java
public interface Payment {
    void pay(int amount);
}

public class CreditCard implements Payment {
    @Override
    public void pay(int amount) {
        System.out.println("신용카드로 " + amount + "원 결제");
    }
}

public class KakaoPay implements Payment {
    @Override
    public void pay(int amount) {
        System.out.println("카카오페이로 " + amount + "원 결제");
    }
}

public class NaverPay implements Payment {
    @Override
    public void pay(int amount) {
        System.out.println("네이버페이로 " + amount + "원 결제");
    }
}

// 결제 처리
public class PaymentProcessor {
    public void processPayment(Payment payment, int amount) {
        payment.pay(amount);  // 어떤 결제 수단이든 동일하게 처리
    }
}

// 사용
PaymentProcessor processor = new PaymentProcessor();
processor.processPayment(new CreditCard(), 10000);
processor.processPayment(new KakaoPay(), 20000);
processor.processPayment(new NaverPay(), 30000);
```

### 4. 추상화 (Abstraction)

**정의**
- 복잡한 내부 구현을 숨기고 핵심 기능만 노출
- 공통된 특징을 추출

**목적**
- 복잡도 감소
- 인터페이스와 구현 분리
- 유지보수 용이

**추상 클래스**
```java
public abstract class Vehicle {
    protected String name;
    
    public Vehicle(String name) {
        this.name = name;
    }
    
    // 추상 메서드 (구현 없음)
    public abstract void start();
    public abstract void stop();
    
    // 일반 메서드 (구현 있음)
    public void displayInfo() {
        System.out.println("차량명: " + name);
    }
}

public class Car extends Vehicle {
    public Car(String name) {
        super(name);
    }
    
    @Override
    public void start() {
        System.out.println(name + " 시동을 겁니다: 부릉!");
    }
    
    @Override
    public void stop() {
        System.out.println(name + " 정지합니다.");
    }
}

public class Motorcycle extends Vehicle {
    public Motorcycle(String name) {
        super(name);
    }
    
    @Override
    public void start() {
        System.out.println(name + " 시동을 겁니다: 따릉!");
    }
    
    @Override
    public void stop() {
        System.out.println(name + " 정지합니다.");
    }
}
```

**인터페이스**
```java
public interface Drawable {
    void draw();  // 추상 메서드 (public abstract 생략)
}

public interface Resizable {
    void resize(int width, int height);
}

// 여러 인터페이스 구현 가능
public class Image implements Drawable, Resizable {
    @Override
    public void draw() {
        System.out.println("이미지를 그립니다.");
    }
    
    @Override
    public void resize(int width, int height) {
        System.out.println("이미지 크기 변경: " + width + "x" + height);
    }
}
```

**추상 클래스 vs 인터페이스**

| 특성 | 추상 클래스 | 인터페이스 |
|------|------------|-----------|
| 다중 상속 | 불가 | 가능 |
| 생성자 | 가능 | 불가 |
| 필드 | 가능 | 상수만 (public static final) |
| 메서드 | 추상/일반 모두 가능 | 추상 메서드 (Java 8+ default 가능) |
| 접근 제어자 | 모두 가능 | public만 |
| 사용 목적 | IS-A 관계 | CAN-DO 관계 |

### 실무 예시

#### 1. 캡슐화 - DTO (Data Transfer Object)
```java
public class UserDTO {
    private Long id;
    private String email;
    private String password;
    
    // Getter/Setter로 접근 제어
    public String getEmail() {
        return email;
    }
    
    public void setPassword(String password) {
        // 비밀번호 암호화
        this.password = encrypt(password);
    }
    
    private String encrypt(String password) {
        // 암호화 로직
        return "encrypted_" + password;
    }
}
```

#### 2. 상속 - Exception 계층
```java
public class CustomException extends RuntimeException {
    public CustomException(String message) {
        super(message);
    }
}

public class UserNotFoundException extends CustomException {
    public UserNotFoundException(Long userId) {
        super("사용자를 찾을 수 없습니다: " + userId);
    }
}
```

#### 3. 다형성 - Strategy Pattern
```java
public interface SortStrategy {
    void sort(int[] array);
}

public class BubbleSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        // 버블 정렬 구현
    }
}

public class QuickSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        // 퀵 정렬 구현
    }
}

public class Sorter {
    private SortStrategy strategy;
    
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }
    
    public void sort(int[] array) {
        strategy.sort(array);  // 다형성 활용
    }
}
```

#### 4. 추상화 - Repository Pattern
```java
public interface UserRepository {
    User findById(Long id);
    List<User> findAll();
    void save(User user);
    void delete(Long id);
}

public class JpaUserRepository implements UserRepository {
    @Override
    public User findById(Long id) {
        // JPA 구현
    }
    // ...
}

public class MongoUserRepository implements UserRepository {
    @Override
    public User findById(Long id) {
        // MongoDB 구현
    }
    // ...
}

// 서비스는 인터페이스만 의존
public class UserService {
    private UserRepository repository;
    
    public UserService(UserRepository repository) {
        this.repository = repository;
    }
    
    public User getUser(Long id) {
        return repository.findById(id);  // 구현체 상관없이 동작
    }
}
```

### SOLID 원칙과의 관계

```
S - Single Responsibility (단일 책임)
→ 캡슐화: 하나의 클래스는 하나의 책임

O - Open/Closed (개방/폐쇄)
→ 다형성: 확장에는 열려있고 수정에는 닫혀있음

L - Liskov Substitution (리스코프 치환)
→ 상속: 자식 클래스는 부모 클래스를 대체 가능

I - Interface Segregation (인터페이스 분리)
→ 추상화: 필요한 인터페이스만 구현

D - Dependency Inversion (의존성 역전)
→ 추상화: 구체적인 것이 아닌 추상에 의존
```

### 면접 팁

**좋은 답변 구조**:
1. 4가지 특징 간단히 나열
2. 각각 예시와 함께 설명
3. 실무 경험 연결

**예시 답변**:
"OOP의 4가지 특징은 캡슐화, 상속, 다형성, 추상화입니다. 캡슐화는 데이터를 private으로 숨기고 getter/setter로 접근을 제어하는 것이고, 상속은 부모 클래스의 기능을 재사용하는 것입니다. 다형성은 인터페이스나 부모 타입으로 여러 구현체를 다룰 수 있는 것이며, 추상화는 복잡한 구현을 숨기고 핵심만 노출하는 것입니다. 제 프로젝트에서는 결제 시스템을 Payment 인터페이스로 추상화하고, 카카오페이, 네이버페이 등을 구현체로 만들어 다형성을 활용했습니다."

**추가 질문 대비**:
- "SOLID 원칙을 설명해주세요."
- "인터페이스와 추상 클래스의 차이는?"
- "오버로딩과 오버라이딩의 차이는?"
