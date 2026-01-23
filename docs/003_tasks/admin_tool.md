# 도구 관리 구현 작업 목록 (Admin Tool Implementation Tasks)

## Phase 1: 기반 작업 및 백엔드 (Backend & Database)
- [ ] **데이터베이스 정리**
    - [x] 기존 `tools`, `tool_i18n`, `workflows` 테이블 구조 확인
    - [ ] `tools` 테이블에 `deleted_at` 추가 (Soft delete용)
- [ ] **데이터 처리 (Server Actions & Components)**
    - [ ] `GET`: Drizzle ORM을 사용한 데이터 조회 함수 구현 (`src/features/admin/tools/queries.ts`)
    - [ ] `POST`: 도구 생성 Server Action 구현 (`createToolAction`) - 트랜잭션 처리 포함
    - [ ] `PATCH`: 도구 수정 Server Action 구현 (`updateToolAction`)
    - [ ] `DELETE`: 도구 삭제 Server Action 구현 (`deleteToolAction`)
    - [ ] 유효성 검사 스키마 정의 (`zod`)

## Phase 2: 프론트엔드 UI 구현 (Frontend UI)
- [ ] **페이지 구조 생성**
    - [ ] `src/app/(dashboard)/products/tools/page.tsx`: 목록 페이지
    - [ ] `src/app/(dashboard)/products/tools/[id]/page.tsx`: 연동/수정 페이지
- [ ] **목록 페이지 구현**
    - [ ] 도구 목록 데이터 패칭 (TanStack Query 추천)
    - [ ] `shadcn/ui` Table을 이용한 데이터 렌더링
    - [ ] 검색창 및 상태 필터 연동
- [ ] **등록/수정 폼 구현**
    - [ ] `react-hook-form` & `zod`를 이용한 폼 검증
    - [ ] 다국어 입력용 Tabs 컴포넌트 구성 (KR, EN, JP)
    - [ ] 이미지 업로드 컴포넌트 연동
    - [ ] 활성화 토글 및 저장 로직

## Phase 3: 메뉴 연동 및 마무리 (Integration & Polish)
- [ ] **사이드바 메뉴 업데이트**
    - [ ] `src/menu-items.ts`에 '상품 관리' 그룹 및 '도구 목록' 하위 메뉴 추가
- [ ] **i18n 메시지 추가**
    - [ ] `src/i18n/messages/*.json`에 도구 관리 관련 번역 키 추가
- [ ] **권한 확인 (Optional)**
    - [ ] 관리자 권한을 가진 사용자만 접근 가능하도록 미들웨어 또는 레이아웃에서 체크

## Phase 4: 검증 및 테스트 (Verification)
- [ ] 도구 등록, 수정, 삭제 시나리오 테스트
- [ ] 다국어 정보가 정상적으로 저장되고 조회되는지 확인
- [ ] 워크플로우 아이디 연동 정상 작동 확인
- [ ] 이미지 업로드 및 미리보기 확인
