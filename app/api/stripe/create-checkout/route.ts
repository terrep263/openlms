import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    // Get course and tenant
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        tenantId: session.tenantId,
      },
      include: {
        tenant: true,
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.accessType !== 'PAID' || !course.priceCents) {
      return NextResponse.json({ error: 'Course is not for sale' }, { status: 400 })
    }

    // Check if tenant has Stripe Connect account
    if (!course.tenant.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Payment processing not set up for this school' },
        { status: 400 }
      )
    }

    // Create pending order
    const order = await prisma.order.create({
      data: {
        tenantId: session.tenantId,
        userId: session.userId,
        courseId: course.id,
        amountCents: course.priceCents,
        currency: course.currency,
        status: 'PENDING',
      },
    })

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency,
            unit_amount: course.priceCents,
            product_data: {
              name: course.title,
              description: course.description || undefined,
              images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/school/${course.tenant.slug}/courses/${course.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/school/${course.tenant.slug}/courses/${course.slug}?payment=cancelled`,
      metadata: {
        orderId: order.id,
        courseId: course.id,
        userId: session.userId,
        tenantId: session.tenantId,
      },
      payment_intent_data: {
        application_fee_amount: Math.floor(course.priceCents * 0.1), // 10% platform fee
        transfer_data: {
          destination: course.tenant.stripeConnectAccountId,
        },
      },
    })

    // Update order with checkout session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
