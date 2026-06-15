import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  // Use service role client — no cookie context in webhook
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  switch (event.type) {
    case 'checkout.session.completed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = event.data.object as any
      const userId: string | undefined = session.metadata?.user_id
      const plan: string | undefined = session.metadata?.plan

      if (userId && plan) {
        await db
          .from('profiles')
          .update({
            subscription_status: plan,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any
      const status: string = subscription.status

      // Only downgrade if subscription is no longer active
      if (status === 'active' || status === 'trialing') break

      const { data: profile } = await db
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .maybeSingle()

      if (profile) {
        await db
          .from('profiles')
          .update({
            subscription_status: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = event.data.object as any

      const { data: profile } = await db
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .maybeSingle()

      if (profile) {
        await db
          .from('profiles')
          .update({
            subscription_status: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
