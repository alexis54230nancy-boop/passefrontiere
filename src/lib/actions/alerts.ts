'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAlertRead(alertId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('alerts') as any)
    .update({ is_read: true })
    .eq('id', alertId)
    .eq('user_id', user.id)

  revalidatePath('/alerts')
  revalidatePath('/dashboard')
}

export async function markAllAlertsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('alerts') as any)
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  revalidatePath('/alerts')
  revalidatePath('/dashboard')
}
