# ✅ Pre-Launch Checklist

Use this checklist before deploying to production.

## 🔐 Security

- [ ] Change `JWT_SECRET` in `.env` to a strong random string
- [ ] Update `CORS_ORIGIN` to your production frontend URL
- [ ] Remove or secure test accounts from database
- [ ] Enable HTTPS on both frontend and backend
- [ ] Review and update CORS settings
- [ ] Implement rate limiting on API endpoints
- [ ] Add request logging
- [ ] Set up error monitoring (e.g., Sentry)

## 🗄️ Database

- [ ] Switch from SQLite to PostgreSQL
- [ ] Update `DATABASE_URL` for production database
- [ ] Run migrations on production database
- [ ] Set up database backups
- [ ] Verify indexes are in place
- [ ] Test database connection pooling
- [ ] Review and optimize slow queries

## ⚙️ Environment Configuration

- [ ] Create production `.env` file
- [ ] Set `NODE_ENV=production`
- [ ] Configure production API URL in frontend
- [ ] Set up environment variables on hosting platform
- [ ] Verify all secrets are in environment variables (not code)

## 🧪 Testing

- [ ] Run backend tests: `cd backend && npm test`
- [ ] Test all user workflows manually:
  - [ ] Customer registration
  - [ ] Customer login
  - [ ] Browse products
  - [ ] Redeem product
  - [ ] View order history
  - [ ] View credit history
  - [ ] Admin login
  - [ ] Create product
  - [ ] Edit product
  - [ ] Adjust customer credits
  - [ ] View dashboard
- [ ] Test error scenarios:
  - [ ] Insufficient credits
  - [ ] Out of stock
  - [ ] Invalid login
  - [ ] Unauthorized access
- [ ] Test on different browsers
- [ ] Test on mobile devices

## 📦 Build & Deployment

- [ ] Build backend: `cd backend && npm run build`
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test production builds locally
- [ ] Set up CI/CD pipeline (optional)
- [ ] Configure hosting platform
- [ ] Set up domain and SSL certificate
- [ ] Configure DNS records

## 📊 Monitoring & Logging

- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Enable access logs
- [ ] Set up alerts for errors
- [ ] Create admin notification system

## 📝 Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures
- [ ] Create admin user guide
- [ ] Create customer user guide

## 🔄 Data Management

- [ ] Plan data retention policy
- [ ] Set up database backup schedule
- [ ] Test database restore procedure
- [ ] Plan for data exports
- [ ] Consider GDPR compliance (if applicable)

## 🚀 Performance

- [ ] Enable production build optimizations
- [ ] Configure CDN for static assets
- [ ] Set up caching strategy
- [ ] Optimize images
- [ ] Test load time
- [ ] Consider adding Redis for caching (optional)

## 📧 Communication

- [ ] Set up email service (for future notifications)
- [ ] Configure email templates
- [ ] Test email delivery

## 🔍 Post-Launch

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan feature roadmap
- [ ] Schedule regular maintenance

## 🛠️ Maintenance Plan

- [ ] Schedule for security updates
- [ ] Plan for database maintenance
- [ ] Set up backup verification
- [ ] Create incident response plan
- [ ] Document escalation procedures

---

## Quick Production Setup Commands

### Backend Deployment
```bash
# Build
npm run build

# Set environment variables on your platform
# Then start
npm start
```

### Frontend Deployment
```bash
# Build
npm run build

# Deploy the 'dist' folder to your static host
```

### Database Migration (PostgreSQL)
```bash
# Update DATABASE_URL in .env
# Then run
npm run prisma:migrate

# DO NOT run seed in production
# Instead, create admin user manually
```

## Recommended Production Stack

- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, Heroku, or DigitalOcean
- **Database**: PostgreSQL on the same platform or separate service
- **Monitoring**: Sentry, LogRocket, or similar
- **Uptime**: UptimeRobot or Pingdom

---

**Remember**: Always test in a staging environment before deploying to production!
