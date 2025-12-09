# API Quick Reference

## Base URL
- Development: `http://localhost:3001/api`

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 🛍️ Product Endpoints

### Get All Products
```http
GET /products?activeOnly=true
```

### Get Product by ID
```http
GET /products/:id
```

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "priceInCredits": 100,
  "stock": 10,
  "imageUrl": "https://...",
  "isActive": true
}
```

### Update Product (Admin)
```http
PUT /products/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "priceInCredits": 150
}
```

### Toggle Product Active (Admin)
```http
PATCH /products/:id/toggle-active
Authorization: Bearer <admin-token>
```

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer <admin-token>
```

---

## 📦 Order Endpoints

### Create Order (Purchase)
```http
POST /orders
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 1
}
```

### Get My Orders
```http
GET /orders/my-orders
Authorization: Bearer <customer-token>
```

### Get All Orders (Admin)
```http
GET /orders?limit=50&offset=0
Authorization: Bearer <admin-token>
```

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

---

## 💰 Credit Endpoints

### Adjust Credits (Admin)
```http
POST /credits/adjust
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "customerId": "customer-id",
  "amount": 500,
  "type": "REWARD",
  "reason": "Completed survey"
}
```
Note: `amount` can be negative for deductions. `type` must be "REWARD" or "ADJUSTMENT".

### Get My Credit History
```http
GET /credits/my-history
Authorization: Bearer <customer-token>
```

### Get Customer Credit History (Admin)
```http
GET /credits/customer/:customerId/history
Authorization: Bearer <admin-token>
```

### Get All Transactions (Admin)
```http
GET /credits/transactions?customerId=&type=&limit=50&offset=0
Authorization: Bearer <admin-token>
```

### Get Credit Statistics (Admin)
```http
GET /credits/statistics
Authorization: Bearer <admin-token>
```

---

## 👥 User Endpoints

### Get All Customers (Admin)
```http
GET /users/customers
Authorization: Bearer <admin-token>
```

### Get Customer by ID (Admin)
```http
GET /users/customers/:id
Authorization: Bearer <admin-token>
```

### Get Customer Profile (Admin)
```http
GET /users/customers/:id/profile
Authorization: Bearer <admin-token>
```

---

## 📊 Dashboard Endpoint

### Get Dashboard Stats (Admin)
```http
GET /dashboard
Authorization: Bearer <admin-token>
```

Returns:
- Total customers
- Total credits issued
- Total credits spent
- Total orders
- Recent orders

---

## 🔄 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 📝 Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (wrong role)
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"customer123"}'
```

### Get Products Example
```bash
curl http://localhost:3001/api/products
```

### Create Order Example
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"PRODUCT_ID","quantity":1}'
```

---

## 🔍 Query Parameters

### Products
- `activeOnly` (boolean) - Filter active products only

### Orders (Admin)
- `limit` (number) - Number of results (default: 50)
- `offset` (number) - Pagination offset (default: 0)

### Transactions (Admin)
- `customerId` (string) - Filter by customer
- `type` (string) - Filter by type (REWARD, PURCHASE, ADJUSTMENT)
- `limit` (number) - Number of results (default: 50)
- `offset` (number) - Pagination offset (default: 0)

---

## 💡 Tips

1. **Get Token**: Login first, extract `token` from response
2. **Admin vs Customer**: Some endpoints require specific roles
3. **Validation**: All inputs are validated server-side
4. **Transactions**: Credit operations are atomic
5. **Idempotency**: Re-trying failed requests is safe for GET but not POST

---

For complete examples and frontend integration, see the code in `frontend/src/api/`.
