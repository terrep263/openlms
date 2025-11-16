import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const learnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'TENANT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = learnerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Check if email already exists for this tenant
    const existing = await prisma.user.findFirst({
      where: {
        tenantId: session.tenantId,
        email,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create learner
    const learner = await prisma.user.create({
      data: {
        tenantId: session.tenantId,
        email,
        name,
        passwordHash,
        role: 'LEARNER',
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({
      success: true,
      learner: {
        id: learner.id,
        name: learner.name,
        email: learner.email,
      },
    })
  } catch (error) {
    console.error('Add learner error:', error)
    return NextResponse.json(
      { error: 'Failed to add learner' },
      { status: 500 }
    )
  }
}
