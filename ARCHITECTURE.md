# System Architecture & Design Principles

## 🏗️ Architecture Overview

This application follows a clean, layered architecture pattern with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                    │
│  ┌──────────────────────────────────────────┐   │
│  │  Components & Pages                      │   │
│  │  ┌────────────┐  ┌─────────────────┐   │   │
│  │  │  Customer  │  │  Admin          │   │   │
│  │  │  Interface │  │  Interface      │   │   │
│  │  └────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────┘   │
│              ↓ HTTP/REST API ↓                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           Backend (Node.js/Express)             │
│  ┌──────────────────────────────────────────┐   │
│  │  Routes → Controllers → Services         │   │
│  │            ↓                              │   │
│  │       Prisma ORM                          │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Database (SQLite/PostgreSQL)           │
└─────────────────────────────────────────────────┘
```

## 🎯 Core Design Principles

### 1. Credit Balance Integrity

**Problem**: How to ensure credit balances are always accurate and consistent?

**Solution**: Dual-tracking system
- **Denormalized Balance**: `User.creditBalance` field for O(1) reads
- **Transaction Ledger**: `CreditTransaction` table as source of truth
- **Validation**: Balance always equals sum of transactions
- **Atomicity**: All updates wrapped in database transactions

```typescript
// Example: Atomic credit adjustment
await prisma.$transaction(async (tx) => {
  // 1. Create transaction record
  await tx.creditTransaction.create({ ... });
  
  // 2. Update user balance
  await tx.user.update({ 
    data: { creditBalance: newBalance } 
  });
});
```

### 2. Transactional Safety

**Critical Operations Protected by DB Transactions:**

#### Purchase Flow
```typescript
await prisma.$transaction([
  createOrder(),
  createOrderItems(),
  createCreditTransaction(),
  updateUserBalance(),
  updateProductStock(),
]);
```

All steps succeed together or all fail together - no partial states.

#### Credit Adjustment
```typescript
await prisma.$transaction([
  createCreditTransaction(),
  updateUserBalance(),
]);
```

### 3. Audit Trail

**Every credit change is tracked:**
- Who made the change (createdByUserId)
- When it happened (createdAt)
- Why it happened (reason - mandatory)
- What type (REWARD, PURCHASE, ADJUSTMENT)
- Related order (if applicable)

**Benefits:**
- Complete transparency
- Debug issues easily
- Generate reports
- Regulatory compliance ready

### 4. Role-Based Access Control (RBAC)

**Two roles with distinct capabilities:**

| Feature | Customer | Admin |
|---------|----------|-------|
| Browse products | ✅ | ✅ |
| Redeem products | ✅ | ❌ |
| View own orders | ✅ | ❌ |
| View own credits | ✅ | ❌ |
| Manage products | ❌ | ✅ |
| View all orders | ❌ | ✅ |
| Adjust credits | ❌ | ✅ |
| View all customers | ❌ | ✅ |

**Implementation:**
- JWT tokens with role claim
- Middleware-based route protection
- Frontend route guards
- Backend permission checks

### 5. Input Validation

**Multi-layer validation:**

1. **Frontend**: Immediate user feedback
2. **express-validator**: Schema validation
3. **Service layer**: Business logic validation
4. **Prisma**: Database constraints

**Example validation flow:**
```
User Input → Frontend Validation → API Validation → 
Business Logic Check → Database Constraints
```

### 6. Error Handling

**Structured error hierarchy:**

```typescript
AppError (base)
├── ValidationError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
└── InsufficientCreditsError (400)
```

**Benefits:**
- Consistent error responses
- Appropriate HTTP status codes
- User-friendly messages
- Operational vs programming errors

## 📊 Data Model Design

### User
- **Purpose**: Store user accounts and credit balance
- **Key Fields**: 
  - `creditBalance`: Cached total (performance)
  - `role`: RBAC implementation
- **Indexes**: email, role

### Product
- **Purpose**: Items available for redemption
- **Key Fields**:
  - `stock`: null = unlimited, number = limited
  - `isActive`: Soft delete pattern
  - `priceInCredits`: Always in credits, never money
- **Indexes**: isActive

### Order
- **Purpose**: Record of completed purchases
- **Key Fields**:
  - `totalCredits`: Denormalized for reporting
  - `status`: Future-proof for cancellations
- **Indexes**: customerId, createdAt

### OrderItem
- **Purpose**: Individual products in an order
- **Key Fields**:
  - `priceInCreditsAtPurchase`: Historical pricing
  - `quantity`: Support bulk purchases
- **Indexes**: orderId, productId

### CreditTransaction
- **Purpose**: Immutable audit log
- **Key Fields**:
  - `amount`: Positive = added, Negative = spent
  - `type`: Categorize transactions
  - `reason`: Mandatory explanation
  - `createdByUserId`: Accountability
  - `relatedOrderId`: Link to purchases
- **Indexes**: customerId, type, createdAt

## 🔄 Key Workflows

### Purchase Workflow

```
1. User clicks "Redeem"
   ↓
