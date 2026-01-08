---
question: "⭐ Spring MVC 아키텍처를 기반으로 한 웹 애플리케이션 설계 경험과 비즈니스 로직 분리, 그리고 RESTful API 구현 방법을 설명해주세요."
shortAnswer: "Spring MVC는 Model-View-Controller 패턴으로 관심사를 분리하며, @Controller로 요청 처리, @Service로 비즈니스 로직, @Repository로 데이터 접근을 담당합니다. @RestController와 @RequestMapping을 통해 RESTful API를 구현하고, DTO 패턴으로 데이터 전송을 최적화합니다."
---

# Spring MVC 아키텍처 설계

## Spring MVC 기본 구조

### MVC 패턴의 구성 요소
#### Spring MVC 아키텍처 흐름:
- **Client Request** → **DispatcherServlet** (Front Controller)
- **HandlerMapping** → **Controller** (요청 처리)
- **Service Layer** (Business Logic) → **Repository Layer** (Data Access)
- **Database** → **View Resolver** → **View** (JSP/Thymeleaf)
- **Response to Client** (응답 반환)

#### 핵심 구성 요소:
- **DispatcherServlet**: 모든 HTTP 요청의 진입점 (Front Controller 패턴)
- **HandlerMapping**: URL과 Controller 메서드 매핑
- **ViewResolver**: 논리적 뷰 이름을 실제 뷰로 변환

### 계층별 역할과 책임
#### Controller Layer (요청 처리):
- **@RestController**: JSON/XML 데이터 반환 (@ResponseBody 포함)
- **@RequestMapping**: URL 매핑 및 HTTP 메서드 지정
- **@GetMapping, @PostMapping**: HTTP 메서드별 매핑
- **@RequestParam**: 쿼리 파라미터 바인딩
- **@PathVariable**: URL 경로 변수 바인딩
- **ResponseEntity**: HTTP 상태 코드와 함께 응답 반환
            
#### Service Layer (비즈니스 로직):
- **@Service**: 비즈니스 로직 처리 계층
- **@Transactional**: 트랜잭션 경계 설정
- **@Autowired**: 의존성 주입
- **비즈니스 규칙 검증**: 데이터 유효성 검사 및 비즈니스 로직 처리

#### Repository Layer (데이터 접근):
- **@Repository**: 데이터 접근 계층
- **JpaRepository**: 기본 CRUD 작업 제공
- **@Query**: 커스텀 쿼리 작성
- **@Modifying**: 데이터 수정 쿼리에 사용

```

## DTO 패턴 및 데이터 전송 최적화

### DTO 클래스 설계
```java
// 응답용 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 계산된 필드
    public String getFormattedPrice() {
        return NumberFormat.getCurrencyInstance(Locale.KOREA).format(price);
    }
    
    public boolean isLowStock() {
        return stockQuantity < 10;
    }
}

// 요청용 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    
    @NotBlank(message = "상품명은 필수입니다")
    @Size(max = 100, message = "상품명은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "가격은 필수입니다")
    @DecimalMin(value = "0.01", message = "가격은 0보다 커야 합니다")
    @Digits(integer = 10, fraction = 2, message = "가격 형식이 올바르지 않습니다")
    private BigDecimal price;
    
    @Min(value = 0, message = "재고 수량은 0 이상이어야 합니다")
    private int stockQuantity;
    
    @NotNull(message = "카테고리는 필수입니다")
    private Long categoryId;
}

// 업데이트용 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    
    @Size(max = 100, message = "상품명은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다")
    private String description;
    
    @DecimalMin(value = "0.01", message = "가격은 0보다 커야 합니다")
    private BigDecimal price;
    
    @Min(value = 0, message = "재고 수량은 0 이상이어야 합니다")
    private Integer stockQuantity;
    
    private Long categoryId;
}

// MapStruct를 이용한 매핑
@Mapper(componentModel = "spring")
public interface ProductMapper {
    
    @Mapping(source = "category.name", target = "categoryName")
    ProductDTO toDTO(Product product);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(CreateProductRequest request);
    
    List<ProductDTO> toDTOList(List<Product> products);
}
```

## 예외 처리 및 에러 핸들링

### 글로벌 예외 처리
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException e) {
        logger.warn("Validation error: {}", e.getMessage());
        
        ErrorResponse error = ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message(e.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new HashMap<>();
        
        e.getBindingResult().getFieldErrors().forEach(error -> 
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorResponse error = ErrorResponse.builder()
            .code("FIELD_VALIDATION_ERROR")
            .message("입력값 검증 실패")
            .fieldErrors(fieldErrors)
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProductNotFound(ProductNotFoundException e) {
        ErrorResponse error = ErrorResponse.builder()
            .code("PRODUCT_NOT_FOUND")
            .message(e.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        logger.error("Unexpected error occurred", e);
        
        ErrorResponse error = ErrorResponse.builder()
            .code("INTERNAL_SERVER_ERROR")
            .message("서버 내부 오류가 발생했습니다")
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private Map<String, String> fieldErrors;
    private LocalDateTime timestamp;
}
```

## 설정 및 구성

