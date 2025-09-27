# E2E Testing Directory - CLAUDE.md

This file provides guidance to Claude Code when working with the End-to-End (E2E) testing suite for the LearnerMax project.

## Directory Purpose

The `/e2e/` directory is dedicated to **integration testing only** - validating real user workflows, API interactions, database connections, and cross-system functionality. This directory:

- **Does NOT** contain unit tests or production code
- **Does NOT** mock external dependencies (tests real integrations)
- **Does** test complete user journeys and system interactions
- **Does** validate API contracts and frontend-backend integration

## Technology Stack

- **Testing Framework**: Playwright (`@playwright/test`)
- **Language**: TypeScript with Node.js 18+
- **Package Manager**: pnpm (`packageManager: pnpm@10.13.1`)
- **HTTP Client**: Playwright's built-in `request` fixture
- **OpenAPI Integration**: swagger-parser for contract testing
- **Configuration Management**: js-yaml for YAML parsing

## Project Structure

```
e2e/
├── package.json                # Dependencies and test scripts
├── playwright.config.ts        # Playwright configuration
├── CLAUDE.md                   # This guidance file
├── .auth/                      # Authentication state storage (gitignored)
├── tests/
│   ├── api/                    # API integration tests
│   │   ├── fixtures/
│   │   │   ├── api-client.ts   # Custom API fixtures
│   │   │   └── auth.ts         # Authentication fixtures
│   │   ├── pages/              # API page objects (if needed)
│   │   ├── utils/
│   │   │   ├── test-data.ts    # Test data generation
│   │   │   └── helpers.ts      # Utility functions
│   │   └── *.spec.ts           # API test files (one per domain/feature)
│   └── ui/                     # UI integration tests
│       ├── fixtures/
│       │   ├── auth.ts         # UI authentication fixtures
│       │   └── page-objects.ts # Page object fixtures
│       ├── pages/
│       │   ├── base-page.ts    # Base page object class
│       │   └── *.page.ts       # Page objects (one per page/feature)
│       ├── utils/
│       │   └── helpers.ts      # UI utility functions
│       └── *.spec.ts           # UI test files (one per feature/flow)
└── local.env                   # Local environment variables (gitignored)
```

## Available Commands

### Test Commands (All tests read configuration from local.env)
```bash
# API Integration Tests
pnpm run test:api              # Run API tests (uses local.env configuration)
pnpm run test:api:watch        # Interactive API testing mode

# UI Integration Tests (Chrome only)
pnpm run test:ui               # Run UI tests (uses local.env configuration)
pnpm run test:ui:watch         # Interactive UI testing mode

# Combined Testing
pnpm run test:all              # Run both API and UI tests (uses local.env configuration)
```

### Configuration (local.env file)
The e2e tests read all configuration from the `local.env` file:

```bash
# Configuration managed by prerequisite scripts:
UI_BASE_URL=<url>              # Frontend URL (Vercel preview or localhost:3000)
API_BASE_URL=<url>             # Backend API URL (AWS dev or localhost:8080)
TEST_ENV=<env>                 # Environment indicator (dev or local)
VERCEL_AUTOMATION_BYPASS_SECRET=<secret>  # Preview deployment access (preserved)
```

**Note**: The `local.env` file is automatically configured by the project's prerequisite scripts and should contain the correct URLs and environment settings for your testing scenario.

### Prerequisites
- Node.js 18+ and pnpm package manager installed
- Environment configured via `local.env` file (see Configuration section)

## Playwright Best Practices

### Test Organization
- **One test file per feature/domain** - Don't put all endpoints in a single file
- Create focused test files like `auth.spec.ts`, `items.spec.ts`, `dashboard.spec.ts`
- Use descriptive test names that explain user-visible behavior
- Group related tests using `test.describe()` blocks

### Test Structure
```typescript
// ✅ Good: Feature-focused test file
// tests/api/items.spec.ts
test.describe('Items API', () => {
  test.beforeAll(async ({ request }) => {
    // Setup authentication state
  });

  test('should create new item with valid data', async ({ request }) => {
    // Test implementation
  });

  test('should return 404 for non-existent item', async ({ request }) => {
    // Test implementation
  });
});
```

### API Testing Patterns

#### Request Fixture Usage
```typescript
// Use Playwright's built-in request fixture
test('api endpoint test', async ({ request }) => {
  const response = await request.post('/api/items', {
    data: { title: 'Test Item' }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.title).toBe('Test Item');
});
```

#### Custom API Fixtures
```typescript
// tests/api/fixtures/api-client.ts
export const apiTest = test.extend<{ apiClient: ApiClient }>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await client.authenticate();
    await use(client);
  }
});
```

