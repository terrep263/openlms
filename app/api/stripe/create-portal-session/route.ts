import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'TENANT_ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    })

    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.redirect(
        new URL(`/t/${session.tenantId}/billing?error=no_customer`, request.url)
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/t/${tenant.slug}/billing`,
    })

    return NextResponse.redirect(portalSession.url)
  } catch (error: any) {
    console.error('Create portal session error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
