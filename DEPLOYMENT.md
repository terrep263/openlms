# Vercel Deployment Guide

## Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables (for Production, Preview, and Development):

### Required Variables:

```env
DATABASE_URL=postgresql://your-neon-connection-string-here
JWT_SECRET=your-random-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### Optional (for Stripe features):

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 2: Initialize Database Schema

After setting environment variables, push the schema to your Neon database:

```bash
# Make sure you have the DATABASE_URL from Vercel/Neon
npx prisma db push
```

## Step 3: Seed Production Database

Run the seed script pointing to your production database:

```bash
# Option A: Use the DATABASE_URL from Vercel
DATABASE_URL="your-production-database-url" npm run db:seed

# Option B: Set in .env.local temporarily
# Update .env.local with production DATABASE_URL
npm run db:seed
```

## Step 4: Trigger Vercel Redeploy

1. Go to Vercel dashboard → **Deployments**
2. Click **Redeploy** (or push a commit to trigger new deployment)
3. Wait for deployment to complete

## Step 5: Test Your Live Site

### Access Points:

**Homepage:**
https://your-project.vercel.app/

**Admin Login:**
- URL: https://your-project.vercel.app/login
- Email: `admin@demo-school.com`
- Password: `admin123`
- Dashboard: https://your-project.vercel.app/t/demo-school/dashboard

**Student Login:**
- URL: https://your-project.vercel.app/login
- Email: `student@demo-school.com`
- Password: `student123`
- School: https://your-project.vercel.app/school/demo-school

**Public School Page:**
https://your-project.vercel.app/school/demo-school

## Troubleshooting

### If you get "Database connection error":

1. Check DATABASE_URL is correctly set in Vercel
2. Verify Neon database is active
3. Make sure you ran `npx prisma db push`

### If you get "Invalid credentials":

1. Verify you ran the seed script successfully
2. Check the database has data: `npx prisma studio`
3. Re-run seed: `npm run db:seed`

### If Stripe features don't work:

This is normal if you haven't set up Stripe keys. The app will function without Stripe, but:
- Payment processing won't work
- Stripe Connect won't work
- Billing portal won't work

Free courses and all admin features will work fine.

## Production Checklist

- [ ] DATABASE_URL set in Vercel
- [ ] JWT_SECRET set in Vercel (32+ random characters)
- [ ] NEXT_PUBLIC_APP_URL set to your Vercel domain
- [ ] Database schema pushed: `npx prisma db push`
- [ ] Database seeded: `npm run db:seed`
- [ ] Vercel redeployed with new env vars
- [ ] Can access homepage
- [ ] Can login as admin
- [ ] Can access dashboard

## Next Steps After Testing

Once you've verified the demo works:

1. **Create Your Real School:**
   - Go to /register
   - Create your actual school account
   - This will be your production admin

2. **Remove Demo Data (Optional):**
   ```bash
   # Connect to your database and delete demo tenant
   # Or keep it for testing
   ```

3. **Set Up Stripe:**
   - Get production API keys from Stripe
   - Update Vercel environment variables
   - Connect Stripe Connect in dashboard

4. **Customize:**
   - Upload your logo
   - Set your brand colors
   - Create your real courses

## Security Notes

⚠️ **Important:** The demo accounts use simple passwords (`admin123`, `student123`). For production:

1. Delete or change demo account passwords
2. Use strong passwords for real accounts
3. Keep your JWT_SECRET secure and random
4. Use environment-specific Stripe keys (test vs production)

## Quick Reference

**Demo School Slug:** `demo-school`

**Admin Dashboard:**
https://your-project.vercel.app/t/demo-school/dashboard

**Public School:**
https://your-project.vercel.app/school/demo-school

**API Health Check:**
https://your-project.vercel.app/api/login
(Should return 400 "email is required" - this means API is working)
