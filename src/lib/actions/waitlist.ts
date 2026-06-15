'use server'

import { createClient } from '@/lib/supabase/server'

export async function joinWaitlist(data: {
  email: string
  corridor: string
  problem?: string
}) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('waitlist') as any).insert({
    email: data.email,
    corridor: data.corridor || null,
    problem: data.problem || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: "Cet email est déjà inscrit sur la liste d'attente." }
    }
    return { error: 'Une erreur est survenue. Veuillez réessayer.' }
  }

  return { success: true }
}
