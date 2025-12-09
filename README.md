# Credit Webshop

A production-ready, full-stack web application where users can redeem products using credits instead of real money. Built with Node.js, TypeScript, Express, Prisma, React, and SQLite.

## 🎯 Features

### Core Functionality
- **Credit-Based System**: Everything is purchased with credits - no real money involved
- **User Roles**: Separate interfaces for customers and administrators
- **Credit Tracking**: Complete audit trail of all credit transactions
- **Product Management**: Admin interface for managing products and inventory
- **Order Management**: Track all purchases and redemptions
- **Atomic Transactions**: All credit operations are database-transaction-safe

### Customer Features
- Browse available products
- Redeem products using credits
- View credit balance in real-time
- View complete credit history with running balances
- View order history with details

### Admin Features
- Dashboard with key metrics
- Product management (CRUD operations)
- Customer management and credit adjustments
- View all orders and transactions
- Grant/adjust customer credits with reasons

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite (easily switchable to PostgreSQL)
- **Authentication**: JWT-based authentication
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with CSS variables

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Navigate to the project directory
cd webshop

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Set Up Backend

```bash
cd backend

# Copy environment variables
Copy-Item .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run seed
```

### 3. Start the Application

#### Option 1: Run both servers from root (recommended)
```bash
# From the root directory
npm run dev
```

#### Option 2: Run servers separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 👤 Demo Accounts

After seeding the database, use these credentials:

### Admin Account
- **Email**: admin@webshop.com
- **Password**: admin123

### Customer Accounts
- **Email**: alice@example.com | **Password**: customer123 | **Credits**: 400
- **Email**: bob@example.com | **Password**: customer123 | **Credits**: 1000
- **Email**: charlie@example.com | **Password**: customer123 | **Credits**: 250

## 📁 Project Structure

```
webshop/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Configuration
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Utilities
│   │   ├── index.ts               # Server entry point
│   │   └── seed.ts                # Database seeder
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                   # API client functions
│   │   ├── components/            # React components
│   │   ├── context/               # React context
│   │   ├── pages/                 # Page components
│   │   │   ├── admin/             # Admin pages
│   │   │   └── ...                # Customer pages
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   └── package.json
│
└── package.json                   # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `PATCH /api/products/:id/toggle-active` - Toggle active status (admin)

### Orders
- `POST /api/orders` - Create order (purchase)
- `GET /api/orders/my-orders` - Get customer's orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get order by ID

### Credits
- `POST /api/credits/adjust` - Adjust customer credits (admin)
- `GET /api/credits/my-history` - Get credit history
- `GET /api/credits/customer/:customerId/history` - Get customer history (admin)
- `GET /api/credits/transactions` - Get all transactions (admin)
- `GET /api/credits/statistics` - Get credit statistics (admin)

### Users
- `GET /api/users/customers` - Get all customers (admin)
- `GET /api/users/customers/:id` - Get customer by ID (admin)
- `GET /api/users/customers/:id/profile` - Get customer profile (admin)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics (admin)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation on all endpoints
- CORS configuration
- Database transaction safety for critical operations

## 💡 Key Design Decisions

### Credit Balance Integrity
The system maintains credit balance integrity through:
1. **Denormalized Balance**: `creditBalance` field on User for fast reads
2. **Transaction Ledger**: All changes tracked in `CreditTransaction`
3. **Atomic Updates**: Database transactions ensure consistency
4. **Validation**: Balance always matches sum of transactions

### Purchase Flow
Every purchase operation:
1. Validates user has sufficient credits
2. Checks product availability and stock
3. Creates order and order items
4. Creates negative credit transaction
5. Updates user balance
6. Updates product stock (if applicable)
7. All wrapped in a single database transaction

### Credit Adjustments
Admin credit adjustments require:
- Amount (positive or negative)
- Type (REWARD or ADJUSTMENT)
- Reason (mandatory explanation)
- Tracked with admin user ID

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Manual Testing Workflow
1. Login as admin
2. Create a new product
3. Adjust customer credits
4. Login as customer
5. Browse and redeem product
6. Verify credit balance updates
7. Check credit history shows transaction
8. Verify order appears in order history

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Switch to PostgreSQL
1. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

## 📊 Database Schema

### Core Models
- **User**: Customer and admin accounts with credit balance
- **Product**: Items available for redemption
- **Order**: Purchase records
- **OrderItem**: Individual items in an order
- **CreditTransaction**: Audit trail of all credit changes

### Relationships
- User → Orders (one-to-many)
- User → CreditTransactions (one-to-many)
- Order → OrderItems (one-to-many)
- Product → OrderItems (one-to-many)
- Order → CreditTransaction (one-to-one)

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Build: `npm run build`
3. Run migrations: `npm run prisma:migrate`
4. Start: `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Serve the `dist` folder with any static host

### Recommended Platforms
- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: PostgreSQL on the same platform as backend

## 📝 Future Enhancements

- [ ] Product categories and filtering
- [ ] Credit expiration dates
- [ ] Voucher/coupon system
- [ ] Email notifications
- [ ] Product images upload
- [ ] Advanced search and filtering
- [ ] Export reports (CSV/PDF)
- [ ] Multi-language support
- [ ] Dark mode theme

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT

## 🐛 Troubleshooting

### Port already in use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

### Database locked
- Close all connections
- Delete `backend/dev.db` and re-run migrations

### CORS errors
- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL

## 📞 Support

For issues or questions, please open an issue on GitHub.
