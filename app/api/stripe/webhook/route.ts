import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const orderId = session.metadata?.orderId
        const courseId = session.metadata?.courseId
        const userId = session.metadata?.userId
        const tenantId = session.metadata?.tenantId

        if (!orderId || !courseId || !userId || !tenantId) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Update order to PAID
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string,
          },
        })

        // Create enrollment
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        })

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              userId,
              courseId,
              tenantId,
              status: 'NOT_STARTED',
            },
          })
        }

        console.log(`Order ${orderId} completed and enrollment created`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find order by payment intent ID
        const order = await prisma.order.findFirst({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'FAILED',
            },
          })
          console.log(`Payment failed for order ${order.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
