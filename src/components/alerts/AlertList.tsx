'use client'

import { useTransition } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { markAlertRead, markAllAlertsRead } from '@/lib/actions/alerts'
import type { Alert } from '@/lib/types/database'

const ALERT_COLORS: Record<string, string> = {
  warning: '#F59E0B',
  critical: '#EF4444',
  info: '#3B82F6',
}

const ALERT_LABELS: Record<string, string> = {
  warning: 'Avertissement',
  critical: 'Critique',
  info: 'Information',
}

export function AlertList({ alerts }: { alerts: Alert[] }) {
  const [isPending, startTransition] = useTransition()
  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <div>
      {alerts.length > 0 && unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => startTransition(() => { void markAllAlertsRead() })}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] px-3 py-1.5 text-xs font-medium text-[#64748B] hover:border-[#334155] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Tout marquer comme lu
          </button>
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={[
                'flex items-start gap-4 rounded-xl border p-4 transition-colors duration-150',
                alert.is_read
                  ? 'border-[#1E293B] bg-[#0F172A]'
                  : 'border-[#F59E0B]/30 bg-[#F59E0B]/5',
              ].join(' ')}
            >
              <div
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${ALERT_COLORS[alert.alert_type]}20` }}
              >
                <Bell
                  className="h-4 w-4"
                  style={{ color: ALERT_COLORS[alert.alert_type] }}
                  strokeWidth={1.75}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: ALERT_COLORS[alert.alert_type] }}
                  >
                    {ALERT_LABELS[alert.alert_type]}
                  </span>
                  {!alert.is_read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" aria-hidden />
                  )}
                </div>
                <p className="text-sm text-[#F8FAFC]">{alert.message}</p>
                <p className="mt-1.5 text-xs text-[#64748B]">
                  {new Date(alert.created_at).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p className="text-xs text-[#64748B]">
                  {alert.current_days} / {alert.threshold_days} j
                </p>
                {!alert.is_read && (
                  <button
                    onClick={() => startTransition(() => { void markAlertRead(alert.id) })}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-md border border-[#1E293B] px-2 py-1 text-xs text-[#64748B] hover:border-[#22C55E]/30 hover:text-[#22C55E] transition-colors duration-150 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    Lu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#1E293B] text-center">
          <Bell className="h-8 w-8 text-[#334155]" strokeWidth={1.25} />
          <p className="text-sm text-[#64748B]">Aucune alerte pour le moment.</p>
          <p className="text-xs text-[#334155]">
            Les alertes apparaîtront automatiquement lorsque vous approcherez des seuils fiscaux.
          </p>
        </div>
      )}
    </div>
  )
}
