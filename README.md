# OrangeHRM System Users — Playwright E2E

Maintainable end-to-end coverage for the System Users workflow in the shared
[OrangeHRM demo](https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers).

The project uses Playwright and TypeScript and intentionally focuses on one
complete business flow rather than broad OrangeHRM coverage.

## Covered scenario

The test performs the following lifecycle:

1. Logs in as an administrator.
2. Navigates to the System Users page.
3. Creates a system user with a timestamp-based unique username.
4. Filters by that exact username and verifies the user appears.
5. Changes the role from `Admin` to `ESS` and the status from `Enabled` to
   `Disabled`.
6. Searches again and verifies the persisted role and status.
7. Deletes the user through the confirmation dialog.
8. Searches again and verifies that no matching user row remains.

Three isolated negative checks also cover invalid login credentials, searching
for an unknown username, and submitting the user form without a username. These
tests do not create persistent data.

## Prerequisites

- Node.js LTS
- npm

## Installation

```bash
npm install
npx playwright install chromium
```

## Configuration

The public demo values are defaults, so no local configuration is required for
the standard run. They can be overridden with shell or CI environment variables:

| Variable | Default |
| --- | --- |
| `BASE_URL` | `https://opensource-demo.orangehrmlive.com/` |
| `ADMIN_USERNAME` | `Admin` |
| `ADMIN_PASSWORD` | `admin123` |
| `EMPLOYEE_NAME` | `Timothy Lewis Amiano` |

Example:

```bash
BASE_URL=https://example.test ADMIN_USERNAME=Admin npm test
```

See `.env.example` for all supported variables. The project does not
automatically load `.env` files; export the values in the shell or provide them
through the execution environment.

## Running the test

```bash
npm test
npm run test:negative   # Run only negative scenarios
```

Useful alternatives:

```bash
npm run test:headed   # Run with a visible browser
npm run test:ui       # Open Playwright UI mode
npx playwright test --debug
npm run report        # Open the latest HTML report
```

Project checks:

```bash
npm run typecheck
npm run format:check
```

## Project structure

```text
config/
  environment.ts       Runtime configuration and public-demo defaults
pages/
  LoginPage.ts         Login navigation and authentication actions
  SystemUsersPage.ts   User creation, filtering, editing, and deletion
tests/
  users.spec.ts        Single end-to-end user lifecycle specification
  users-negative.spec.ts  Isolated validation and negative scenarios
playwright.config.ts   Browser, retry, reporter, trace, and screenshot settings
tsconfig.json          Strict TypeScript configuration
```

The structure is deliberately small. A page-manager or custom fixture would add
indirection without much benefit for the current lifecycle and negative
coverage.

## Design decisions

### Page Object Model

`LoginPage` owns login controls and behavior. `SystemUsersPage` owns System Users
locators and exposes intent-oriented operations such as `createUser`, `findUser`,
`updateRoleAndStatus`, and `deleteUser`. The spec reads as a business workflow and
keeps OrangeHRM CSS and icon details in the page object.

Domain values use TypeScript unions (`UserRole` and `UserStatus`) so unsupported
role or status values fail during type checking rather than at runtime.

### Synchronization and flaky UI

The test uses Playwright locator auto-waiting and state-based synchronization. It
does not use fixed sleeps or `waitForTimeout`.

- Navigation waits for a destination heading or URL.
- Editing waits for OrangeHRM to return to the System Users URL before searching.
- Deletion waits for the selected row to detach after confirmation.
- Assertions verify persisted table state instead of relying on short-lived
  update and delete toasts.

### Shared-demo data

The username includes `Date.now()` to reduce collisions with concurrent users of
the public demo. Searches and row actions are scoped to that exact username; the
test never assumes an empty user table. The normal path explicitly deletes and
verifies the user. A `finally` cleanup removes it when a later test step fails.

The Playwright configuration uses one worker because concurrent authentication
and mutations are unsafe against this shared tenant.

Because the target is a shared public environment, employee suggestions and
server responsiveness can change independently of this repository. Override
`EMPLOYEE_NAME` if the default employee is unavailable.

### Selector improvement if we owned the product

The edit and delete buttons currently require implementation-specific icon
selectors such as `.bi-pencil-fill` and `.bi-trash` because their accessible names
are icon glyphs. I would add stable, semantic attributes:

```html
<button data-testid="edit-user" aria-label="Edit user">...</button>
<button data-testid="delete-user" aria-label="Delete user">...</button>
```

Accessible names would improve both product accessibility and test resilience.

## Known limitations and tradeoffs

- The public environment is mutable and may be temporarily unavailable.
- Cleanup is best-effort because the public application or browser can become
  unavailable during failure handling.
- Chromium is the only configured browser because multi-browser coverage is out
  of scope for this task.
- Authentication is intentionally performed through the UI because login is
  part of the required end-to-end flow.

## With another hour

1. Add an `@smoke` tag and a corresponding package script.
2. Extract authentication and cleanup into fixtures if the suite grows.
3. Add linting and run type checking and formatting checks in automation.

## Reporting

Playwright uses the HTML reporter and captures screenshots only on failure. It
records a trace on the first retry. Tests retry once locally and twice in CI. No
additional reporting framework is used, in line with the requested scope.
