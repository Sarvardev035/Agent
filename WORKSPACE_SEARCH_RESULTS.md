# Workspace Search Results - Comprehensive Component & Handler Mapping

## 1. ACCOUNT DELETION HANDLER/COMPONENT

### Account Deletion Handler
- **File**: [src/pages/Accounts.tsx](src/pages/Accounts.tsx)
  - **Delete Handler Function**: Lines 90-100
  - **Delete Confirmation**: Lines 372-373
  - **Delete API Call**: Line 93 (`await api.delete(/api/accounts/${confirmId})`)
  - **Toast Message**: Line 94 (`toast.success('Account deleted')`)

### Account Delete Dialog
- **File**: [src/components/ui/alert-dialog-icon.tsx](src/components/ui/alert-dialog-icon.tsx)
  - **Dialog Title**: Line 26 ("Delete Account")
  - **Dialog Description**: Lines 29-30

### ConfirmDialog Component
- **File**: [src/components/ui/ConfirmDialog.tsx](src/components/ui/ConfirmDialog.tsx)
  - **Component Definition**: Lines 1-60 (full component)
  - **Props Interface**: Lines 5-11
  - **Usage in Accounts**: Referenced at line 372-373

---

## 2. BANKCARD COMPONENT WITH FLIP ANIMATION

### BankCard Component
- **File**: [src/components/ui/BankCard.tsx](src/components/ui/BankCard.tsx)
  - **Component Definition**: Line 20
  - **Props Interface**: Lines 4-11
  - **Flip Card Structure**: Lines 26-148 (entire component)
  - **Front Side**: Lines 30-90
  - **Key Features**:
    - Gradient background: `'linear-gradient(135deg, #0a1628, #1e3a6e, #2563eb)'`
    - Account name and institution display
    - Last 4 digits with copy functionality

### Flip Animation Styling
- **File**: [src/index.css](src/index.css)
  - **Animation Section**: Line 77 ("/* Bank card flip animation */")
  - CSS classes: `.flip-card`, `.flip-card-inner`, `.flip-card-front`, `.flip-card-back`

### Animation Configuration
- **File**: [src/utils/animations.ts](src/utils/animations.ts) (referenced in multiple components)

### BankCard Usage
- **File**: [src/pages/Accounts.tsx](src/pages/Accounts.tsx)
  - **Import**: Line 6
  - **Usage**: Line 196 (rendered within Account list)

---

## 3. ACCOUNT ADD/EDIT FORM

### Account Form Components
- **File**: [src/pages/Accounts.tsx](src/pages/Accounts.tsx)
  - **Form State**: Lines 33-39 (interface `AccountForm` at line 22)
  - **Form Submission**: Lines 60-84 (handleSubmit function)
  - **Form Validation**: Lines 62-66 (using AccountSchema from security.ts)
  - **Form HTML**: Lines 257-348
    - **Field 1 - Account Name**: Lines 267-278
    - **Field 2 - Type (Select)**: Lines 290-301
    - **Field 3 - Currency (Select)**: Lines 302-313
    - **Field 4 - Initial Balance**: Lines 314-329
    - **Submit Button**: Line 347

### Form State Type
```tsx
interface AccountForm {
  name: string
  type: AccountType
  currency: CurrencyCode
  initialBalance: string
}
```

---

## 4. FORMS FOR EXPENSES, INCOME, TRANSFERS, DEBTS, BUDGETS

### Expenses Form
- **File**: [src/pages/Expenses.tsx](src/pages/Expenses.tsx)
  - **Form State Type**: Line 17 (`ExpenseFormState`)
  - **Form Data State**: Lines 41-50 (useState initialization)
  - **Modal Opening**: Line 220
  - **Modal Component**: Lines 360-401
  - **Form Fields**:
    - Amount: Line 388 (input type="number")
    - Date: Line 395 (input type="date")
    - Category: Lines 401-413 (select dropdown)
    - Account: Lines 414-426 (select dropdown)
    - Currency: Lines 427-439 (select dropdown)
    - Description: Lines 440-448 (textarea)

