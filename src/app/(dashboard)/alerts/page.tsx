import { createClient } from '@/lib/supabase/server'
import { AlertList } from '@/components/alerts/AlertList'
import type { Alert } from '@/lib/types/database'

export const metadata = { title: 'Alertes — PasseFrontière' }

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: alertsRaw } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const alerts = (alertsRaw ?? []) as Alert[]
  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Alertes</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Historique de vos alertes fiscales frontalières
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </p>
        </div>
      </div>

      <AlertList alerts={alerts} />
    </div>
  )
}
