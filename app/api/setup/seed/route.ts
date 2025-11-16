import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// This endpoint seeds the database with demo data
// SECURITY: Should be disabled in production or protected with a secret key
export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret key check for production
    const secretKey = request.headers.get('x-setup-key')
    const expectedKey = process.env.SETUP_SECRET_KEY || 'setup-demo-data'

    if (secretKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid setup key' },
        { status: 401 }
      )
    }

    console.log('🌱 Starting database seed...')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not configured',
          details: 'The DATABASE_URL environment variable is not set',
          fix: [
            '1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables',
            '2. Add DATABASE_URL with your database connection string',
            '3. Redeploy your application',
          ],
        },
        { status: 500 }
      )
    }

    // Test database connection
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (connectionError: any) {
      console.error('❌ Database connection failed:', connectionError)
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: connectionError.message,
          fix: [
            'Check that DATABASE_URL is correct',
            'For Neon, ensure it ends with ?sslmode=require',
            'Verify database credentials are valid',
            'Check network/firewall settings',
          ],
        },
        { status: 500 }
      )
    }

    // Hash password for test admin
    const passwordHash = await bcrypt.hash('admin123', 10)

    // Check if demo tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: 'demo-school' },
    })

    if (existingTenant) {
      return NextResponse.json({
        message: 'Demo data already exists',
        tenant: existingTenant,
        instructions: {
          login: 'admin@demo-school.com',
          password: 'admin123',
          dashboard: `/t/demo-school/dashboard`,
        },
      })
    }

    // Create test tenant
    const testTenant = await prisma.tenant.create({
      data: {
        name: 'Demo School',
        slug: 'demo-school',
        status: 'ACTIVE',
        plan: 'PRO',
        logoUrl: null,
        primaryColor: '#4F46E5',
        stripeCustomerId: null,
        stripeConnectAccountId: null,
      },
    })

    // Create test admin user
    const testAdmin = await prisma.user.create({
      data: {
        tenantId: testTenant.id,
        email: 'admin@demo-school.com',
        name: 'Demo Admin',
        passwordHash,
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
      },
    })

    // Create a test learner
    const testLearner = await prisma.user.create({
      data: {
        tenantId: testTenant.id,
        email: 'student@demo-school.com',
        name: 'Demo Student',
        passwordHash: await bcrypt.hash('student123', 10),
        role: 'LEARNER',
        status: 'ACTIVE',
      },
    })

    // Create test courses
    const freeCourse = await prisma.course.create({
      data: {
        tenantId: testTenant.id,
        instructorId: testAdmin.id,
        title: 'Introduction to Web Development',
        slug: 'intro-to-web-dev',
        description: 'Learn the basics of HTML, CSS, and JavaScript in this beginner-friendly course.',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        price: 0,
        status: 'PUBLISHED',
        featured: true,
      },
    })

    const paidCourse = await prisma.course.create({
      data: {
        tenantId: testTenant.id,
        instructorId: testAdmin.id,
        title: 'Advanced React Patterns',
        slug: 'advanced-react',
        description: 'Master advanced React patterns including hooks, context, and performance optimization.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        price: 49.99,
        status: 'PUBLISHED',
        featured: true,
      },
    })

    const draftCourse = await prisma.course.create({
      data: {
        tenantId: testTenant.id,
        instructorId: testAdmin.id,
        title: 'Coming Soon: Full Stack Development',
        slug: 'coming-soon',
        description: 'A comprehensive course on building full-stack applications.',
        price: 0,
        status: 'DRAFT',
        featured: false,
      },
    })

    // Enroll test learner in free course
    await prisma.enrollment.create({
      data: {
        tenantId: testTenant.id,
        userId: testLearner.id,
        courseId: freeCourse.id,
        status: 'IN_PROGRESS',
        firstAccessedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        tenant: {
          name: testTenant.name,
          slug: testTenant.slug,
        },
        users: {
          admin: testAdmin.email,
          student: testLearner.email,
        },
        courses: {
          free: freeCourse.title,
          paid: paidCourse.title,
          draft: draftCourse.title,
        },
      },
      credentials: {
        admin: {
          email: 'admin@demo-school.com',
          password: 'admin123',
          loginUrl: '/login',
          dashboardUrl: '/t/demo-school/dashboard',
        },
        student: {
          email: 'student@demo-school.com',
          password: 'student123',
          loginUrl: '/login',
          schoolUrl: '/school/demo-school',
        },
      },
    })
  } catch (error: any) {
    console.error('Seed error:', error)

    // Provide specific error guidance based on error type
    let errorGuidance = []

    if (error.message?.includes('connect')) {
      errorGuidance = [
        'DATABASE_URL may be incorrect or unreachable',
        'For Neon: ensure connection string ends with ?sslmode=require',
        'Check Vercel environment variables',
      ]
    } else if (error.message?.includes('does not exist') || error.message?.includes('42704')) {
      errorGuidance = [
        'Database schema is not synced - tables/types missing',
        'The build process should auto-sync the schema',
        'Trigger a redeploy in Vercel to sync the schema',
        'Or manually run: npx prisma db push',
      ]
    } else if (error.message?.includes('Unique constraint')) {
      errorGuidance = [
        'Demo data already exists in database',
        'Try the GET endpoint to retrieve existing credentials',
        'Or delete existing demo data and try again',
      ]
    } else if (error.message?.includes('Foreign key')) {
      errorGuidance = [
        'Database schema may be out of sync',
        'Trigger a redeploy in Vercel to sync the schema',
        'Or manually run: npx prisma db push',
      ]
    } else {
      errorGuidance = [
        'Check Vercel function logs for detailed error',
        'Ensure DATABASE_URL is set correctly',
        'Verify database schema is up to date',
      ]
    }

    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error.message,
        errorType: error.constructor.name,
        fix: errorGuidance,
        troubleshooting: 'See SEEDING_TROUBLESHOOTING.md for detailed help',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check if demo data exists
export async function GET() {
  try {
    const demoTenant = await prisma.tenant.findUnique({
      where: { slug: 'demo-school' },
    })

    const demoAdmin = await prisma.user.findFirst({
      where: { email: 'admin@demo-school.com' },
    })

    if (demoTenant && demoAdmin) {
      return NextResponse.json({
        exists: true,
        message: 'Demo data exists',
        credentials: {
          admin: {
            email: 'admin@demo-school.com',
            password: 'admin123',
            dashboardUrl: '/t/demo-school/dashboard',
          },
          student: {
            email: 'student@demo-school.com',
            password: 'student123',
            schoolUrl: '/school/demo-school',
          },
        },
      })
    }

    return NextResponse.json({
      exists: false,
      message: 'Demo data not found',
      action: 'POST to this endpoint with x-setup-key header to seed database',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Database check failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
