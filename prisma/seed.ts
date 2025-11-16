import { PrismaClient, Plan, UserRole, CourseStatus, LessonType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Academy',
      slug: 'demo',
      plan: Plan.PROFESSIONAL, // ✅ Using Plan enum correctly
      logo: '/logo.png',
      primaryColor: '#3B82F6',
    },
  })
  console.log('✅ Tenant created:', tenant.slug)

  // Hash password for demo users
  const passwordHash = await bcrypt.hash('demo123', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      passwordHash,
      tenantId: tenant.id,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create instructor user
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@demo.com' },
    update: {},
    create: {
      email: 'instructor@demo.com',
      name: 'John Instructor',
      role: UserRole.INSTRUCTOR,
      passwordHash,
      tenantId: tenant.id,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Instructor user created:', instructor.email)

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      name: 'Jane Student',
      role: UserRole.STUDENT,
      passwordHash,
      tenantId: tenant.id,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Student user created:', student.email)

  // Create categories
  const webDevCategory = await prisma.category.upsert({
    where: { 
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'web-development'
      }
    },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Learn modern web development technologies',
      icon: '💻',
      order: 1,
      tenantId: tenant.id,
    },
  })
  console.log('✅ Category created:', webDevCategory.name)

  // Create a demo course
  const course = await prisma.course.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'intro-to-react'
      }
    },
    update: {},
    create: {
      title: 'Introduction to React',
      slug: 'intro-to-react',
      description: 'Learn the fundamentals of React and build modern web applications',
      thumbnail: '/courses/react.jpg',
      price: 49.99,
      status: CourseStatus.PUBLISHED,
      featured: true,
      level: 'Beginner',
      duration: 360,
      publishedAt: new Date(),
      tenantId: tenant.id,
      instructorId: instructor.id,
      categoryId: webDevCategory.id,
    },
  })
  console.log('✅ Course created:', course.title)

  // Create modules for the course
  const module1 = await prisma.module.create({
    data: {
      title: 'Getting Started with React',
      description: 'Introduction to React basics and setup',
      order: 1,
      courseId: course.id,
    },
  })
  console.log('✅ Module created:', module1.title)

  // Create lessons for the module
  await prisma.lesson.createMany({
    data: [
      {
        title: 'What is React?',
        description: 'Understanding React and why to use it',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/videos/what-is-react',
        duration: 15,
        order: 1,
        isFree: true,
        moduleId: module1.id,
      },
      {
        title: 'Setting up your environment',
        description: 'Install Node.js and create your first React app',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/videos/setup',
        duration: 20,
        order: 2,
        isFree: true,
        moduleId: module1.id,
      },
      {
        title: 'JSX Basics',
        description: 'Learn about JSX syntax',
        type: LessonType.TEXT,
        content: '# JSX Basics\n\nJSX is a syntax extension for JavaScript...',
        duration: 10,
        order: 3,
        isFree: false,
        moduleId: module1.id,
      },
    ],
  })
  console.log('✅ Lessons created')

  // Enroll the student in the course
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: 'ACTIVE',
      progress: 0,
    },
  })
  console.log('✅ Student enrolled in course')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
