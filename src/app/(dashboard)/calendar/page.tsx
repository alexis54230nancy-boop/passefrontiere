import { createClient } from '@/lib/supabase/server'
import { CalendarDays } from 'lucide-react'
import CalendarView from '@/components/calendar/CalendarView'
import type { Corridor, WorkDay } from '@/lib/types/database'

export const metadata = { title: 'Calendrier — PasseFrontière' }

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.year ?? String(now.getFullYear()), 10)
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10)

  // Work days for the displayed month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: workDaysRaw } = await supabase
    .from('work_days')
    .select('*')
    .eq('user_id', user!.id)
    .gte('work_date', startDate)
    .lte('work_date', endDate)
    .order('work_date', { ascending: true })

  const workDays = (workDaysRaw ?? []) as WorkDay[]

  // All active corridors for the add modal
  const { data: corridorsRaw } = await supabase
    .from('corridors')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const corridors = (corridorsRaw ?? []) as Corridor[]

  // Monthly summary
  const homeDays = workDays.filter((d) => d.location === 'home_country').length
  const workDays2 = workDays.filter((d) => d.location === 'work_country').length
  const totalDays = workDays.length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Calendrier</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Saisissez vos jours travaillés · Exercice {year}
          </p>
        </div>
      </div>

      {/* Monthly stats */}
      {totalDays > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Télétravail (France)', value: homeDays, color: '#22C55E' },
            { label: "Pays d'emploi", value: workDays2, color: '#3B82F6' },
            { label: 'Total ce mois', value: totalDays, color: '#94A3B8' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-[#1E293B] bg-[#0F172A] px-4 py-3"
            >
              <p className="text-xl font-bold" style={{ color }}>
                {value}
              </p>
              <p className="mt-0.5 text-xs text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>
      )}

      {corridors.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#1E293B] text-center">
          <CalendarDays className="h-8 w-8 text-[#334155]" strokeWidth={1.25} />
          <p className="text-sm text-[#64748B]">Aucun corridor actif disponible.</p>
          <p className="text-xs text-[#334155]">Exécutez la migration SQL pour initialiser les corridors.</p>
        </div>
      ) : (
        <CalendarView
          year={year}
          month={month}
          workDays={workDays}
          corridors={corridors}
        />
      )}
    </div>
  )
}
