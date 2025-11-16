import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'TENANT_ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.redirect(
        new URL('/t/' + session.tenantId + '/settings/payments?error=no_account', request.url)
      )
    }

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    })

    if (!tenant) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Update tenant with Stripe Connect account ID (if not already set)
    if (!tenant.stripeConnectAccountId) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeConnectAccountId: accountId },
      })
    }

    // Redirect to payments settings
    return NextResponse.redirect(
      new URL(`/t/${tenant.slug}/settings/payments?success=true`, request.url)
    )
  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
