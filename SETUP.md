# 🚀 Quick Setup Guide

Follow these steps to get your Credit Webshop up and running!

## Step 1: Install Dependencies

```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..\frontend
npm install

# Return to root
cd ..
```

## Step 2: Set Up the Database

```powershell
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run seed

cd ..
```

You should see output confirming:
- ✅ Created admin user
- ✅ Created 3 customer users
- ✅ Created 8 products
- ✅ Created sample order

## Step 3: Start the Application

### Option A: Run both servers together (Recommended)
```powershell
# From the root directory
npm run dev
```

### Option B: Run servers separately
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (in a new terminal)
cd frontend
npm run dev
```

## Step 4: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/health

## Step 5: Login and Test

### Try the Admin Account
1. Go to http://localhost:5173/login
2. Login with:
   - Email: `admin@webshop.com`
   - Password: `admin123`
3. Explore the admin dashboard, manage products, view customers

### Try a Customer Account
1. Logout and login again with:
   - Email: `alice@example.com`
   - Password: `customer123`
2. Browse products
3. Redeem a product
4. Check your credit history

## 🎯 What to Try

### As Admin:
- ✅ View dashboard statistics
- ✅ Create a new product
- ✅ Adjust customer credits
- ✅ View all orders and transactions
- ✅ View customer profiles

### As Customer:
- ✅ Browse available products
- ✅ View product details
- ✅ Redeem a product with credits
- ✅ View your order history
- ✅ Check your credit transaction history

## 🔧 Troubleshooting

### "Port 3001 is already in use"
Change the port in `backend/.env`:
```
PORT=3002
```

### "Port 5173 is already in use"
The frontend will automatically try the next available port (5174, 5175, etc.)

### Database issues
If you encounter database problems:
```powershell
cd backend
Remove-Item dev.db, dev.db-journal -ErrorAction SilentlyContinue
npm run prisma:migrate
npm run seed
```

### "Cannot find module" errors
Make sure all dependencies are installed:
```powershell
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ..\frontend
npm install
```

## 📊 Sample Data

After seeding, you'll have:

**Admin:**
- Email: admin@webshop.com
- Password: admin123

**Customers:**
- alice@example.com (400 credits) - has made 1 purchase
- bob@example.com (1000 credits)
- charlie@example.com (250 credits)

**Products:**
- 8 different products ranging from 75-500 credits
- Mix of unlimited and limited stock items

## 🎨 Next Steps

1. **Customize Products**: Login as admin and add your own products
2. **Test Purchases**: Login as a customer and try redeeming products
3. **Credit Management**: Adjust customer credits as admin
4. **Explore API**: Check out the API documentation in README.md

## 💡 Tips

- Keep both terminal windows open to see backend and frontend logs
- The frontend auto-refreshes when you make changes
- Check the browser console for any errors
- Use the admin dashboard to monitor system activity

## 📝 Learn More

- See `README.md` for complete documentation
- Check `backend/src/routes/` for API endpoints
- Explore `frontend/src/pages/` for UI components

---

**Happy coding! 🎉**
