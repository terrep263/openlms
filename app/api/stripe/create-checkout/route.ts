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

    const priceInCents = Math.round(Number(course.price) * 100)

    if (Number(course.price) <= 0) {
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
        userId: session.userId,
        courseId: course.id,
        tenantId: session.tenantId,
        amountCents: priceInCents,
        currency: 'USD',
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
            currency: 'usd',
            unit_amount: priceInCents,
            product_data: {
              name: course.title,
              description: course.description || undefined,
              images: course.thumbnail ? [course.thumbnail] : undefined,
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
        application_fee_amount: Math.floor(priceInCents * 0.1), // 10% platform fee
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
