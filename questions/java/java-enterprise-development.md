---
question: "⭐ Java 엔터프라이즈 개발 경험과 Spring Boot, JVM 튜닝, 그리고 Docker를 활용한 Java 애플리케이션 배포 방법을 설명해주세요."
shortAnswer: "Spring Boot로 마이크로서비스 개발, JVM 메모리 튜닝(-Xms, -Xmx), Docker 멀티스테이지 빌드로 경량화된 Java 애플리케이션 컨테이너 배포, 그리고 모니터링과 로깅을 통한 운영 경험이 있습니다."
---

# Java 엔터프라이즈 개발

## Spring Boot 기반 애플리케이션 개발

### 포트폴리오 연결: 데이터 사이언스 부트캠프 + 42 이노베이션 아카데미

**"데이터 사이언스 부트캠프에서 Spring Boot로 RESTful API를 개발했고, 42 이노베이션 아카데미에서 시스템 프로그래밍 기초를 익혀 Java 애플리케이션의 성능 최적화에 대한 이해도를 높였습니다."**

### Spring Boot 핵심 개념
#### 자동 설정과 스타터:
- **`@SpringBootApplication`**: 자동 설정, 컴포넌트 스캔, 설정 클래스 통합
- **Spring Boot Starter**: `spring-boot-starter-web`, `spring-boot-starter-data-jpa` 등
- **`application.yml`**: 환경별 설정 관리 (dev, prod, test)
- **프로파일**: `@Profile("dev")` 어노테이션으로 환경별 빈 설정

#### 의존성 주입과 IoC:
- **`@Autowired`**: 생성자, 필드, 세터 주입
- **`@Component`, `@Service`, `@Repository`**: 스테레오타입 어노테이션
- **`@Configuration`, `@Bean`**: 수동 빈 등록
- **`@Qualifier`**: 같은 타입의 여러 빈 중 선택

### RESTful API 설계
#### REST 원칙과 HTTP 메서드:
- **GET**: 리소스 조회 (`/api/users/{id}`)
- **POST**: 리소스 생성 (`/api/users`)
- **PUT**: 리소스 전체 수정 (`/api/users/{id}`)
- **PATCH**: 리소스 부분 수정
- **DELETE**: 리소스 삭제 (`/api/users/{id}`)

#### Spring Boot REST 어노테이션:
- **`@RestController`**: JSON 응답 반환
- **`@RequestMapping("/api/v1")`**: 기본 URL 매핑
- **`@GetMapping`, `@PostMapping`**: HTTP 메서드별 매핑
- **`@PathVariable`**: URL 경로 변수 바인딩
- **`@RequestBody`**: JSON 요청 본문 바인딩
- **`@Valid`**: 입력 데이터 검증

## JPA와 데이터베이스 연동

### JPA 핵심 개념
#### 엔티티와 매핑:
- **`@Entity`**: JPA 엔티티 클래스 선언
- **`@Table(name = "users")`**: 테이블 이름 매핑
- **`@Id`, `@GeneratedValue`**: 기본키 설정
- **`@Column(nullable = false)`**: 컬럼 속성 설정
- **`@OneToMany`, `@ManyToOne`**: 연관관계 매핑

#### Spring Data JPA:
- **`JpaRepository<Entity, ID>`**: 기본 CRUD 메서드 제공
- **메서드 쿼리**: `findByNameAndAge(String name, int age)`
- **`@Query`**: JPQL 또는 네이티브 SQL 사용
- **`@Modifying`**: UPDATE, DELETE 쿼리에 사용
- **페이징**: `Pageable`, `Page<T>` 인터페이스 활용

### 트랜잭션 관리
#### 선언적 트랜잭션:
- **`@Transactional`**: 메서드 레벨 트랜잭션
- **전파 속성**: `REQUIRED`, `REQUIRES_NEW`, `NESTED`
- **격리 수준**: `READ_COMMITTED`, `REPEATABLE_READ`
- **롤백 조건**: `rollbackFor = Exception.class`

## JVM 성능 튜닝

### 메모리 관리
#### JVM 메모리 영역:
- **Heap**: 객체 인스턴스 저장 영역
- **Method Area**: 클래스 메타데이터, 상수 풀
- **Stack**: 메서드 호출 스택, 지역 변수
- **PC Register**: 현재 실행 중인 명령어 주소

#### 메모리 튜닝 옵션:
- **`-Xms2g`**: 초기 힙 크기 설정 (2GB)
- **`-Xmx4g`**: 최대 힙 크기 설정 (4GB)
- **`-XX:NewRatio=3`**: Old/Young 영역 비율
- **`-XX:MaxMetaspaceSize=256m`**: 메타스페이스 최대 크기

### 가비지 컬렉션 튜닝
#### GC 알고리즘 선택:
- **G1GC**: `-XX:+UseG1GC` (대용량 힙에 적합)
- **Parallel GC**: `-XX:+UseParallelGC` (처리량 중시)
- **ZGC**: `-XX:+UseZGC` (초저지연 요구사항)

#### GC 모니터링:
- **`-XX:+PrintGC`**: GC 로그 출력
- **`-Xloggc:gc.log`**: GC 로그 파일 저장
- **`jstat -gc [pid]`**: 실시간 GC 통계
- **`jmap -histo [pid]`**: 힙 메모리 사용량 분석

