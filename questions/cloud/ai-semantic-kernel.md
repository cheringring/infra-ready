---
question: "Semantic Kernel을 활용한 AI 오케스트레이션과 MCP(Model Context Protocol) 기반 LLM 통합 방법, 그리고 RAG 시스템 구축에 대해 설명해주세요."
shortAnswer: "Semantic Kernel은 다양한 LLM을 통합하는 AI 오케스트레이션 프레임워크로, 플러그인과 플래너를 통해 복잡한 AI 워크플로우를 구현합니다. MCP는 LLM에 외부 컨텍스트를 제공하는 표준이며, RAG는 벡터 데이터베이스와 임베딩을 활용해 외부 지식을 기반으로 답변을 생성합니다."
---

# AI 오케스트레이션 및 Semantic Kernel

## Semantic Kernel 기본 개념

### AI 오케스트레이션이란?
```
전통적 프로그래밍:
Input → Function → Output

AI 오케스트레이션:
Input → AI Agent → Tool Selection → Execution → Output
       ↓
   Context Memory ← → External APIs
```

### Semantic Kernel 아키텍처
```java
// Semantic Kernel 기본 구조
@Component
public class AIOrchestrator {
    
    private final Kernel kernel;
    private final OpenAIAsyncClient openAIClient;
    
    public AIOrchestrator() {
        // OpenAI 클라이언트 초기화
        this.openAIClient = new OpenAIClientBuilder()
            .credential(new AzureKeyCredential(apiKey))
            .buildAsyncClient();
        
        // Kernel 생성
        this.kernel = Kernel.builder()
            .withAIService(ChatCompletionService.class, 
                OpenAIChatCompletion.builder()
                    .withOpenAIAsyncClient(openAIClient)
                    .withModelId("gpt-4")
                    .build())
            .build();
    }
    
    @DefineKernelFunction(
        name = "getCurrentWeather",
        description = "현재 날씨 정보를 가져옵니다"
    )
    public String getCurrentWeather(
        @KernelFunctionParameter(name = "location", description = "위치") String location
    ) {
        // 외부 날씨 API 호출
        return weatherService.getWeather(location);
    }
    
    @DefineKernelFunction(
        name = "sendEmail",
        description = "이메일을 발송합니다"
    )
    public String sendEmail(
        @KernelFunctionParameter(name = "to", description = "수신자") String to,
        @KernelFunctionParameter(name = "subject", description = "제목") String subject,
        @KernelFunctionParameter(name = "body", description = "내용") String body
    ) {
        return emailService.sendEmail(to, subject, body);
    }
}
```

### 플러그인 시스템
```java
// 커스텀 플러그인 개발
@Component
public class DatabasePlugin {
    
    @Autowired
    private UserRepository userRepository;
    
    @DefineKernelFunction(
        name = "getUserInfo",
        description = "사용자 정보를 조회합니다"
    )
    public String getUserInfo(
        @KernelFunctionParameter(name = "userId", description = "사용자 ID") String userId
    ) {
        User user = userRepository.findById(Long.parseLong(userId))
            .orElse(null);
        
        if (user != null) {
            return String.format("사용자: %s, 이메일: %s, 가입일: %s", 
                user.getName(), user.getEmail(), user.getCreatedAt());
        }
        
        return "사용자를 찾을 수 없습니다.";
    }
    
    @DefineKernelFunction(
        name = "createUser",
        description = "새 사용자를 생성합니다"
    )
    public String createUser(
        @KernelFunctionParameter(name = "name", description = "이름") String name,
        @KernelFunctionParameter(name = "email", description = "이메일") String email
    ) {
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(newUser);
        return "사용자가 생성되었습니다. ID: " + savedUser.getId();
    }
}
```

## MCP (Model Context Protocol)