### Authentication Patterns

#### Shared Authentication State
```typescript
// tests/api/fixtures/auth.ts
export const authenticatedTest = test.extend<{ authRequest: APIRequestContext }>({
  authRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });
    await use(context);
    await context.dispose();
  }
});
```

#### UI Authentication with Storage State
```typescript
// Store auth state in .auth directory
test('authenticated flow', async ({ page }) => {
  await page.context().storageState({ path: '.auth/user.json' });
});
```

### Page Object Model (POM)

#### Base Page Structure
```typescript
// tests/ui/pages/base-page.ts
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
```

#### Feature-Specific Page Objects
```typescript
// tests/ui/pages/dashboard.page.ts
export class DashboardPage extends BasePage {
  readonly addItemButton: Locator;
  readonly itemsList: Locator;

  constructor(page: Page) {
    super(page);
    this.addItemButton = page.getByRole('button', { name: 'Add Item' });
    this.itemsList = page.getByTestId('items-list');
  }

  async addItem(title: string) {
    await this.addItemButton.click();
    // Additional logic
  }
}
```

#### Page Object Fixtures
```typescript
// tests/ui/fixtures/page-objects.ts
export const uiTest = test.extend<{ dashboardPage: DashboardPage }>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/dashboard');
    await use(dashboardPage);
  }
});
```

## Testing Philosophy

### User-Centric Testing
- Test user-visible behavior, not implementation details
- Use user-facing attributes for element selection
- Focus on what end users actually see and interact with
- Avoid testing CSS classes or internal function names

### Test Isolation
- Each test should be completely independent
- Use `beforeEach`/`afterEach` hooks for consistent test state
- Avoid test dependencies on other tests
- Clean up test data after each test

### Web-First Assertions
```typescript
// ✅ Good: Auto-waiting assertions
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();

// ❌ Avoid: Manual assertions without waiting
expect(await page.textContent('.status')).toBe('Success');
```

## Configuration Patterns

### Environment-Based Configuration
```typescript
// Configuration comes from local.env via dotenv
const config = {
  apiBaseURL: process.env.API_BASE_URL,
  uiBaseURL: process.env.UI_BASE_URL,
  testEnv: process.env.TEST_ENV
};
```

### Playwright Configuration (playwright.config.ts)
- **Chrome only for UI tests** (as requested)
- Separate projects for API and UI tests
- Environment-specific base URLs
- Appropriate timeouts and retries

## Test Data Management

### Dynamic Test Data
```typescript
// Generate unique test data to avoid conflicts
export class TestDataGenerator {
  static createItem() {
    return {
      id: `test-${Date.now()}-${Math.random()}`,
      title: `Test Item ${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  }
}
```

### Test Cleanup
```typescript
test.afterEach(async ({ request }) => {
  // Clean up test data
  await request.delete(`/api/items/${testItemId}`);
});
```

## Debugging and Troubleshooting

### Interactive Testing
```bash
# Use Playwright's built-in debugging
pnpm run test:ui:watch          # Interactive UI testing mode
pnpm run test:api:watch         # Interactive API testing mode
pnpm run test:api --debug       # Debug mode for API tests
```

### CI/CD Integration
- Store authentication states in `.auth` directory (gitignored)
- Use trace collection for failed test debugging
- Configure appropriate timeouts for CI environment
- Use parallelization for faster test execution

### Common Issues
- **Authentication failures**: Check token expiration and permissions
- **Flaky tests**: Use proper waits and retries
- **Element not found**: Prefer user-facing locators over CSS selectors
- **Timeout issues**: Adjust timeouts based on environment

## File Naming Conventions

### API Tests
- `auth.spec.ts` - Authentication flows
- `items.spec.ts` - Items CRUD operations
- `users.spec.ts` - User management
- `integration.spec.ts` - Cross-system integrations

### UI Tests
- `login.spec.ts` - Login/logout flows
- `dashboard.spec.ts` - Dashboard functionality
- `item-management.spec.ts` - Item creation/editing
- `navigation.spec.ts` - App navigation flows

### Page Objects
- `base.page.ts` - Base page class
- `login.page.ts` - Login page object
- `dashboard.page.ts` - Dashboard page object
- `*.page.ts` - Feature-specific page objects

## Dependencies

### Core Dependencies
- `@playwright/test`: ^1.55.0 (testing framework)
- `swagger-parser`: ^10.0.3 (OpenAPI parsing)
- `js-yaml`: ^4.1.0 (YAML configuration)

### Development Tools
- TypeScript with Node.js type definitions
- pnpm for package management
- HTML reporter for visual test results