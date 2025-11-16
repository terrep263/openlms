import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { courseSchema } from '@/lib/validations/course'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'TENANT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = courseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if slug already exists for this tenant
    const existing = await prisma.course.findFirst({
      where: {
        tenantId: session.tenantId,
        slug: data.slug,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Course slug already exists' },
        { status: 400 }
      )
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        tenantId: session.tenantId,
        instructorId: session.userId, // Required field from schema
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        price: data.price || 0, // Decimal field
        status: data.status || 'DRAFT',
        featured: data.featured || false,
        level: data.level,
        duration: data.duration,
        categoryId: data.categoryId,
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'TENANT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, ...courseData } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Validate input
    const validation = courseSchema.safeParse(courseData)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify course belongs to tenant
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        tenantId: session.tenantId,
      },
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if slug is being changed and if it conflicts
    if (data.slug !== existingCourse.slug) {
      const slugConflict = await prisma.course.findFirst({
        where: {
          tenantId: session.tenantId,
          slug: data.slug,
          id: { not: courseId },
        },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Course slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        price: data.price,
        status: data.status,
        featured: data.featured,
        level: data.level,
        duration: data.duration,
        categoryId: data.categoryId,
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}