### MCP 서버 구현
```java
// MCP 서버 구현
@RestController
@RequestMapping("/mcp")
public class MCPServer {
    
    @Autowired
    private DocumentService documentService;
    
    @PostMapping("/tools/search")
    public MCPResponse searchDocuments(@RequestBody MCPRequest request) {
        String query = request.getArguments().get("query");
        List<Document> results = documentService.searchDocuments(query);
        
        return MCPResponse.builder()
            .content(formatSearchResults(results))
            .isError(false)
            .build();
    }
    
    @PostMapping("/tools/analyze")
    public MCPResponse analyzeDocument(@RequestBody MCPRequest request) {
        String documentId = request.getArguments().get("documentId");
        Document document = documentService.getDocument(documentId);
        
        if (document != null) {
            String analysis = aiService.analyzeDocument(document.getContent());
            return MCPResponse.builder()
                .content(analysis)
                .isError(false)
                .build();
        }
        
        return MCPResponse.builder()
            .content("문서를 찾을 수 없습니다.")
            .isError(true)
            .build();
    }
    
    private String formatSearchResults(List<Document> documents) {
        StringBuilder sb = new StringBuilder();
        sb.append("검색 결과:\n");
        
        for (Document doc : documents) {
            sb.append(String.format("- %s (ID: %s)\n  요약: %s\n", 
                doc.getTitle(), doc.getId(), doc.getSummary()));
        }
        
        return sb.toString();
    }
}
```

### MCP 클라이언트 통합
```java
// MCP 클라이언트를 Semantic Kernel에 통합
@Component
public class MCPIntegration {
    
    private final RestTemplate restTemplate;
    private final String mcpServerUrl;
    
    public MCPIntegration() {
        this.restTemplate = new RestTemplate();
        this.mcpServerUrl = "http://localhost:8080/mcp";
    }
    
    @DefineKernelFunction(
        name = "searchKnowledgeBase",
        description = "지식 베이스에서 정보를 검색합니다"
    )
    public String searchKnowledgeBase(
        @KernelFunctionParameter(name = "query", description = "검색어") String query
    ) {
        MCPRequest request = MCPRequest.builder()
            .tool("search")
            .arguments(Map.of("query", query))
            .build();
        
        try {
            ResponseEntity<MCPResponse> response = restTemplate.postForEntity(
                mcpServerUrl + "/tools/search", request, MCPResponse.class);
            
            if (response.getBody() != null && !response.getBody().isError()) {
                return response.getBody().getContent();
            }
        } catch (Exception e) {
            return "검색 중 오류가 발생했습니다: " + e.getMessage();
        }
        
        return "검색 결과가 없습니다.";
    }
}
```

## RAG (Retrieval-Augmented Generation) 시스템

### 벡터 데이터베이스 구성
```java
// 벡터 임베딩 서비스
@Service
public class EmbeddingService {
    
    private final OpenAIAsyncClient openAIClient;
    
    public EmbeddingService() {
        this.openAIClient = new OpenAIClientBuilder()
            .credential(new AzureKeyCredential(apiKey))
            .buildAsyncClient();
    }
    
    public List<Float> generateEmbedding(String text) {
        EmbeddingsOptions options = new EmbeddingsOptions(
            Arrays.asList(text));
        
        try {
            Embeddings embeddings = openAIClient.getEmbeddings(
                "text-embedding-ada-002", options).block();
            
            if (embeddings != null && !embeddings.getData().isEmpty()) {
                return embeddings.getData().get(0).getEmbedding();
            }
        } catch (Exception e) {
            log.error("임베딩 생성 실패: ", e);
        }
        
        return new ArrayList<>();
    }
    
    public double calculateSimilarity(List<Float> embedding1, List<Float> embedding2) {
        if (embedding1.size() != embedding2.size()) {
            return 0.0;
        }
        
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (int i = 0; i < embedding1.size(); i++) {
            dotProduct += embedding1.get(i) * embedding2.get(i);
            norm1 += Math.pow(embedding1.get(i), 2);
            norm2 += Math.pow(embedding2.get(i), 2);
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
```