### Income Form
- **File**: [src/pages/Income.tsx](src/pages/Income.tsx)
  - **Form State Type**: Line 17 (`IncomeFormState`)
  - **Form Data State**: Lines 41-48
  - **Modal Component**: Lines 360-476
  - **Form Handler**: Line 107 (`handleChange` function)
  - **Form Fields**:
    - Amount, Date, Account, Category, Currency, Description (similar to Expenses)

### Transfers Form
- **File**: [src/pages/Transfers.tsx](src/pages/Transfers.tsx)
  - **Form State Type**: Line 19 (`TransferForm`)
  - **Form Data State**: Lines 26-34
  - **Modal Component**: Line 212
  - **Form Handler**: Lines 57-86 (handleSubmit)
  - **Key Fields**:
    - From Account: Line 167
    - To Account: Line 185
    - Amount: Line 145
    - Transfer Date: Line 176
    - Exchange Rate: Line 195 (for currency conversion)

### Debts Form
- **File**: [src/pages/Debts.tsx](src/pages/Debts.tsx)
  - **Form State Type**: Line 21 (`DebtForm`)
  - **Form Data State**: Lines 37-45
  - **Modal Component**: Line 398
  - **Form Handler**: Lines 74-102 (handleSubmit)
  - **Form Fields**:
    - Person Name, Amount, Currency, Due Date, Type (DEBT/RECEIVABLE), Description
  - **Repay Modal**: Line 454 (repayment functionality)

### Budget Form
- **File**: [src/pages/Budget.tsx](src/pages/Budget.tsx)
  - **Goal Input State**: Line 32
  - **Category Selection**: Line 34
  - **Monthly Goal Form**: Lines 394-419
    - Input: Line 394 (budget amount)
    - Currency Select: Line 403
    - Save Button: Line 411
  - **Category Limit Form**: Lines 433-488
    - Category Select: Lines 437-449
    - Limit Input: Lines 460-475
    - Submit Button: Line 476

---

## 5. FILES THAT CALL API ENDPOINTS

### API Layer Files

#### Accounts API
- **File**: [src/api/accountsApi.ts](src/api/accountsApi.ts)
  - `getAll()`: Line 3
  - `create()`: Line 4
  - `update()`: Line 5
  - `delete()`: Line 6

#### Expenses API
- **File**: [src/api/expensesApi.ts](src/api/expensesApi.ts)
  - `getAll()`: Lines 11-12
  - `create()`: Line 13
  - `update()`: Line 14
  - `delete()`: Line 15

#### Income API
- **File**: [src/api/incomeApi.ts](src/api/incomeApi.ts)
  - Endpoints for income CRUD operations

#### Transfers API
- **File**: [src/api/transfersApi.ts](src/api/transfersApi.ts)
  - `getAll()`: Line 16
  - `create()`: Line 25
  - `delete()`: Line 27

#### Debts API
- **File**: [src/api/debtsApi.ts](src/api/debtsApi.ts)
  - `getAll()`: Line 17
  - `create()`: Line 26
  - `repay()`: Special endpoint for debt repayment

#### Budget API
- **File**: [src/api/budgetApi.ts](src/api/budgetApi.ts)
  - `get()`: Line 47
  - `set()`: Line 108
  - `setCategory()`: Line 138

#### Stats API
- **File**: [src/api/statsApi.js](src/api/statsApi.js)
  - Summary, monthly expenses, income vs expense, expenses by category

### Service Layer Files

#### Categories Service
- **File**: [src/services/categories.service.ts](src/services/categories.service.ts)
  - `getAll()`: Line 4
  - `getByType()`: Line 6
  - `create()`: Line 8

#### Analytics Service
- **File**: [src/services/analytics.service.ts](src/services/analytics.service.ts)
  - Multiple analytics endpoints for dashboard and reports

#### Income Service
- **File**: [src/services/income.service.ts](src/services/income.service.ts)
  - `getAll()`: Line 19
  - `create()`: Line 28
  - `update()`: Line 30
  - `delete()`: Line 32

