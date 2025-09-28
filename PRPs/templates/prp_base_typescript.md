name: "TypeScript PRP Template v3 - Implementation-Focused with Precision Standards"
description: |

---

## Goal

**Feature Goal**: [Specific, measurable end state of what needs to be built]

**Deliverable**: [Concrete artifact - React component, API route, integration, etc.]

**Success Definition**: [How you'll know this is complete and working]

## User Persona (if applicable)

**Target User**: [Specific user type - developer, end user, admin, etc.]

**Use Case**: [Primary scenario when this feature will be used]

**User Journey**: [Step-by-step flow of how user interacts with this feature]

**Pain Points Addressed**: [Specific user frustrations this feature solves]

## Why

- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What

[User-visible behavior and technical requirements]

### Success Criteria

- [ ] [Specific measurable outcomes]

## All Needed Context

### Context Completeness Check

_Before writing this PRP, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: [Complete URL with section anchor]
  why: [Specific methods/concepts needed for implementation]
  critical: [Key insights that prevent common implementation errors]

- file: [exact/path/to/pattern/file.tsx]
  why: [Specific pattern to follow - component structure, hook usage, etc.]
  pattern: [Brief description of what pattern to extract]
  gotcha: [Known constraints or limitations to avoid]

- docfile: [PRPs/ai_docs/typescript_specific.md]
  why: [Custom documentation for complex TypeScript/Next.js patterns]
  section: [Specific section if document is large]
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash

```

### Desired Codebase tree with files to be added and responsibility of file

```bash

```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: [Library name] requires [specific setup]
// Example: Next.js 15 App Router - Route handlers must export named functions
// Example: 'use client' directive must be at top of file, affects entire component tree
// Example: Server Components can't use browser APIs or event handlers
// Example: We use TypeScript strict mode and require proper typing
```

## Implementation Blueprint

### Data models and structure

Create the core data models, we ensure type safety and consistency.

```typescript
Examples:
 - Zod schemas for validation
 - TypeScript interfaces/types
 - Database schema types
 - API response types
 - Component prop types

```

### Implementation Tasks (ordered by subdirectory and dependencies)

```yaml
# BACKEND TASKS (TDD: Test First, then Implementation)
Task 1: CREATE backend/src/__tests__/{domain}.test.ts
  - IMPLEMENT: Unit tests for domain logic (WRITE FIRST - SHOULD FAIL)
  - FOLLOW pattern: backend/src/__tests__/existing.test.ts (test structure, mocking patterns)
  - NAMING: describe blocks, test naming conventions, TypeScript test typing
  - COVERAGE: All business logic, API handlers, data models with positive and negative test cases
  - PLACEMENT: Tests in backend/src/__tests__/
  - TDD: Run test, verify it FAILS, then proceed to Task 2

Task 2: CREATE backend/src/types/{domain}.types.ts
  - IMPLEMENT: TypeScript interfaces and types for domain models, API contracts
  - FOLLOW pattern: backend/src/types/existing.types.ts (interface structure, export patterns)
  - NAMING: PascalCase for interfaces, camelCase for properties
  - PLACEMENT: Type definitions in backend/src/types/
  - DEPENDENCIES: Must satisfy failing tests from Task 1

Task 3: CREATE backend/src/routes/{domain}.ts
  - IMPLEMENT: Express route handlers with proper TypeScript typing
  - FOLLOW pattern: backend/src/routes/existing.ts (route structure, error patterns)
  - NAMING: Named exports for route functions, proper TypeScript typing
  - DEPENDENCIES: Import types from Task 2
  - PLACEMENT: Route handlers in backend/src/routes/
  - TDD: Run tests from Task 1, verify they now PASS

# FRONTEND TASKS (TDD: Test First, then Implementation)
Task 4: CREATE frontend/components/__tests__/{component}.test.tsx
  - IMPLEMENT: Unit tests for React components and hooks (WRITE FIRST - SHOULD FAIL)
  - FOLLOW pattern: frontend/components/__tests__/existing.test.tsx (test structure, mocking patterns)
  - NAMING: describe blocks, test naming conventions, TypeScript test typing
  - COVERAGE: All components and hooks with positive and negative test cases
  - PLACEMENT: Tests in frontend/components/__tests__/
  - TDD: Run test, verify it FAILS, then proceed to Task 5

Task 5: CREATE frontend/lib/types/{domain}.types.ts
  - IMPLEMENT: TypeScript interfaces for frontend data models, component props
  - FOLLOW pattern: frontend/lib/types/existing.types.ts (interface structure, export patterns)
  - NAMING: PascalCase for interfaces, camelCase for properties
  - PLACEMENT: Type definitions in frontend/lib/types/
  - DEPENDENCIES: Must satisfy failing tests from Task 4

Task 6: CREATE frontend/components/{domain}/{ComponentName}.tsx
  - IMPLEMENT: React component with proper TypeScript props interface
  - FOLLOW pattern: frontend/components/existing/ExistingComponent.tsx (component structure, props typing)
  - NAMING: PascalCase for components, camelCase for props, kebab-case for CSS classes
  - DEPENDENCIES: Import types from Task 5
  - PLACEMENT: Component layer in frontend/components/{domain}/
  - TDD: Run tests from Task 4, verify they now PASS

Task 7: CREATE frontend/lib/hooks/use{DomainAction}.ts
  - IMPLEMENT: Custom React hooks for state management and API calls
  - FOLLOW pattern: frontend/lib/hooks/useExisting.ts (hook structure, TypeScript generics, error handling)
  - NAMING: use{ActionName} with proper TypeScript return types
  - DEPENDENCIES: Import types from Task 5, backend API endpoints from Tasks 2-3
  - PLACEMENT: Custom hooks in frontend/lib/hooks/
  - TDD: Ensure hook tests from Task 4 PASS

Task 8: CREATE frontend/app/{feature}/page.tsx
  - IMPLEMENT: Next.js page component using domain components
  - FOLLOW pattern: frontend/app/existing-page/page.tsx (page structure, metadata, error boundaries)
  - NAMING: Default export, proper metadata export, TypeScript page props
  - DEPENDENCIES: Import components from Task 6, hooks from Task 7, types from Task 5
  - PLACEMENT: Page routes in frontend/app/{feature}/

Task 9: CREATE frontend/app/api/{resource}/route.ts
  - IMPLEMENT: Next.js API route handlers (orchestration layer to backend APIs)
  - FOLLOW pattern: frontend/app/api/existing/route.ts (request/response handling, error patterns)
  - NAMING: Named exports (GET, POST, PUT, DELETE), proper TypeScript typing
  - DEPENDENCIES: Import types from Task 5, call backend APIs from Tasks 2-3
  - PLACEMENT: API routes in frontend/app/api/{resource}/

# E2E TASKS (Integration Testing)
Task 10: CREATE e2e/tests/ui/{feature}.spec.ts
  - IMPLEMENT: Playwright UI integration tests for complete user workflows
  - FOLLOW pattern: e2e/tests/ui/existing.spec.ts (test structure, page object patterns)
  - NAMING: describe blocks for user journeys, test naming for specific UI flows
  - COVERAGE: Real user workflows, UI interactions, form submissions, navigation flows
  - DEPENDENCIES: Requires completed frontend (Tasks 4-9)
  - PLACEMENT: UI integration tests in e2e/tests/ui/
  - SCOPE: End-to-end user interface scenarios

Task 11: CREATE e2e/tests/api/{feature}.spec.ts
  - IMPLEMENT: Playwright API integration tests for backend functionality
  - FOLLOW pattern: e2e/tests/api/existing.spec.ts (API test structure, request/response patterns)
  - NAMING: describe blocks for API endpoints, test naming for specific API flows
  - COVERAGE: API interactions, database connections, cross-system functionality
  - DEPENDENCIES: Requires completed backend (Tasks 1-3) and frontend API routes (Task 9)
  - PLACEMENT: API integration tests in e2e/tests/api/
  - SCOPE: End-to-end API and system integration scenarios
```

### Implementation Patterns & Key Details

```typescript
// Show critical patterns and gotchas - keep concise, focus on non-obvious details

// Example: Component pattern
interface {Domain}Props {
  // PATTERN: Strict TypeScript interfaces (follow lib/types/existing.types.ts)
  data: {Domain}Data;
  onAction?: (id: string) => void;
}

export function {Domain}Component({ data, onAction }: {Domain}Props) {
  // PATTERN: Client/Server component patterns (check existing components)
  // GOTCHA: 'use client' needed for event handlers, useState, useEffect
  // CRITICAL: Server Components for data fetching, Client Components for interactivity

  return (
    // PATTERN: Consistent styling approach (see components/ui/)
    <div className="existing-class-pattern">
      {/* Follow existing component composition patterns */}
    </div>
  );
}

// Example: API route pattern
export async function GET(request: Request): Promise<Response> {
  // PATTERN: Request validation and error handling (see app/api/existing/route.ts)
  // GOTCHA: [TypeScript-specific constraint or Next.js requirement]
  // RETURN: Response object with proper TypeScript typing
}

// Example: Custom hook pattern
export function use{Domain}Action(): {Domain}ActionResult {
  // PATTERN: Hook structure with TypeScript generics (see hooks/useExisting.ts)
  // GOTCHA: [React hook rules and TypeScript typing requirements]
}
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add table 'feature_data' with proper indexes"
  - client: "@/lib/database/client"
  - pattern: "createClient() for client components, createServerClient() for server components"

CONFIG:
  - add to: .env.local
  - pattern: "NEXT_PUBLIC_* for client-side env vars"
  - pattern: "FEATURE_TIMEOUT = process.env.FEATURE_TIMEOUT || '30000'"

ROUTES:
  - file structure: app/feature-name/page.tsx
  - api routes: app/api/feature-name/route.ts
  - middleware: middleware.ts (root level)
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# FRONTEND VALIDATION (run in /frontend directory)
cd frontend
pnpm lint                      # ESLint checks with TypeScript rules
npx tsc --noEmit              # TypeScript type checking (no JS output)
# Note: Frontend has lint script but no format script configured

# BACKEND VALIDATION (run in /backend directory)
cd backend
pnpm run build                # TypeScript compilation to /dist
# Note: Backend needs ESLint added to package.json scripts

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# FRONTEND TESTS (run in /frontend directory)
cd frontend
pnpm test                     # Run all Jest tests
pnpm test:coverage            # Run tests with coverage report
pnpm test:watch               # Run tests in watch mode during development

# Test specific patterns
pnpm test -- components/__tests__/{domain}.test.tsx
pnpm test -- lib/__tests__/{utility}.test.ts

# BACKEND TESTS (run in /backend directory)
cd backend
pnpm test                     # Run Jest tests with ts-jest
pnpm test:watch               # Run tests in watch mode

# Test specific patterns
pnpm test -- __tests__/unit/services/{service}.test.ts

# Expected: All tests pass. If failing, debug root cause and fix implementation.
```

### Level 3: Integration Testing (System Validation)

```bash
# FRONTEND INTEGRATION (run in /frontend directory)
cd frontend
pnpm run dev &                # Start Next.js dev server with Turbopack
sleep 5                       # Allow Next.js startup time

# Page load validation
curl -I http://localhost:3000/{feature-page}
# Expected: 200 OK response

# Production build validation
pnpm run build               # Build for production with Turbopack
# Expected: Successful build with no TypeScript errors or warnings

# BACKEND INTEGRATION (run in /backend directory)
cd backend
pnpm run dev &               # Start Express server on port 8080
sleep 3                      # Allow Express startup time

# Health check validation
curl -I http://localhost:8080/health
# Expected: 200 OK response with environment info

# API endpoint validation
curl -X GET http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  | jq .  # Pretty print JSON response

# SAM local testing (optional)
sam build                    # Build SAM application

# Expected: All integrations working, proper responses, APIs functional
```

## Final Validation Checklist

### Technical Validation

- [ ] All 3 validation levels completed successfully
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] No formatting issues: `npm run format --check`
- [ ] Production build succeeds: `npm run build`

