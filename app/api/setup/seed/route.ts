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
        title: 'Introduction to Web Development',
        slug: 'intro-to-web-dev',
        description: 'Learn the basics of HTML, CSS, and JavaScript in this beginner-friendly course.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        embedUrl: 'https://www.youtube.com/embed/UB1O30fR-EE',
        accessType: 'FREE',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
    })

    const paidCourse = await prisma.course.create({
      data: {
        tenantId: testTenant.id,
        title: 'Advanced React Patterns',
        slug: 'advanced-react',
        description: 'Master advanced React patterns including hooks, context, and performance optimization.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        embedUrl: 'https://www.youtube.com/embed/3XaXKiXtNjw',
        accessType: 'PAID',
        priceCents: 4999,
        currency: 'usd',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
    })

    const draftCourse = await prisma.course.create({
      data: {
        tenantId: testTenant.id,
        title: 'Coming Soon: Full Stack Development',
        slug: 'coming-soon',
        description: 'A comprehensive course on building full-stack applications.',
        status: 'DRAFT',
        visibility: 'PRIVATE',
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
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error.message,
        hint: 'Make sure DATABASE_URL is set in Vercel environment variables',
      },
      { status: 500 }
    )
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