### Spring Boot 설정
```java
@Configuration
@EnableWebMvc
@EnableJpaRepositories(basePackages = "com.example.repository")
@EntityScan(basePackages = "com.example.entity")
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://myapp.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoggingInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/health");
        
        registry.addInterceptor(new AuthenticationInterceptor())
                .addPathPatterns("/api/admin/**");
    }
    
    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder()
                .dateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"))
                .timeZone(TimeZone.getTimeZone("Asia/Seoul"))
                .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    }
}

// 데이터베이스 설정
@Configuration
@EnableTransactionManagement
public class DatabaseConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
    
    @Bean
    public JpaTransactionManager jpaTransactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        return transactionManager;
    }
}
```

## 테스트 코드 작성

### 단위 테스트
```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @Mock
    private CategoryRepository categoryRepository;
    
    @Mock
    private ProductMapper productMapper;
    
    @InjectMocks
    private ProductService productService;
    
    @Test
    @DisplayName("상품 생성 성공 테스트")
    void createProduct_Success() {
        // Given
        CreateProductRequest request = CreateProductRequest.builder()
            .name("테스트 상품")
            .description("테스트 설명")
            .price(new BigDecimal("10000"))
            .stockQuantity(100)
            .categoryId(1L)
            .build();
        
        Category category = Category.builder()
            .id(1L)
            .name("전자제품")
            .build();
        
        Product savedProduct = Product.builder()
            .id(1L)
            .name("테스트 상품")
            .description("테스트 설명")
            .price(new BigDecimal("10000"))
            .stockQuantity(100)
            .category(category)
            .build();
        
        ProductDTO expectedDTO = ProductDTO.builder()
            .id(1L)
            .name("테스트 상품")
            .description("테스트 설명")
            .price(new BigDecimal("10000"))
            .stockQuantity(100)
            .categoryName("전자제품")
            .build();
        
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsByName("테스트 상품")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
        when(productMapper.toDTO(savedProduct)).thenReturn(expectedDTO);
        
        // When
        ProductDTO result = productService.createProduct(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("테스트 상품");
        assertThat(result.getPrice()).isEqualTo(new BigDecimal("10000"));
        
        verify(productRepository).save(any(Product.class));
        verify(categoryRepository).findById(1L);
    }
    
    @Test
    @DisplayName("중복 상품명으로 생성 실패 테스트")
    void createProduct_DuplicateName_ThrowsException() {
        // Given
        CreateProductRequest request = CreateProductRequest.builder()
            .name("중복 상품")
            .categoryId(1L)
            .build();
        
        Category category = new Category();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsByName("중복 상품")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> productService.createProduct(request))
            .isInstanceOf(DuplicateProductException.class)
            .hasMessage("Product name already exists");
    }
}

// 통합 테스트
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(locations = "classpath:application-test.properties")
class ProductControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Test
    @DisplayName("상품 목록 조회 API 테스트")
    void getProducts_ReturnsProductList() {
        // Given
        Product product1 = createTestProduct("상품1", new BigDecimal("10000"));
        Product product2 = createTestProduct("상품2", new BigDecimal("20000"));
        productRepository.saveAll(Arrays.asList(product1, product2));
        
        // When
        ResponseEntity<ProductDTO[]> response = restTemplate.getForEntity(
            "/api/products", ProductDTO[].class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }
    
    private Product createTestProduct(String name, BigDecimal price) {
        return Product.builder()
            .name(name)
            .price(price)
            .stockQuantity(100)
            .build();
    }
}
```

## 실무 면접 예상 질문

### Spring MVC 아키텍처 질문
1. **"Spring MVC에서 DispatcherServlet의 역할은 무엇인가요?"**
   - Front Controller 패턴 구현
   - 모든 HTTP 요청의 진입점
   - HandlerMapping, HandlerAdapter 조정

2. **"@Controller와 @RestController의 차이점은?"**
   - @Controller: View 반환 (JSP, Thymeleaf)
   - @RestController: JSON/XML 데이터 반환 (@ResponseBody 포함)

### 비즈니스 로직 설계 질문
1. **"Service 계층에서 트랜잭션을 어떻게 관리하나요?"**
   - @Transactional 어노테이션 사용
   - 선언적 트랜잭션 관리
   - 롤백 조건 설정

2. **"DTO 패턴을 사용하는 이유는?"**
   - 계층 간 데이터 전송 최적화
   - 엔티티 노출 방지
   - API 버전 관리 용이

### RESTful API 설계 질문
1. **"RESTful API 설계 원칙을 설명해주세요"**
   - 자원 중심 URL 설계
   - HTTP 메서드 적절한 사용
   - 상태 코드 의미있는 반환

2. **"API 버전 관리는 어떻게 하나요?"**
   - URL 경로 버전 관리 (/api/v1/)
   - 헤더 기반 버전 관리
   - 미디어 타입 버전 관리

### 데이터 사이언스 부트캠프 경험 어필 포인트
- **풀스택 개발**: 백엔드 API부터 프론트엔드 연동까지
- **데이터 처리**: 수집된 데이터를 웹 서비스로 구현
- **아키텍처 설계**: 확장 가능한 MVC 구조 설계
- **API 설계**: RESTful 원칙을 따른 API 구현
- **테스트 코드**: 단위 테스트 및 통합 테스트 작성

### 실무 시나리오 질문
1. **"대용량 데이터를 처리하는 API를 어떻게 최적화하시겠습니까?"**
2. **"마이크로서비스 아키텍처로 전환한다면 어떤 점을 고려하시겠습니까?"**
3. **"API 성능 모니터링은 어떻게 구현하시겠습니까?"**
