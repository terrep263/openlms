import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'TENANT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Create or retrieve Connect account
    let accountId = tenant.stripeConnectAccountId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        metadata: {
          tenantId: tenant.id,
        },
      })
      accountId = account.id

      // Save account ID
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeConnectAccountId: accountId },
      })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/t/${tenant.slug}/settings/payments`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect/callback?accountId=${accountId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Create Stripe Connect link error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Connect link' },
      { status: 500 }
    )
  }
}
