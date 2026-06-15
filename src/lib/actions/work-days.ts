'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Corridor } from '@/lib/types/database'

async function checkAndCreateAlerts(userId: string, corridorId: string) {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  const { data: corridorRaw } = await supabase
    .from('corridors')
    .select('*')
    .eq('id', corridorId)
    .single()

  if (!corridorRaw) return
  const corridor = corridorRaw as Corridor

  const { count } = await supabase
    .from('work_days')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('corridor_id', corridorId)
    .eq('year', currentYear)
    .eq('location', 'home_country')

  const currentDays = count ?? 0

  for (const alertDay of corridor.alert_days) {
    if (currentDays >= alertDay) {
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('corridor_id', corridorId)
        .eq('threshold_days', alertDay)
        .gte('created_at', `${currentYear}-01-01`)
        .maybeSingle()

      if (!existing) {
        const pct = Math.round((alertDay / corridor.threshold_days) * 100)
        const isOver = currentDays >= corridor.threshold_days
        const alertType = isOver ? 'critical' : pct >= 90 ? 'warning' : 'info'

        const message = isOver
          ? `🚨 Seuil dépassé — ${corridor.name} : ${currentDays} jours de télétravail enregistrés (seuil : ${corridor.threshold_days} j). Risque fiscal immédiat.`
          : `⚠️ ${pct}% du seuil atteint — ${corridor.name} : ${currentDays}/${corridor.threshold_days} jours de télétravail utilisés cette année.`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('alerts') as any).insert({
          user_id: userId,
          corridor_id: corridorId,
          alert_type: alertType,
          threshold_days: alertDay,
          current_days: currentDays,
          message,
        })
      }
    }
  }
}

export async function addWorkDay(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const corridor_id = formData.get('corridor_id') as string
  const work_date = formData.get('work_date') as string
  const location = formData.get('location') as 'home_country' | 'work_country' | 'third_country'
  const notes = (formData.get('notes') as string | null) || null

  if (!corridor_id || !work_date || !location) {
    return { error: 'Données manquantes.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('work_days') as any).insert({
    user_id: user.id,
    corridor_id,
    work_date,
    location,
    notes,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Un jour est déjà enregistré pour cette date et ce corridor.' }
    }
    return { error: error.message }
  }

  if (location === 'home_country') {
    await checkAndCreateAlerts(user.id, corridor_id)
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  revalidatePath('/alerts')
  return { success: true }
}

export async function deleteWorkDay(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('work_days')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return { success: true }
}
