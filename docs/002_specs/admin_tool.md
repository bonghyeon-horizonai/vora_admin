# 도구 관리 기능 명세서 (Admin Tool Management Specification)

## 1. 개요
서비스에서 제공하는 AI 도구들을 관리하고, 각 도구와 백엔드 워크플로우를 매핑하며 다국어 정보를 설정하는 기능을 제공합니다.

## 2. 데이터베이스 스키마 설계
기존 스키마(`src/lib/db/schema.ts`)를 활용합니다.

### 2.1 `tools` 테이블
도구의 핵심 속성을 저장합니다.
- `id`: UUID (Primary Key)
- `category`: `tool_category_enum` (SEARCH, GENERATION, OPERATION, DOCUMENTS, UTILITY, KNOWLEDGE_BASE, AMUSEMENT)
- `tool_code`: 시스템 내부 고유 코드 (예: `tool_abc123`)
- `internal_usage_limit`: 내부 사용 제한 횟수
- `is_free`: 무료 여부 (Boolean)
- `tier`: 서비스 등급 (Integer)
- `icon_image_url`: 아이콘 이미지 경로 (Text)
- `is_active`: 활성화 상태 (Boolean, Default: true)
- `created_at`, `updated_at`: 타임스탬프

### 2.2 `tool_i18n` 테이블
도구의 다국어 정보를 저장합니다.
- `id`: UUID (Primary Key)
- `tool_id`: `tools.id` (Foreign Key)
- `language_code`: `language_code_enum` (KR, EN, JP)
- `name`: 도구명
- `description`: 도구 설명

### 2.3 `workflows` 테이블 (참조)
백엔드 워크플로우 식별자를 확인하는 데 사용됩니다.
- `id`: UUID
- `workflow_id`: 백엔드 워크플로우 식별자 (예: `vora_ppt_generator`)

## 3. 기능 상세

### 3.1 도구 목록 조회 (List View)
- **경로**: `/products/tools`
- **주요 기능**:
    - 테이블 형태의 목록 표시
    - **검색**: 도구명(다국어 포함) 또는 도구 내용 키워드 검색
    - **필터**: 상태(전체, 활성, 비활성) 필터링
    - **컬럼**: 도구명, 도구 코드, 워크플로우 연동(ID), 상태, 작성자(업데이트 기준), 등록일, 작업(수정/삭제)

### 3.2 도구 등록 및 수정 (Edit View)
- **경로**: `/products/tools/new` 또는 `/products/tools/[id]`
- **주요 기능**:
    - **다국어 입력**: 한국어, 영어, 일본어 탭 또는 그룹을 통해 도구명과 설명을 입력
    - **속성 설정**: 카테고리(구분), Tier(등급) 선택
    - **연동 정보**: `workflow_id` 입력 및 도구 코드 확인/수정
    - **아이콘 관리**: 이미지 업로드 및 미리보기
    - **상태 제어**: 활성화 토글 스위치

### 3.3 도구 삭제
- 목록에서 삭제 버튼 클릭 시 확인 팝업 노출 후 논리적 삭제 수행 (현재 스키마상 `deleted_at`이 없으므로 추가)

## 4. 데이터 처리 설게 (Server Actions & Server Components)

Next.js App Router의 기능을 활용하여 별도의 API Route 없이 구현합니다.

### 4.1 데이터 조회 (Data Fetching)
- **Server Components**에서 Drizzle ORM을 사용하여 직접 DB에 접근합니다.
- 필요한 경우 `react-gantt`나 `TanStack Query` 없이도 서버 컴포넌트의 데이터를 Props로 전달하여 렌더링 최적화를 수행할 수 있습니다 (클라이언트 상호작용이 많은 경우 Hydration 주의).
- 검색 및 필터링: URL Query Parameter(`searchParams`)를 기반으로 서버에서 쿼리를 수행합니다.

### 4.2 데이터 변경 (Mutations)
- **Server Actions** (`use server`)를 사용하여 폼 제출 및 데이터 변경을 처리합니다.
- 위치: `src/features/admin/tools/actions.ts` (또는 유사 경로)
- **주요 Actions**:
  - `createToolAction(data: ToolSchema)`: 도구 및 다국어 정보 생성
  - `updateToolAction(id: string, data: Partial<ToolSchema>)`: 도구 정보 수정
  - `deleteToolAction(id: string)`: 도구 삭제 (Soft Delete)
  - `toggleToolStatusAction(id: string, isActive: boolean)`: 활성화 상태 토글
- **유효성 검사**: `zod`를 사용하여 서버 사이드에서 입력값을 검증합니다.
- **피드백**: `useFormState` 또는 `toast`를 통해 성공/실패 메시지를 UI에 표시합니다.

## 5. UI/UX 디자인 가이드
- **컴포넌트**: `shadcn/ui` 기반의 Table, Input, Select, Switch, Tabs(다국어용) 사용
- **반응형**: 데스크탑 최우선, 관리자 페이지용 레이아웃 준수
