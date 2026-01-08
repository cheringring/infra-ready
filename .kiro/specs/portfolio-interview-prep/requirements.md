# Requirements Document

## Introduction

포트폴리오 기반 면접 준비 기능을 추가합니다. 관리자가 포트폴리오 문서를 업로드하면 AI가 분석하여 예상 면접 질문을 생성하고, 이를 개인 카테고리에 저장합니다.

## Glossary

- **Portfolio**: 사용자의 프로젝트 경험, 기술 스택 등을 담은 문서
- **Admin User**: 관리자 권한을 가진 사용자 (ADMIN_EMAIL로 가입한 사용자)
- **Private Category**: 관리자만 접근 가능한 카테고리
- **AI Analysis**: 포트폴리오를 분석하여 면접 질문을 생성하는 기능

## Requirements

### Requirement 1

**User Story:** As an admin, I want to access a private portfolio interview prep category, so that I can manage my personal interview questions.

#### Acceptance Criteria

1. WHEN an admin user navigates to the portfolio category THEN the system SHALL display the portfolio interview prep page
2. WHEN a non-admin user attempts to access the portfolio category THEN the system SHALL redirect to the home page with an error message
3. WHEN the portfolio category page loads THEN the system SHALL display an upload interface and existing questions

### Requirement 2

**User Story:** As an admin, I want to upload my portfolio document, so that the system can analyze it and generate interview questions.

#### Acceptance Criteria

1. WHEN an admin uploads a PDF file THEN the system SHALL accept files up to 10MB
2. WHEN a file is uploaded THEN the system SHALL extract text content from the PDF
3. WHEN text extraction completes THEN the system SHALL store the portfolio content in the database
4. WHEN an invalid file type is uploaded THEN the system SHALL display an error message

### Requirement 3

**User Story:** As an admin, I want the system to analyze my portfolio, so that I can get relevant interview questions.

#### Acceptance Criteria

1. WHEN portfolio content is available THEN the system SHALL provide an "Analyze" button
2. WHEN the analyze button is clicked THEN the system SHALL send the portfolio content to an AI service
3. WHEN AI analysis completes THEN the system SHALL generate 10-15 interview questions based on the portfolio
4. WHEN questions are generated THEN the system SHALL save them to the portfolio category

### Requirement 4

**User Story:** As an admin, I want to view and manage generated questions, so that I can prepare for interviews effectively.

#### Acceptance Criteria

1. WHEN questions are generated THEN the system SHALL display them in the portfolio category
2. WHEN viewing a question THEN the system SHALL show the question text and suggested answer
3. WHEN an admin wants to edit a question THEN the system SHALL provide an edit interface
4. WHEN an admin wants to delete a question THEN the system SHALL remove it from the database

### Requirement 5

**User Story:** As an admin, I want to manually add custom questions, so that I can supplement AI-generated questions.

#### Acceptance Criteria

1. WHEN an admin clicks "Add Question" THEN the system SHALL display a form
2. WHEN the form is submitted THEN the system SHALL validate the input
3. WHEN validation passes THEN the system SHALL save the question to the portfolio category
4. WHEN a question is added THEN the system SHALL display it in the question list
