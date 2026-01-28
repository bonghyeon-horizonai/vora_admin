# 상품 관리 구현 작업 목록 (Admin Product Implementation Tasks)

## Phase 1: 기반 작업 및 백엔드 (Backend & Database)

### 1.1 데이터베이스 마이그레이션
- [ ] **`products` 테이블 확장**
    - [ ] `type` 컬럼 추가 (`product_type_enum`)
    - [ ] `category` 컬럼 추가 (Text)
    - [ ] `billing_cycle` 컬럼 추가 (Text: MONTHLY, YEARLY, ONCE)
    - [ ] `product_code` 컬럼 추가 (Text, Unique)
    - [ ] `icon_image_url` 컬럼 추가 (Text)
    - [ ] `updated_at` 컬럼 추가 (Timestamp)
    - [ ] `deleted_at` 컬럼 추가 (Timestamp, Soft Delete용)
- [ ] **`product_tools` 테이블 확장**
    - [ ] `sort_order` 컬럼 추가 (Integer)
- [ ] Drizzle 마이그레이션 파일 생성 (`pnpm drizzle-kit generate`)
- [ ] 마이그레이션 적용 (`pnpm drizzle-kit push`)

### 1.2 타입 및 스키마 정의
- [ ] `src/features/admin/products/types.ts` 생성
    - [ ] `Product`, `ProductI18n`, `ProductTool` 타입 정의
    - [ ] `CreateProductInput`, `UpdateProductInput` DTO 정의
- [ ] `src/features/admin/products/schemas.ts` 생성
    - [ ] `productFormSchema` (Zod) 정의
    - [ ] 다국어/다통화 입력 검증 스키마
    - [ ] 도구 번들링 검증 스키마

### 1.3 Paddle SDK 서비스
- [ ] `@paddle/paddle-node-sdk` 패키지 설치 확인
- [ ] `src/lib/paddle.ts` 또는 `src/features/billing/paddle-service.ts` 생성
    - [ ] Paddle SDK 인스턴스 생성
    - [ ] `createProduct(data)`: Paddle 상품 생성
    - [ ] `createPrice(productId, data)`: Paddle 가격 생성 (Product와 1:1)
    - [ ] `updateProduct(paddleProductId, data)`: Paddle 상품 수정
    - [ ] `updatePrice(paddlePriceId, data)`: Paddle 가격 수정
    - [ ] `getProduct(paddleProductId)`: Paddle 상품 조회
    - [ ] 에러 핸들링 및 로깅

### 1.4 데이터 처리 (Server Actions & Queries)
- [ ] `src/features/admin/products/queries.ts` 생성
    - [ ] `getProducts(params)`: 목록 조회 (검색, 필터, 페이지네이션)
    - [ ] `getProductById(id)`: 단일 상품 조회 (다국어/도구 포함)
    - [ ] `getProductsCount(params)`: 총 개수 조회
- [ ] `src/features/admin/products/actions.ts` 생성
    - [ ] `createProductAction(data)`: 상품 생성 (트랜잭션: products + products_i18n + product_tools)
    - [ ] `updateProductAction(id, data)`: 상품 수정
    - [ ] `deleteProductAction(id)`: Soft Delete
    - [ ] `toggleProductStatusAction(id, isActive)`: 활성화 토글
    - [ ] `linkPaddleProductAction(id)`: Paddle 연동 및 `paddle_product_id`, `paddle_price_id` 저장
    - [ ] `syncPaddleProductAction(id)`: Paddle 정보 동기화

## Phase 2: 프론트엔드 UI 구현 (Frontend UI)

### 2.1 페이지 구조 생성
- [ ] `src/app/(dashboard)/products/list/page.tsx`: 상품 목록 페이지
- [ ] `src/app/(dashboard)/products/list/[id]/page.tsx`: 상품 상세/수정 페이지
- [ ] `src/app/(dashboard)/products/list/new/page.tsx`: 상품 등록 페이지 (또는 [id]와 통합)

### 2.2 상품 목록 페이지 구현
- [ ] 서버 컴포넌트에서 상품 목록 데이터 패칭
- [ ] MUI DataGrid를 이용한 테이블 렌더링
    - [ ] 컬럼: 상품명, 가격(USD), 주기, 상태, 작성일, 수정일, 작업
    - [ ] 행 동작: 수정/삭제 버튼
- [ ] 검색창 구현 (상품명 키워드)
- [ ] 상태 필터 드롭다운 (전체/활성/비활성)
- [ ] 주기 필터 드롭다운 (전체/월간/연간/1회성)
- [ ] 페이지네이션 연동
- [ ] `[+ 상품 등록]` 버튼 → `/products/list/new` 이동

### 2.3 상품 등록/수정 폼 구현 (Multi-Step)
- [ ] **공통 구성**
    - [ ] `react-hook-form` + `zod` 폼 검증 설정
    - [ ] Stepper 컴포넌트 (Step 1: 기본 정보, Step 2: 상세 정보)
    - [ ] 수정 시 기존 데이터 로딩 및 폼 초기화

