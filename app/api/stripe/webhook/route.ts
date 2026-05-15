import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'

async function findUserByCustomerId(client: Awaited<ReturnType<typeof clerkClient>>, customerId: string) {
  const allUsers = await client.users.getUserList({ limit: 100 })
  return allUsers.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId)
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const client = await clerkClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const clerkUserId = session.metadata?.clerkUserId
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    if (clerkUserId) {
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { plan: 'pro', stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
      })
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
    const sub = event.data.object as Stripe.Subscription
    const match = await findUserByCustomerId(client, sub.customer as string)
    if (match) {
      await client.users.updateUserMetadata(match.id, {
        publicMetadata: { plan: 'free', stripeCustomerId: sub.customer, stripeSubscriptionId: sub.id },
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const isActive = sub.status === 'active' || sub.status === 'trialing'
    const match = await findUserByCustomerId(client, sub.customer as string)
    if (match) {
      await client.users.updateUserMetadata(match.id, {
        publicMetadata: { plan: isActive ? 'pro' : 'free', stripeCustomerId: sub.customer, stripeSubscriptionId: sub.id },
      })
    }
  }

  return NextResponse.json({ received: true })
}
