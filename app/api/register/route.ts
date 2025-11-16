import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { schoolName, schoolSlug, name, email, password } = validation.data

    // Check if tenant slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: schoolSlug },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'School URL already taken' },
        { status: 400 }
      )
    }

    // Create Stripe customer for the tenant
    const stripeCustomer = await stripe.customers.create({
      name: schoolName,
      email: email,
      metadata: {
        tenant_slug: schoolSlug,
      },
    })

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: schoolName,
          slug: schoolSlug,
          status: 'ACTIVE',
          plan: 'STARTER',
          stripeCustomerId: stripeCustomer.id,
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          passwordHash,
          role: 'TENANT_ADMIN',
          status: 'ACTIVE',
        },
      })

      return { tenant, user }
    })

    // Create JWT token
    const token = createToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      role: result.user.role,
    })

    // Set session cookie
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      tenant: {
        id: result.tenant.id,
        slug: result.tenant.slug,
        name: result.tenant.name,
      },
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