- [ ] **Step 1: 기본 정보 탭**
    - [ ] 상품 속성 필드: 구분, 주기, 카테고리 (Select)
    - [ ] 1회성 여부 토글 (Switch)
    - [ ] 상품 코드 필드: 자동 생성 + 복사 버튼
    - [ ] Paddle 연동 버튼: 클릭 시 `linkPaddleProductAction` 호출
    - [ ] 다국어 가격 입력 (Tabs: KR/EN/JP)
        - [ ] 각 탭: 상품명 입력, 통화 선택, 가격 입력
    - [ ] 도구 번들링 섹션
        - [ ] 도구 검색 Autocomplete
        - [ ] 선택된 도구 리스트 (Chip 형태)
        - [ ] 드래그앤드롭 순서 변경 (`@dnd-kit/core`)
        - [ ] 각 도구별 월 제공량 입력 (NumberField)
        - [ ] 도구 삭제 버튼
    - [ ] 취소/다음 버튼 (다음 클릭 시 임시 저장 안내)

- [ ] **Step 2: 상세 정보 탭**
    - [ ] 다국어 상품 설명 (Tabs: KR/EN/JP)
        - [ ] Textarea 입력
    - [ ] 아이콘 이미지 업로드
        - [ ] 파일 선택 및 미리보기
        - [ ] 권장 사이즈 안내 (512x512px)
        - [ ] 업로드된 URL 표시
    - [ ] 활성화 토글 (Switch)
    - [ ] 이전/저장 버튼

### 2.4 삭제 확인 다이얼로그
- [ ] 삭제 버튼 클릭 시 확인 다이얼로그 표시
- [ ] 확인 시 `deleteProductAction` 호출
- [ ] 성공/실패 Toast 표시

## Phase 3: 메뉴 연동 및 마무리 (Integration & Polish)

### 3.1 사이드바 메뉴 업데이트
- [ ] `src/menu-items.ts`에 '상품 관리' 그룹 확인
- [ ] '상품 목록' 메뉴 아이템 추가/수정 (`/products/list`)

### 3.2 i18n 메시지 추가
- [ ] `src/i18n/messages/ko.json`: 상품 관리 관련 한국어 번역
- [ ] `src/i18n/messages/en.json`: 상품 관리 관련 영어 번역
- [ ] `src/i18n/messages/ja.json`: 상품 관리 관련 일본어 번역
- [ ] 번역 키 예시:
    - `products.title`, `products.create`, `products.edit`
    - `products.fields.*` (name, price, cycle, status 등)
    - `products.actions.*` (save, delete, linkPaddle 등)
    - `products.messages.*` (success, error 메시지)

### 3.3 Paddle Webhook 연동 확인
- [ ] `/api/webhooks/paddle` 엔드포인트 존재 여부 확인
- [ ] `product.created`, `product.updated` 이벤트 핸들러 확인/추가
- [ ] `price.created`, `price.updated` 이벤트 핸들러 확인/추가
- [ ] 로컬 테스트를 위한 Paddle Sandbox 설정 확인

### 3.4 권한 확인 (Optional)
- [ ] 관리자 권한 체크 미들웨어 또는 레이아웃 레벨 확인
- [ ] 비관리자 접근 시 리다이렉트 또는 에러 처리

## Phase 4: 검증 및 테스트 (Verification)

### 4.1 단위 테스트
- [ ] `src/features/admin/products/schemas.test.ts`: Zod 스키마 검증 테스트
- [ ] `src/features/admin/products/queries.test.ts`: DB 쿼리 테스트 (mocking)
- [ ] `src/features/admin/products/actions.test.ts`: Server Actions 테스트

### 4.2 통합 테스트 시나리오
- [ ] **상품 등록 플로우**
    1. 상품 등록 페이지 진입
    2. Step 1 정보 입력 (속성, 다국어 가격, 도구 선택)
    3. Step 2 정보 입력 (설명, 이미지, 활성화)
    4. 저장 후 목록에서 확인
- [ ] **상품 수정 플로우**
    1. 목록에서 수정 버튼 클릭
    2. 기존 데이터 로딩 확인
    3. 정보 수정 후 저장
    4. 변경사항 반영 확인
- [ ] **상품 삭제 플로우**
    1. 삭제 버튼 클릭 → 확인 다이얼로그
    2. 삭제 후 목록에서 제거 확인
    3. (Soft Delete) DB에서 `deleted_at` 설정 확인

### 4.3 Paddle 연동 테스트
- [ ] Paddle Sandbox 환경에서 상품 생성 테스트
- [ ] `paddle_product_id` 저장 확인
- [ ] Webhook 이벤트 수신 및 처리 확인

### 4.4 UI/UX 검증
- [ ] 다국어 탭 전환 시 데이터 유지 확인
- [ ] 도구 드래그앤드롭 순서 변경 정상 동작 확인
- [ ] 이미지 업로드 및 미리보기 확인
- [ ] 반응형 레이아웃 확인 (데스크탑 우선)
- [ ] 폼 유효성 검사 에러 메시지 표시 확인