### 문서 인덱싱 및 검색
```java
// RAG 시스템 구현
@Service
public class RAGService {
    
    @Autowired
    private EmbeddingService embeddingService;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    public void indexDocument(String content, String title, String source) {
        // 문서를 청크로 분할
        List<String> chunks = splitIntoChunks(content, 500);
        
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            List<Float> embedding = embeddingService.generateEmbedding(chunk);
            
            DocumentChunk documentChunk = DocumentChunk.builder()
                .title(title)
                .source(source)
                .content(chunk)
                .chunkIndex(i)
                .embedding(embedding)
                .createdAt(LocalDateTime.now())
                .build();
            
            documentRepository.save(documentChunk);
        }
    }
    
    public List<DocumentChunk> searchSimilarChunks(String query, int topK) {
        List<Float> queryEmbedding = embeddingService.generateEmbedding(query);
        List<DocumentChunk> allChunks = documentRepository.findAll();
        
        // 유사도 계산 및 정렬
        List<SimilarityResult> results = allChunks.stream()
            .map(chunk -> {
                double similarity = embeddingService.calculateSimilarity(
                    queryEmbedding, chunk.getEmbedding());
                return new SimilarityResult(chunk, similarity);
            })
            .sorted((a, b) -> Double.compare(b.getSimilarity(), a.getSimilarity()))
            .limit(topK)
            .collect(Collectors.toList());
        
        return results.stream()
            .map(SimilarityResult::getChunk)
            .collect(Collectors.toList());
    }
    
    private List<String> splitIntoChunks(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        String[] sentences = text.split("\\. ");
        
        StringBuilder currentChunk = new StringBuilder();
        
        for (String sentence : sentences) {
            if (currentChunk.length() + sentence.length() > chunkSize) {
                if (currentChunk.length() > 0) {
                    chunks.add(currentChunk.toString().trim());
                    currentChunk = new StringBuilder();
                }
            }
            currentChunk.append(sentence).append(". ");
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }
        
        return chunks;
    }
}
```

### RAG 기반 질의응답
```java
// RAG 기반 QA 시스템
@Service
public class RAGQAService {
    
    @Autowired
    private RAGService ragService;
    
    @Autowired
    private Kernel kernel;
    
    public String answerQuestion(String question) {
        // 1. 관련 문서 검색
        List<DocumentChunk> relevantChunks = ragService.searchSimilarChunks(question, 5);
        
        // 2. 컨텍스트 구성
        String context = relevantChunks.stream()
            .map(chunk -> String.format("출처: %s\n내용: %s", 
                chunk.getSource(), chunk.getContent()))
            .collect(Collectors.joining("\n\n"));
        
        // 3. 프롬프트 생성
        String prompt = String.format("""
            다음 컨텍스트를 바탕으로 질문에 답변해주세요.
            
            컨텍스트:
            %s
            
            질문: %s
            
            답변 시 다음 사항을 지켜주세요:
            1. 제공된 컨텍스트만을 기반으로 답변하세요
            2. 컨텍스트에 없는 정보는 "제공된 정보에서 확인할 수 없습니다"라고 명시하세요
            3. 출처를 명확히 표시하세요
            """, context, question);
        
        // 4. AI 모델로 답변 생성
        try {
            KernelFunctionArguments arguments = KernelFunctionArguments.builder()
                .withVariable("input", prompt)
                .build();
            
            FunctionResult<String> result = kernel.invokeAsync("chat")
                .withArguments(arguments)
                .block();
            
            return result.getResult();
        } catch (Exception e) {
            return "답변 생성 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}
```

## AI 보안 및 프롬프트 실드

