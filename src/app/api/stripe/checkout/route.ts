import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans vos variables d\'environnement.' },
      { status: 503 }
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { plan } = await request.json() as { plan: 'solo' | 'pro' }

  const priceId =
    plan === 'pro'
      ? process.env.STRIPE_PRICE_PRO
      : process.env.STRIPE_PRICE_SOLO

  if (!priceId) {
    return NextResponse.json(
      { error: `Prix Stripe non configuré pour le plan "${plan}".` },
      { status: 503 }
    )
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Pick<Profile, 'stripe_customer_id' | 'email'> | null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/settings?success=true`,
    cancel_url: `${appUrl}/settings?canceled=true`,
    metadata: {
      user_id: user.id,
      plan,
    },
    locale: 'fr',
  })

  return NextResponse.json({ url: session.url })
}
