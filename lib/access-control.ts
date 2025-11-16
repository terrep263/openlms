import { prisma } from './prisma'
import { getSession, SessionPayload } from './auth'
import { redirect } from 'next/navigation'

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Require authentication - returns session or redirects to login
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Validate that user is a tenant admin and belongs to the specified tenant
 */
export async function validateTenantAdmin(tenantSlug: string): Promise<{
  session: SessionPayload
  tenant: {
    id: string
    name: string
    slug: string
    status: string
    plan: string
    logoUrl: string | null
    primaryColor: string | null
    stripeCustomerId: string | null
    stripeConnectAccountId: string | null
  }
}> {
  const session = await requireAuth()

  // Load tenant by slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      plan: true,
      logoUrl: true,
      primaryColor: true,
      stripeCustomerId: true,
      stripeConnectAccountId: true,
    },
  })

  if (!tenant) {
    throw new UnauthorizedError('Tenant not found')
  }

  // Verify user belongs to this tenant
  if (session.tenantId !== tenant.id) {
    throw new ForbiddenError('You do not have access to this tenant')
  }

  // Verify user is an admin
  if (session.role !== 'TENANT_ADMIN') {
    throw new ForbiddenError('Admin access required')
  }

  return { session, tenant }
}

/**
 * Check if user is enrolled in a course
 */
export async function validateEnrollment(
  userId: string,
  courseId: string,
  tenantId: string
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  })

  return enrollment
}

/**
 * Auto-enroll user in a free course
 */
export async function autoEnrollFreeCourse(
  userId: string,
  courseId: string,
  tenantId: string
) {
  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      tenantId,
      status: 'NOT_STARTED',
    },
  })

  return enrollment
}

/**
 * Check if tenant's subscription is active
 */
export async function checkSubscriptionActive(tenantId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { status: true },
  })

  if (!tenant) {
    return false
  }

  return tenant.status === 'ACTIVE'
}

/**
 * Require active subscription - throws error if suspended
 */
export async function requireActiveSubscription(tenantId: string) {
  const isActive = await checkSubscriptionActive(tenantId)

  if (!isActive) {
    throw new ForbiddenError('Your subscription is inactive. Please update your billing.')
  }
}

/**
 * Get tenant by slug (public access)
 */
export async function getTenantBySlug(slug: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      status: true,
    },
  })

  if (!tenant) {
    throw new UnauthorizedError('School not found')
  }

  return tenant
}