### Feature Validation

- [ ] All success criteria from "What" section met
- [ ] Manual testing successful: [specific commands from Level 3]
- [ ] Error cases handled gracefully with proper TypeScript error types
- [ ] Integration points work as specified
- [ ] User persona requirements satisfied (if applicable)

### Code Quality Validation

- [ ] Follows existing TypeScript/React patterns and naming conventions
- [ ] File placement matches desired codebase tree structure
- [ ] Anti-patterns avoided (check against Anti-Patterns section)
- [ ] Dependencies properly managed with correct TypeScript typings
- [ ] Configuration changes properly integrated

### TypeScript/Next.js Specific

- [ ] Proper TypeScript interfaces and types defined
- [ ] Server/Client component patterns followed correctly
- [ ] 'use client' directives used appropriately
- [ ] API routes follow Next.js App Router patterns
- [ ] No hydration mismatches between server/client rendering

### Documentation & Deployment

- [ ] Code is self-documenting with clear TypeScript types
- [ ] Props interfaces properly documented
- [ ] Environment variables documented if new ones added

---

## Anti-Patterns to Avoid

- ❌ Don't create new patterns when existing ones work
- ❌ Don't skip validation because "it should work"
- ❌ Don't ignore failing tests - fix them
- ❌ Don't use 'use client' unnecessarily - embrace Server Components
- ❌ Don't hardcode values that should be config
- ❌ Don't catch all exceptions - be specific