#### Auth Service
- **File**: [src/services/auth.service.ts](src/services/auth.service.ts)
  - `login()`: Line 5
  - `register()`: Line 6

### Page Components with API Calls

#### Accounts Page
- **File**: [src/pages/Accounts.tsx](src/pages/Accounts.tsx)
  - POST: Line 75 (`api.post('/api/accounts', ...)`)
  - DELETE: Line 93 (`api.delete('/api/accounts/${confirmId}')`)
  - Uses `refreshAccounts()` store method

#### Expenses Page
- **File**: [src/pages/Expenses.tsx](src/pages/Expenses.tsx)
  - GET: Line 67 (`expensesApi.getAll()`)
  - POST: Line 127 (`expensesApi.create()`)
  - Uses categories service at line 52

#### Income Page
- **File**: [src/pages/Income.tsx](src/pages/Income.tsx)
  - GET: Line 67 (`incomeApi.getAll()`)
  - POST: Line 127 (`incomeApi.create()`)
  - Categories: Line 52 (`categoriesService.getByType('INCOME')`)

#### Transfers Page
- **File**: [src/pages/Transfers.tsx](src/pages/Transfers.tsx)
  - GET: Line 40 (`transfersApi.getAll()`)
  - POST: Line 70 (`transfersApi.create()`)

#### Debts Page
- **File**: [src/pages/Debts.tsx](src/pages/Debts.tsx)
  - GET: Line 50 (`debtsApi.getAll()`)
  - POST: Line 85 (`debtsApi.create()`)
  - DELETE: Line 108 (`debtsApi.delete()`)
  - PATCH: Line 127 (`debtsApi.repay()`)

#### Budget Page
- **File**: [src/pages/Budget.tsx](src/pages/Budget.tsx)
  - GET: Lines 47-49 (budget, stats, categories)
  - POST: Line 108 (`budgetApi.set()`)
  - POST: Line 138 (`budgetApi.setCategory()`)

#### Statistics Page
- **File**: [src/pages/Statistics.tsx](src/pages/Statistics.tsx)
  - GET: Lines 72-75 (monthly expenses, income vs expense, categories, summary)

#### Dashboard Page
- **File**: [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx)
  - Multiple API calls for dashboard data

#### Calendar View
- **File**: [src/pages/CalendarView.tsx](src/pages/CalendarView.tsx)
  - GET: Line 32 (Promise.allSettled for expenses and income)

---

## 6. FILES WITH CONSOLE.LOG, TODO, OR FIXME COMMENTS

### Console.log Statements
- **File**: [src/store/auth.store.ts](src/store/auth.store.ts)
  - Line 56: `console.log('🚀 [Auth] Initiating login request')`
  - Line 57: `console.log('🔗 [Auth] Full URL:', fullUrl)`
  - Line 58: `console.log('📦 [Auth] Payload:', { email, password: '***' })`

### Documentation Files with TODO/FIXME
- **File**: [QUICK_START.md](QUICK_START.md)
  - Line 183: `console.log(result.error.issues[0].message)`

- **File**: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
  - Line 226: `console.log(``100 USD = ${result} EUR``)`

- **File**: [CORS_SETUP.md](CORS_SETUP.md)
  - Lines 128-129: Console logging for debugging CORS headers

---

## 7. NAVBAR/SIDEBAR COMPONENTS

### Sidebar Component
- **File**: [src/components/Layout/Sidebar.tsx](src/components/Layout/Sidebar.tsx)
  - **Component Definition**: Line 40
  - **Navigation Items**: Lines 25-33 (NAV_ITEMS array)
    - Dashboard, Accounts, Expenses, Income, Transfers, Debts, Budget, Statistics, Calendar
  - **Main Sections**: 
    - MAIN group: Dashboard, Accounts, Expenses, Income, Transfers
    - MANAGE group: Debts, Budget, Statistics, Calendar
  - **User Profile Section**: Lines 42-52 (user initials)
  - **Logout Handler**: Lines 54-56
  - **Styling**: Collapsible with width: `collapsed ? 64 : 240` (Line 57)