2. Frontend validates:
   - User has enough credits
   - Product is active
   - Stock available
   ↓
3. API call to POST /api/orders
   ↓
4. Backend re-validates everything
   ↓
5. Database transaction:
   - Create Order
   - Create OrderItem(s)
   - Create CreditTransaction (negative)
   - Update User.creditBalance
   - Update Product.stock (if applicable)
   ↓
6. Return order details
   ↓
7. Frontend updates UI:
   - Show success message
   - Refresh credit balance
   - Redirect to orders page
```

### Credit Adjustment Workflow

```
1. Admin enters adjustment
   - Amount (+ or -)
   - Type (REWARD/ADJUSTMENT)
   - Reason (required)
   ↓
2. POST /api/credits/adjust
   ↓
3. Validate:
   - Amount != 0
   - Reason not empty
   - Customer exists
   - Won't create negative balance
   ↓
4. Database transaction:
   - Create CreditTransaction
   - Update User.creditBalance
   ↓
5. Return updated customer data
   ↓
6. Frontend refreshes customer profile
```

## 🔐 Security Considerations

### Authentication
- **JWT tokens** stored in localStorage
- **Tokens include**: userId, role
- **Expiration**: 7 days (configurable)
- **Refresh**: Manual re-login required

### Authorization
- **Middleware checks** on all protected routes
- **Role verification** for admin endpoints
- **Resource ownership** validation (users can only see own data)

### Data Security
- **Password hashing**: bcrypt with salt
- **SQL injection**: Prevented by Prisma ORM
- **XSS protection**: React auto-escapes content
- **CORS**: Configured for specific origin

### Business Logic Security
- **Never trust frontend**: All checks repeated server-side
- **Atomic operations**: No race conditions
- **Validation at every layer**
- **Immutable ledger**: Transactions never modified

## 🎨 Frontend Architecture

### State Management
- **Auth Context**: Global user state
- **Local State**: Component-specific data
- **API Calls**: On-demand data fetching

### Component Structure
```
App
├── AuthProvider (context)
├── Navbar (always visible)
└── Routes
    ├── Public (Home, Login, Register)
    ├── Customer (Products, Orders, Credits)
    └── Admin (Dashboard, Management)
```

### API Layer
- **Centralized axios instance** with interceptors
- **Automatic token injection**
- **Error handling**
- **Type-safe responses**

## 🧪 Testing Strategy

### Unit Tests
- **Service layer**: Business logic
- **Critical paths**: Credit adjustments, purchases
- **Edge cases**: Insufficient credits, out of stock

### Integration Tests
- **Database transactions**: Verify atomicity
- **Credit balance integrity**: Sum validation
- **Complete workflows**: End-to-end flows

### Manual Testing
- **Role-based access**: Try unauthorized actions
- **UI flows**: Complete user journeys
- **Error scenarios**: Network failures, validation errors

## 🚀 Deployment Considerations

### Environment Variables
- **Never commit** `.env` files
- **Different configs** for dev/staging/prod
- **Secrets management** for production

### Database Migrations
- **Version controlled** via Prisma
- **Forward-only** migration strategy
- **Test migrations** before production

### Monitoring
- **Server logs**: Track errors
- **Transaction logs**: Audit credit changes
- **Performance**: Monitor slow queries

## 📈 Scalability

### Current Architecture
- **Good for**: 1-10k users
- **Database**: SQLite adequate for development
- **Single server**: Suitable for MVP

### Future Scaling
1. **Switch to PostgreSQL**: Production database
2. **Add Redis**: Session/cache layer
3. **Horizontal scaling**: Multiple backend instances
4. **CDN**: Static asset delivery
5. **Queue system**: Async operations (emails, reports)

## 🔧 Extensibility

The architecture supports easy addition of:
- **Categories**: Product categorization
- **Vouchers**: Promotional codes
- **Notifications**: Email/push notifications
- **Analytics**: Usage tracking
- **Reports**: Export functionality
- **Webhooks**: External integrations

## 📝 Code Quality

### TypeScript Benefits
- **Type safety**: Catch errors at compile time
- **IDE support**: Better autocomplete
- **Self-documenting**: Types as documentation
- **Refactoring**: Safe code changes

### Code Organization
- **Single Responsibility**: Each file has one purpose
- **Dependency Injection**: Easy testing
- **Layer Separation**: Clear boundaries
- **Naming Conventions**: Consistent and clear

---

This architecture prioritizes **correctness**, **clarity**, and **maintainability** over premature optimization, making it ideal for a production-ready system that can grow with your needs.
