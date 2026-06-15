import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Test connection to Supabase
  let supabaseReachable = false
  let supabaseError = ''
  if (url) {
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key ?? '', Authorization: `Bearer ${key ?? ''}` },
        signal: AbortSignal.timeout(5000),
      })
      supabaseReachable = res.ok || res.status === 404 || res.status === 400
    } catch (e: any) {
      supabaseError = e.message
    }
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 20)}...` : 'MANQUANT',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? `${key.substring(0, 20)}...` : 'MANQUANT',
      SUPABASE_SERVICE_ROLE_KEY: svc ? 'SET' : 'MANQUANT',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'MANQUANT',
    },
    supabase: {
      reachable: supabaseReachable,
      error: supabaseError || null,
    },
  })
}