### Bottom Navigation (Mobile)
- **File**: [src/components/Layout/BottomNav.tsx](src/components/Layout/BottomNav.tsx)
  - **Navigation Items**: Lines 25-35 (mobile-optimized)
  - **Show More Menu**: Line 21 (state for additional items)
  - **Mobile-specific routing**: Simplified menu

### AppShell Layout
- **File**: [src/components/Layout/AppShell.tsx](src/components/Layout/AppShell.tsx)
  - **Main Container**: Lines 8-53
  - **Responsive Layout**: Uses Sidebar for desktop, BottomNav for mobile
  - **Mobile Header**: Lines 24-47 (sticky top navigation)
  - **Notification Bell**: Line 31 (placeholder for notifications)
  - **Main Content Area**: Uses Outlet for page routing

### Layout Directory
- **Path**: [src/components/Layout/](src/components/Layout/)
  - Files: Sidebar.tsx, AppShell.tsx, BottomNav.tsx, ModernDashboard.tsx

---

## 8. MODAL/DIALOG COMPONENTS

### Modal Component
- **File**: [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx)
  - **Component Definition**: Line 16
  - **Props Interface**: Lines 7-12
  - **Mobile Responsiveness**: Lines 17-42
  - **Key Features**:
    - createPortal rendering for proper stacking
    - Escape key handling (Lines 19-24)
    - Body overflow management (Lines 27-31)
    - Animation variants: isMobile vs desktop (Lines 44-50)
  - **Animation Variants**: Uses `modalVariants` from utils/animations.ts
  - **Close Button**: Line 54 (X icon)
  - **Title/Subtitle**: Lines 61-62
  - **Footer**: Line 65 (optional)

### Confirm Dialog Component
- **File**: [src/components/ui/ConfirmDialog.tsx](src/components/ui/ConfirmDialog.tsx)
  - **Component Definition**: Line 16
  - **Props Interface**: Lines 5-11
  - **Icon**: AlertTriangle with red background (Lines 28-36)
  - **Dialog Actions**: Confirm/Cancel buttons (Lines 40-57)
  - **Usage**: Delete confirmations, destructive actions

### Alert Dialog Components
- **File**: [src/components/ui/alert-dialog.tsx](src/components/ui/alert-dialog.tsx) (Radix UI)
  - **File**: [src/components/ui/alert-dialog-icon.tsx](src/components/ui/alert-dialog-icon.tsx)
    - Account deletion dialog example (Line 26)
  - **File**: [src/components/ui/alert-dialog-demo.tsx](src/components/ui/alert-dialog-demo.tsx)

### Modal Usage Across Pages

#### Income Page
- **File**: [src/pages/Income.tsx](src/pages/Income.tsx)
  - **Modal State**: Line 38 (`showModal`)
  - **Modal Component**: Lines 360-476

#### Expenses Page
- **File**: [src/pages/Expenses.tsx](src/pages/Expenses.tsx)
  - **Modal State**: Line 38 (`showModal`)
  - **Modal Component**: Lines 358-477

#### Transfers Page
- **File**: [src/pages/Transfers.tsx](src/pages/Transfers.tsx)
  - **Modal State**: Line 27 (`modalOpen`)
  - **Modal Component**: Line 212

#### Debts Page
- **File**: [src/pages/Debts.tsx](src/pages/Debts.tsx)
  - **Modal State**: Line 34 (`modalOpen`)
  - **Repay Modal State**: Line 35 (`repayModal`)
  - **Modal Components**: Lines 398-518, 520-580

#### Accounts Page
- **File**: [src/pages/Accounts.tsx](src/pages/Accounts.tsx)
  - **Modal State**: Line 31 (`modalOpen`)
  - **Modal Component**: Lines 240-348

#### Budget Page
- **File**: [src/pages/Budget.tsx](src/pages/Budget.tsx)
  - Uses inline forms instead of modals for budget configuration

---

## 9. NOTIFICATION-RELATED CODE

### Toast Notification Service
- **Package**: `react-hot-toast` (imported in multiple pages)
  - Configuration: [package.json](package.json) Line 41

