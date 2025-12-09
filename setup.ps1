# Credit Webshop - Complete Setup Script
# Run this script to set up the entire project

Write-Host "🚀 Starting Credit Webshop Setup..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Install root dependencies
Write-Host "📦 Step 1/5: Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Install backend dependencies
Write-Host "📦 Step 2/5: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Install frontend dependencies
Write-Host "📦 Step 3/5: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 4: Set up database
Write-Host "🗄️ Step 4/5: Setting up database..." -ForegroundColor Yellow
Set-Location ..\backend

Write-Host "  → Generating Prisma Client..."
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "  → Running database migrations..."
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    exit 1
}

Write-Host "  → Seeding database..."
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database setup complete" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Step 5: Done!
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Start the application:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Open your browser:" -ForegroundColor White
Write-Host "     Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "     Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Login with demo accounts:" -ForegroundColor White
Write-Host "     Admin:    admin@webshop.com / admin123" -ForegroundColor Cyan
Write-Host "     Customer: alice@example.com / customer123" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation available in:" -ForegroundColor White
Write-Host "   • README.md - Full documentation" -ForegroundColor Gray
Write-Host "   • SETUP.md - Setup guide" -ForegroundColor Gray
Write-Host "   • ARCHITECTURE.md - System design" -ForegroundColor Gray
Write-Host "   • PROJECT_SUMMARY.md - What's included" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Magenta
