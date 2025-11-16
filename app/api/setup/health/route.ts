import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Database health check endpoint
// Helps diagnose connection issues before attempting to seed
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    databaseUrl: {
      configured: !!process.env.DATABASE_URL,
      format: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 20) + '...'
        : 'NOT SET',
    },
    connection: {
      status: 'unknown' as 'connected' | 'failed' | 'unknown',
      error: null as string | null,
    },
    prisma: {
      status: 'unknown' as 'ready' | 'failed' | 'unknown',
      error: null as string | null,
    },
    database: {
      tenants: 0,
      users: 0,
      courses: 0,
    },
    demoData: {
      exists: false,
      details: null as any,
    },
  }

  // Check 1: DATABASE_URL configured
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        healthy: false,
        checks,
        error: 'DATABASE_URL not configured',
        fix: [
          'Go to Vercel Dashboard > Settings > Environment Variables',
          'Add DATABASE_URL with your database connection string',
          'Redeploy your application',
        ],
      },
      { status: 500 }
    )
  }

  // Check 2: Database connection
  try {
    await prisma.$connect()
    checks.connection.status = 'connected'
  } catch (error: any) {
    checks.connection.status = 'failed'
    checks.connection.error = error.message

    return NextResponse.json(
      {
        healthy: false,
        checks,
        error: 'Database connection failed',
        fix: [
          'Verify DATABASE_URL is correct',
          'For Neon: ensure it ends with ?sslmode=require',
          'Check database credentials',
          'Verify network/firewall settings',
        ],
      },
      { status: 500 }
    )
  }

  // Check 3: Prisma queries
  try {
    checks.database.tenants = await prisma.tenant.count()
    checks.database.users = await prisma.user.count()
    checks.database.courses = await prisma.course.count()
    checks.prisma.status = 'ready'
  } catch (error: any) {
    checks.prisma.status = 'failed'
    checks.prisma.error = error.message

    return NextResponse.json(
      {
        healthy: false,
        checks,
        error: 'Prisma query failed',
        fix: [
          'Database schema may be out of sync',
          'Run: npx prisma db push',
          'Or check that migrations are applied',
          'Verify Prisma client is generated',
        ],
      },
      { status: 500 }
    )
  }

  // Check 4: Demo data exists?
  try {
    const demoTenant = await prisma.tenant.findUnique({
      where: { slug: 'demo-school' },
    })

    const demoAdmin = await prisma.user.findFirst({
      where: { email: 'admin@demo-school.com' },
    })

    if (demoTenant && demoAdmin) {
      checks.demoData.exists = true
      checks.demoData.details = {
        tenant: demoTenant.name,
        adminEmail: demoAdmin.email,
        loginUrl: '/login',
        dashboardUrl: '/t/demo-school/dashboard',
      }
    }
  } catch (error: any) {
    // Silently fail - this is optional check
    console.log('Demo data check failed:', error.message)
  }

  // Disconnect
  await prisma.$disconnect()

  // All checks passed!
  return NextResponse.json({
    healthy: true,
    message: 'All database checks passed ✅',
    checks,
    nextSteps: checks.demoData.exists
      ? [
          'Demo data already exists!',
          'Login with: admin@demo-school.com / admin123',
          'Dashboard: /t/demo-school/dashboard',
        ]
      : [
          'Database is ready for seeding',
          'Go to /setup page',
          'Click "Seed Database" button',
        ],
  })
}
