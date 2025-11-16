import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId, status } = await request.json()

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: session.userId,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Update enrollment
    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        ...(status === 'IN_PROGRESS' && !enrollment.firstAccessedAt && {
          firstAccessedAt: new Date(),
        }),
        ...(status === 'COMPLETED' && {
          completedAt: new Date(),
        }),
        lastAccessedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, enrollment: updated })
  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
