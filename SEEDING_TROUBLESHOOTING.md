# Database Seeding Troubleshooting Guide

## Common Error: "Failed to seed database"

If you see this error when trying to seed your database, follow these steps:

### 1. Check DATABASE_URL Environment Variable

The most common cause is that `DATABASE_URL` is not set in your Vercel environment variables.

**Fix:**
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add a new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon/Postgres connection string (looks like `postgresql://user:password@host/database?sslmode=require`)
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application (Settings > Deployments > click ⋯ on latest > Redeploy)

### 2. Verify Database Connection String Format

Your `DATABASE_URL` should look like:
```
postgresql://username:password@ep-xyz-abc.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Common issues:**
- Missing `?sslmode=require` at the end (required for Neon)
- Special characters in password not URL-encoded
- Wrong database name
- Expired or invalid credentials

### 3. Check Database Connection

Visit this endpoint to test your database connection:
```
https://your-project.vercel.app/api/setup/health
```

This will tell you if:
- DATABASE_URL is set
- Database connection is working
- Prisma client can connect

### 4. Check Setup Key

The seeding endpoint requires a setup key for security. By default it's `setup-demo-data`.

**If you set a custom SETUP_SECRET_KEY:**
1. Make sure you entered the same key in the setup page
2. Or check your Vercel environment variables for `SETUP_SECRET_KEY`

### 5. Prisma Client Not Generated

During deployment, Prisma must generate the database client.

**Fix:**
1. Check your `package.json` has:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate",
       "build": "prisma generate && next build"
     }
   }
   ```
2. Redeploy your application

### 6. Database Already Has Data

If the demo tenant (`demo-school`) already exists, seeding will return a message saying data already exists.

**This is OK** - the endpoint will return existing credentials.

**To start fresh:**
1. Connect to your database
2. Delete the demo tenant: `DELETE FROM "Tenant" WHERE slug = 'demo-school';`
3. Try seeding again (cascading deletes will remove related data)

### 7. Check Vercel Build Logs

1. Go to Vercel dashboard > Deployments
2. Click on your latest deployment
3. Check the **Build Logs** for errors
4. Look for Prisma or database-related errors

### 8. Check Vercel Function Logs

After trying to seed:
1. Go to Vercel dashboard > Deployments
2. Click on your deployment
3. Go to **Functions** tab
4. Look for the `/api/setup/seed` function
5. Check logs for detailed error messages

### 9. Network/Firewall Issues

If using a self-hosted database:
- Ensure your database allows connections from Vercel's IP ranges
- Check firewall rules
- Verify database is publicly accessible (or set up VPC connection)

For **Neon** (recommended):
- This should work out of the box
- Neon is serverless and Vercel-friendly

### 10. Still Having Issues?

Create a minimal test to verify your setup:

1. Create a simple API endpoint:
   ```typescript
   // app/api/test-db/route.ts
   import { NextResponse } from 'next/server'
   import { prisma } from '@/lib/prisma'

   export async function GET() {
     try {
       await prisma.$connect()
       const count = await prisma.tenant.count()
       return NextResponse.json({
         success: true,
         message: 'Connected!',
         tenants: count
       })
     } catch (error: any) {
       return NextResponse.json({
         success: false,
         error: error.message
       })
     }
   }
   ```

2. Visit: `https://your-project.vercel.app/api/test-db`

## Quick Checklist

- [ ] DATABASE_URL set in Vercel environment variables
- [ ] DATABASE_URL format is correct (postgresql://...)
- [ ] DATABASE_URL includes `?sslmode=require` for Neon
- [ ] Redeployed after adding environment variables
- [ ] Prisma generate runs during build (check build logs)
- [ ] Setup key matches (default: `setup-demo-data`)
- [ ] Checked Vercel function logs for detailed errors

## Success Indicators

When seeding works, you should see:
- ✅ Success message with credentials
- Admin email: `admin@demo-school.com`
- Admin password: `admin123`
- Student email: `student@demo-school.com`
- Student password: `student123`
- Direct login link

## Next Steps After Successful Seeding

1. Click **Login as Admin** button
2. Or go to: `https://your-project.vercel.app/login`
3. Enter credentials: `admin@demo-school.com` / `admin123`
4. You'll be redirected to: `/t/demo-school/dashboard`