### Notification Service
- **File**: [src/services/notifications.service.ts](src/services/notifications.service.ts)
  - **API Endpoint**: '/api/notifications'
  - **Line 3**: Service definition

### Toast Usage in Pages

#### Accounts Page
- **File**: [src/pages/Accounts.tsx](src/pages/Accounts.tsx)
  - Import: Line 3 (`import toast from 'react-hot-toast'`)
  - Success: Line 94 (`toast.success('Account deleted')`)
  - Success: Line 69 (`toast.success('Account created')`)
  - Error: Lines 72, 98

#### Expenses Page
- **File**: [src/pages/Expenses.tsx](src/pages/Expenses.tsx)
  - Import: Line 5
  - Success: Line 135 (`toast.success('Expense added')`)
  - Error: Lines 77, 123, 150

#### Income Page
- **File**: [src/pages/Income.tsx](src/pages/Income.tsx)
  - Import: Line 5
  - Success: Line 135 (`toast.success('Income added')`)
  - Error: Lines 77, 123, 148

#### Transfers Page
- **File**: [src/pages/Transfers.tsx](src/pages/Transfers.tsx)
  - Import: Line 5
  - Success: Line 78 (`toast.success('Transfer created')`)
  - Error: Lines 49, 61, 65, 91

#### Debts Page
- **File**: [src/pages/Debts.tsx](src/pages/Debts.tsx)
  - Import: Line 5
  - Success: Lines 94, 109, 131
  - Error: Lines 60, 81, 100, 114, 122, 136

#### Budget Page
- **File**: [src/pages/Budget.tsx](src/pages/Budget.tsx)
  - Import: Line 2
  - Success: Lines 115, 146
  - Error: Lines 90, 103, 121, 128, 133, 154

### Notification UI Components
- **Toaster Configuration**: Setup in main.tsx/App.tsx
- **Toast Positioning**: Typically top-right or center
- **Custom Messages**: 
  - Success messages for CRUD operations
  - Error messages for validation and API failures
  - Informational messages for user guidance

### Empty State Component (fallback when no data)
- **File**: [src/components/ui/EmptyState.tsx](src/components/ui/EmptyState.tsx)
  - **Lines**: 1-43 (full component)
  - **Props**: icon, title, description, actionLabel, onAction
  - **Used in**: All main pages (Dashboard, Expenses, Income, Transfers, Debts, Budget, Statistics)

### Notification Bell (Dashboard Header)
- **File**: [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx)
  - **Line 158**: Comment "/* Notification bell */"
  - **Implemented in**: AppShell for mobile header

---

## SUMMARY TABLE

| Category | File Path | Key Lines | Count |
|----------|-----------|-----------|-------|
| Account Deletion | src/pages/Accounts.tsx | 90-100, 372-373, 93-94 | 3 |
| BankCard Flip | src/components/ui/BankCard.tsx | 1-148 | 1 |
| Account Form | src/pages/Accounts.tsx | 22-39, 60-84, 257-348 | 1 |
| Expense Form | src/pages/Expenses.tsx | 17-50, 358-477 | 1 |
| Income Form | src/pages/Income.tsx | 17-48, 360-476 | 1 |
| Transfer Form | src/pages/Transfers.tsx | 19-34, 57-86 | 1 |
| Debt Form | src/pages/Debts.tsx | 21-45, 74-102 | 1 |
| Budget Form | src/pages/Budget.tsx | 32-34, 394-488 | 1 |
| API Endpoints | src/api/*.ts | Various | 16 files |
| Services | src/services/*.ts | Various | 8 files |
| Console.log | src/store/auth.store.ts | 56-58 | 3 statements |
| Sidebar | src/components/Layout/Sidebar.tsx | 40, 25-33 | 1 |
| Modal | src/components/ui/Modal.tsx | 16, 7-12 | 1 |
| ConfirmDialog | src/components/ui/ConfirmDialog.tsx | 16, 5-11 | 1 |
| Toast Notifications | Used in all pages | Various | 8+ pages |
| Empty State | src/components/ui/EmptyState.tsx | 1-43 | 1 |

