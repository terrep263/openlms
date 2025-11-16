import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for test admin
  const passwordHash = await bcrypt.hash('admin123', 10)

  // Create test tenant
  const testTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: {
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

  console.log('✅ Created tenant:', testTenant.name)

  // Create test admin user
  const testAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: testTenant.id,
        email: 'admin@demo-school.com',
      },
    },
    update: {},
    create: {
      tenantId: testTenant.id,
      email: 'admin@demo-school.com',
      name: 'Demo Admin',
      passwordHash,
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created admin user:', testAdmin.email)

  // Create a test learner
  const testLearner = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: testTenant.id,
        email: 'student@demo-school.com',
      },
    },
    update: {},
    create: {
      tenantId: testTenant.id,
      email: 'student@demo-school.com',
      name: 'Demo Student',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'LEARNER',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created learner user:', testLearner.email)

  // Create test courses
  const freeCourse = await prisma.course.upsert({
    where: {
      tenantId_slug: {
        tenantId: testTenant.id,
        slug: 'intro-to-web-dev',
      },
    },
    update: {},
    create: {
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

  console.log('✅ Created free course:', freeCourse.title)

  const paidCourse = await prisma.course.upsert({
    where: {
      tenantId_slug: {
        tenantId: testTenant.id,
        slug: 'advanced-react',
      },
    },
    update: {},
    create: {
      tenantId: testTenant.id,
      title: 'Advanced React Patterns',
      slug: 'advanced-react',
      description: 'Master advanced React patterns including hooks, context, and performance optimization.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      embedUrl: 'https://www.youtube.com/embed/3XaXKiXtNjw',
      accessType: 'PAID',
      priceCents: 4999, // $49.99
      currency: 'usd',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
  })

  console.log('✅ Created paid course:', paidCourse.title)

  // Create draft course
  const draftCourse = await prisma.course.upsert({
    where: {
      tenantId_slug: {
        tenantId: testTenant.id,
        slug: 'coming-soon',
      },
    },
    update: {},
    create: {
      tenantId: testTenant.id,
      title: 'Coming Soon: Full Stack Development',
      slug: 'coming-soon',
      description: 'A comprehensive course on building full-stack applications.',
      status: 'DRAFT',
      visibility: 'PRIVATE',
    },
  })

  console.log('✅ Created draft course:', draftCourse.title)

  // Enroll test learner in free course
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: testLearner.id,
        courseId: freeCourse.id,
      },
    },
    update: {},
    create: {
      tenantId: testTenant.id,
      userId: testLearner.id,
      courseId: freeCourse.id,
      status: 'IN_PROGRESS',
      firstAccessedAt: new Date(),
      lastAccessedAt: new Date(),
    },
  })

  console.log('✅ Enrolled student in free course')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('─────────────────────────────────────')
  console.log('Admin Login:')
  console.log('  URL: /login')
  console.log('  Email: admin@demo-school.com')
  console.log('  Password: admin123')
  console.log('  Dashboard: /t/demo-school/dashboard')
  console.log('\nStudent Login:')
  console.log('  Email: student@demo-school.com')
  console.log('  Password: student123')
  console.log('  School: /school/demo-school')
  console.log('─────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
