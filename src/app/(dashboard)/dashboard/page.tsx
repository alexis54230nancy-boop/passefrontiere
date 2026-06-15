import { createClient } from '@/lib/supabase/server'
import { CorridorCard } from '@/components/dashboard/CorridorCard'
import { Bell, CalendarDays, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Corridor, Alert } from '@/lib/types/database'

export const metadata = {
  title: 'Tableau de bord — PasseFrontière',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentYear = new Date().getFullYear()

  // Fetch active corridors
  const { data: corridorsRaw } = await supabase
    .from('corridors')
    .select('*')
    .eq('is_active', true)
    .order('name')
  const corridors = (corridorsRaw ?? []) as Corridor[]

  // Count telework days per corridor for current year
  const corridorCounts: Record<string, number> = {}
  if (corridors.length > 0 && user) {
    const { data: workDaysRaw } = await supabase
      .from('work_days')
      .select('corridor_id')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .eq('location', 'home_country')

    const workDays = (workDaysRaw ?? []) as { corridor_id: string }[]
    for (const wd of workDays) {
      corridorCounts[wd.corridor_id] = (corridorCounts[wd.corridor_id] ?? 0) + 1
    }
  }

  // Unread alerts count
  const { count: unreadAlerts } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('is_read', false)

  // Recent alerts (top 3)
  const { data: recentAlertsRaw } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(3)
  const recentAlerts = (recentAlertsRaw ?? []) as Alert[]

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Tableau de bord</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Exercice {currentYear} — Suivi de vos jours hors pays d&apos;emploi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/alerts"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E293B] bg-[#0F172A] text-[#64748B] transition-colors duration-150 hover:text-[#F8FAFC] cursor-pointer"
            aria-label={`${unreadAlerts ?? 0} alertes non lues`}
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            {(unreadAlerts ?? 0) > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                {unreadAlerts}
              </span>
            )}
          </Link>

          <Link
            href="/calendar"
            className="flex h-10 items-center gap-2 rounded-xl bg-[#22C55E] px-4 text-sm font-semibold text-[#020617] transition-colors duration-150 hover:bg-[#16A34A] cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Ajouter un jour
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Corridors actifs',
            value: corridors.length,
            icon: CalendarDays,
            color: '#22C55E',
          },
          {
            label: 'Jours enregistrés',
            value: Object.values(corridorCounts).reduce((a, b) => a + b, 0),
            icon: CalendarDays,
            color: '#3B82F6',
          },
          {
            label: 'Alertes actives',
            value: unreadAlerts ?? 0,
            icon: Bell,
            color: unreadAlerts ? '#EF4444' : '#22C55E',
          },
          {
            label: 'Exercice en cours',
            value: currentYear,
            icon: CalendarDays,
            color: '#94A3B8',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-5"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E293B]">
              <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.75} />
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{value}</p>
            <p className="mt-1 text-xs text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

      {/* Corridor cards */}
      <section className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-[#F8FAFC]">
          Suivi par corridor
        </h2>
        {corridors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {corridors.map((corridor) => (
              <CorridorCard
                key={corridor.id}
                corridor={corridor}
                daysUsed={corridorCounts[corridor.id] ?? 0}
                year={currentYear}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#1E293B] text-sm text-[#64748B]">
            Aucun corridor disponible.
          </div>
        )}
      </section>

      {/* Recent alerts */}
      {recentAlerts.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F8FAFC]">Alertes récentes</h2>
            <Link href="/alerts" className="text-xs text-[#22C55E] hover:underline cursor-pointer">
              Voir toutes
            </Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={[
                  'flex items-start gap-4 rounded-xl border p-4',
                  alert.is_read
                    ? 'border-[#1E293B] bg-[#0F172A]'
                    : 'border-[#F59E0B]/30 bg-[#F59E0B]/5',
                ].join(' ')}
              >
                <div
                  className={[
                    'mt-0.5 h-2 w-2 flex-shrink-0 rounded-full',
                    alert.alert_type === 'critical' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]',
                  ].join(' ')}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#F8FAFC]">{alert.message}</p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {new Date(alert.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
