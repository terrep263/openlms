# Testing Guide - OpenLMS

This guide will help you test the OpenLMS application locally with dummy data.

## Prerequisites

1. **Neon Postgres Database**
   - Create a free account at https://neon.tech
   - Create a new project
   - Copy the connection string

2. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Update `DATABASE_URL` with your Neon connection string

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Update `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/database"
JWT_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional for full testing:
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Test Accounts Created

After running the seed script, you'll have these test accounts:

### 🎓 Demo School (`demo-school`)

**Admin Account:**
- **Email:** `admin@demo-school.com`
- **Password:** `admin123`
- **Dashboard:** http://localhost:3000/t/demo-school/dashboard

**Student Account:**
- **Email:** `student@demo-school.com`
- **Password:** `student123`
- **School Page:** http://localhost:3000/school/demo-school

## Test Data Included

### Courses Created:

1. **Introduction to Web Development** (FREE, PUBLISHED)
   - Accessible to all learners
   - YouTube embed included
   - Student already enrolled

2. **Advanced React Patterns** (PAID, $49.99, PUBLISHED)
   - Requires payment to access
   - YouTube embed included

3. **Coming Soon: Full Stack Development** (DRAFT, PRIVATE)
   - Only visible to admin
   - Not published yet

## Testing Scenarios

### As Admin (`admin@demo-school.com`)

1. **Login**
   - Go to http://localhost:3000/login
   - Use admin credentials
   - Should redirect to dashboard

2. **Dashboard**
   - View metrics (1 learner, 3 courses, 1 enrollment)
   - See recent enrollments

3. **Course Management**
   - Go to Courses tab
   - View all 3 courses
   - Click "Edit" on any course
   - Create a new course

4. **Learner Management**
   - Go to Learners tab
   - View student account
   - Add new learner

5. **Reports**
   - View completion rates
   - See enrollment statistics

6. **Settings**
   - Connect Stripe (requires real Stripe account)
   - View payment settings

### As Student (`student@demo-school.com`)

1. **Login**
   - Go to http://localhost:3000/login
   - Use student credentials
   - Should redirect to school catalog

2. **Browse Courses**
   - Go to http://localhost:3000/school/demo-school
   - See 2 published courses (free and paid)
   - Draft course should NOT be visible

3. **Access Free Course**
   - Click on "Introduction to Web Development"
   - Should see course player with embedded video
   - Can mark course as complete

4. **View Paid Course**
   - Click on "Advanced React Patterns"
   - Should see purchase page with price
   - "Buy Course" button (requires Stripe setup to work)

## Reset Test Data

To reset and reseed the database:

```bash
# Clear all data
npx prisma db push --force-reset

# Reseed
npm run db:seed
```

## View Database

To view your database in Prisma Studio:

```bash
npx prisma studio
```

Opens at http://localhost:5555

## Common Issues

### "STRIPE_SECRET_KEY is not set"

**Solution:** Set a placeholder in `.env.local`:
```env
STRIPE_SECRET_KEY="sk_test_placeholder"
```

The app will work without Stripe, but payment features won't function.

### Can't connect to database

**Check:**
1. DATABASE_URL is correct
2. Neon database is running
3. IP is whitelisted in Neon (should be automatic)

### Seed script fails

**Try:**
```bash
npx prisma db push --force-reset
npm run db:seed
```

## Next Steps

Once you've tested locally:

1. **Deploy to Vercel**
   - Push to GitHub
   - Connect repo to Vercel
   - Add environment variables in Vercel dashboard

2. **Set Up Stripe**
   - Get test API keys from https://dashboard.stripe.com/test/apikeys
   - Add to environment variables
   - Test payment flow

3. **Connect Stripe Connect**
   - In admin dashboard, go to Settings → Payments
   - Click "Connect with Stripe"
   - Complete onboarding

## Production Deployment

When deploying to production:

1. Use production DATABASE_URL
2. Use production Stripe keys
3. Set NEXT_PUBLIC_APP_URL to your domain
4. Generate secure JWT_SECRET (32+ characters)
5. Set up Stripe webhook endpoint

## Support

For issues or questions, check:
- README.md for full documentation
- Prisma schema at `prisma/schema.prisma`
- API routes at `app/api/`

Happy testing! 🚀