### 프롬프트 인젝션 방어
```java
// 프롬프트 보안 필터
@Component
public class PromptSecurityFilter {
    
    private final List<String> dangerousPatterns = Arrays.asList(
        "ignore previous instructions",
        "forget everything above",
        "system prompt",
        "jailbreak",
        "DAN mode"
    );
    
    public boolean isPromptSafe(String userInput) {
        String lowerInput = userInput.toLowerCase();
        
        // 위험한 패턴 검사
        for (String pattern : dangerousPatterns) {
            if (lowerInput.contains(pattern)) {
                return false;
            }
        }
        
        // 과도한 반복 문자 검사
        if (hasExcessiveRepetition(userInput)) {
            return false;
        }
        
        // 길이 제한 검사
        if (userInput.length() > 10000) {
            return false;
        }
        
        return true;
    }
    
    private boolean hasExcessiveRepetition(String input) {
        // 같은 문자가 50번 이상 반복되는지 확인
        Pattern pattern = Pattern.compile("(.)\\1{49,}");
        return pattern.matcher(input).find();
    }
    
    public String sanitizeInput(String userInput) {
        if (!isPromptSafe(userInput)) {
            throw new SecurityException("안전하지 않은 입력이 감지되었습니다.");
        }
        
        // HTML 태그 제거
        String sanitized = userInput.replaceAll("<[^>]*>", "");
        
        // 특수 문자 이스케이프
        sanitized = sanitized.replace("\\", "\\\\")
                           .replace("\"", "\\\"")
                           .replace("'", "\\'");
        
        return sanitized;
    }
}
```

### API 키 보안 관리
```java
// API 키 보안 관리
@Configuration
public class AISecurityConfig {
    
    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    @Bean
    public OpenAIAsyncClient secureOpenAIClient() {
        // API 키 검증
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            throw new IllegalStateException("OpenAI API 키가 설정되지 않았습니다.");
        }
        
        // 키 형식 검증
        if (!openaiApiKey.startsWith("sk-")) {
            throw new IllegalStateException("유효하지 않은 OpenAI API 키 형식입니다.");
        }
        
        return new OpenAIClientBuilder()
            .credential(new AzureKeyCredential(openaiApiKey))
            .buildAsyncClient();
    }
    
    @Bean
    public RateLimiter aiRequestRateLimiter() {
        // 분당 100회 요청 제한
        return RateLimiter.create(100.0 / 60.0);
    }
}
```

## 실무 면접 예상 질문

### AI 오케스트레이션 질문
1. **"Semantic Kernel과 LangChain의 차이점은 무엇인가요?"**
   - 언어 지원: SK는 다중 언어, LC는 주로 Python
   - 기업 환경: SK는 엔터프라이즈 친화적
   - 아키텍처: SK는 플러그인 기반, LC는 체인 기반

2. **"AI 에이전트가 여러 도구를 선택할 때 어떤 기준으로 결정하나요?"**
   - 플래너의 역할과 알고리즘
   - 컨텍스트 기반 도구 선택
   - 비용 및 성능 고려사항

### RAG 시스템 질문
1. **"RAG 시스템에서 검색 정확도를 높이는 방법은?"**
   - 청크 크기 최적화
   - 하이브리드 검색 (키워드 + 벡터)
   - 리랭킹 모델 적용

2. **"벡터 데이터베이스 선택 기준은 무엇인가요?"**
   - 성능: 검색 속도, 인덱싱 시간
   - 확장성: 데이터 크기, 동시 사용자
   - 기능: 필터링, 메타데이터 지원

### 보안 관련 질문
1. **"AI 시스템에서 프롬프트 인젝션을 어떻게 방어하나요?"**
2. **"API 키 관리와 사용량 제한은 어떻게 구현하나요?"**

### 경험 어필 포인트
- **실무 구현**: Spring Boot와 Semantic Kernel 통합
- **아키텍처 설계**: MCP 기반 확장 가능한 시스템
- **보안 고려**: 프롬프트 보안과 API 키 관리
- **성능 최적화**: RAG 시스템 튜닝 경험