## Docker를 활용한 Java 애플리케이션 배포

### Java 애플리케이션 Docker화
#### 기본 Dockerfile 구조:
- **`FROM openjdk:17-jre-slim`**: 경량화된 OpenJDK 베이스 이미지
- **`WORKDIR /app`**: 애플리케이션 작업 디렉토리
- **`COPY target/*.jar app.jar`**: JAR 파일 복사
- **`EXPOSE 8080`**: 애플리케이션 포트 노출
- **`ENTRYPOINT ["java", "-jar", "app.jar"]`**: 실행 명령어

#### 멀티스테이지 빌드:
- **빌드 스테이지**: Maven/Gradle로 애플리케이션 빌드
- **런타임 스테이지**: JRE만 포함한 경량 이미지
- **이미지 크기 최적화**: 불필요한 빌드 도구 제거
- **보안 강화**: 비root 사용자로 실행

### Docker Compose로 전체 스택 구성
#### 서비스 구성:
- **애플리케이션**: Spring Boot JAR
- **데이터베이스**: MySQL/PostgreSQL 컨테이너
- **캐시**: Redis 컨테이너
- **프록시**: Nginx 리버스 프록시

#### 환경 변수 관리:
- **`SPRING_PROFILES_ACTIVE=prod`**: 프로파일 설정
- **`SPRING_DATASOURCE_URL`**: 데이터베이스 연결 정보
- **`JAVA_OPTS=-Xms1g -Xmx2g`**: JVM 옵션 전달

### 컨테이너 모니터링과 로깅
#### 애플리케이션 모니터링:
- **Spring Boot Actuator**: `/actuator/health`, `/actuator/metrics`
- **Micrometer**: Prometheus 메트릭 수집
- **`docker stats`**: 컨테이너 리소스 사용량
- **`docker logs -f [container]`**: 실시간 로그 확인

#### 로깅 전략:
- **Logback 설정**: JSON 형태 로그 출력
- **로그 레벨**: ERROR, WARN, INFO, DEBUG
- **로그 로테이션**: 파일 크기 및 보관 기간 설정
- **중앙 로깅**: ELK Stack 또는 Fluentd 연동

## 마이크로서비스 아키텍처

### 서비스 간 통신
#### HTTP 통신:
- **RestTemplate**: 동기식 HTTP 클라이언트
- **WebClient**: 비동기 리액티브 HTTP 클라이언트
- **Feign Client**: 선언적 HTTP 클라이언트
- **Circuit Breaker**: Hystrix, Resilience4j로 장애 격리

#### 메시지 큐:
- **RabbitMQ**: AMQP 프로토콜 기반 메시징
- **Apache Kafka**: 대용량 스트리밍 데이터 처리
- **Spring Cloud Stream**: 메시징 추상화 레이어

### 설정 관리와 서비스 디스커버리
#### 중앙 설정 관리:
- **Spring Cloud Config**: Git 기반 설정 저장소
- **환경별 설정**: dev, staging, production 프로파일
- **암호화**: 민감한 정보 암호화 저장

#### 서비스 디스커버리:
- **Eureka**: Netflix OSS 서비스 레지스트리
- **Consul**: HashiCorp 서비스 메시 솔루션
- **Kubernetes Service**: 컨테이너 오케스트레이션 환경

## 테스트 전략

### 단위 테스트
#### JUnit 5 기반 테스트:
- **`@Test`**: 테스트 메서드 선언
- **`@BeforeEach`, `@AfterEach`**: 테스트 전후 설정
- **`@ParameterizedTest`**: 매개변수화된 테스트
- **Assertions**: `assertEquals`, `assertThrows` 등

#### Mockito를 활용한 모킹:
- **`@Mock`**: 모의 객체 생성
- **`@InjectMocks`**: 모의 객체 주입
- **`when().thenReturn()`**: 모의 객체 동작 정의
- **`verify()`**: 메서드 호출 검증

### 통합 테스트
#### Spring Boot 테스트:
- **`@SpringBootTest`**: 전체 애플리케이션 컨텍스트 로드
- **`@WebMvcTest`**: 웹 레이어만 테스트
- **`@DataJpaTest`**: JPA 레이어만 테스트
- **TestContainers**: 실제 데이터베이스 컨테이너로 테스트

## 면접에서 어필할 포인트

### 1. 실무 경험 강조
**"Spring Boot로 RESTful API를 개발하고, Docker로 컨테이너화하여 배포한 경험이 있습니다."**

### 2. 성능 최적화 역량
**"JVM 메모리 튜닝과 GC 최적화를 통해 애플리케이션 성능을 개선할 수 있습니다."**

### 3. 운영 환경 이해
**"Docker Compose로 전체 스택을 구성하고, 모니터링과 로깅을 통한 운영 경험이 있습니다."**

### 4. 테스트 주도 개발
**"JUnit과 Mockito를 활용한 단위 테스트와 Spring Boot Test를 통한 통합 테스트 경험이 있습니다."**

### 5. 마이크로서비스 이해
**"서비스 간 통신, 설정 관리, 서비스 디스커버리 등 마이크로서비스 아키텍처의 핵심 개념을 이해하고 있습니다."**

이러한 경험들이 **포인트아이의 통신사 및 공공기관 솔루션 개발**에 직접 활용될 수 있음을 강조하세요! 🚀
