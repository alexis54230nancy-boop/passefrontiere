'use client'

import { Corridor } from '@/lib/types/database'

interface CorridorCardProps {
  corridor: Corridor
  daysUsed: number
  year: number
}

const COUNTRY_FLAGS: Record<string, string> = {
  LU: '🇱🇺',
  CH: '🇨🇭',
  DE: '🇩🇪',
  BE: '🇧🇪',
}

function getStatusColor(percent: number): { bar: string; label: string; text: string } {
  if (percent >= 100) return { bar: '#EF4444', label: 'Seuil atteint', text: 'text-[#EF4444]' }
  if (percent >= 85) return { bar: '#EF4444', label: 'Critique', text: 'text-[#EF4444]' }
  if (percent >= 60) return { bar: '#F59E0B', label: 'Attention', text: 'text-[#F59E0B]' }
  return { bar: '#22C55E', label: 'OK', text: 'text-[#22C55E]' }
}

export function CorridorCard({ corridor, daysUsed, year }: CorridorCardProps) {
  const daysRemaining = Math.max(0, corridor.threshold_days - daysUsed)
  const percent = Math.min(100, Math.round((daysUsed / corridor.threshold_days) * 100))
  const status = getStatusColor(percent)
  const flag = COUNTRY_FLAGS[corridor.country_work] ?? '🏳️'

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 transition-colors duration-200 hover:border-[#334155]">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>{flag}</span>
          <div>
            <h3 className="font-semibold text-[#F8FAFC] leading-tight">{corridor.name}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Exercice {year}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
      </div>

      {/* Day counters */}
      <div className="mb-5 flex gap-4">
        <div>
          <p className="text-2xl font-bold text-[#F8FAFC]">{daysUsed}</p>
          <p className="text-xs text-[#64748B]">jours utilisés</p>
        </div>
        <div className="w-px bg-[#1E293B]" aria-hidden />
        <div>
          <p className="text-2xl font-bold" style={{ color: status.bar }}>{daysRemaining}</p>
          <p className="text-xs text-[#64748B]">jours restants</p>
        </div>
        <div className="w-px bg-[#1E293B]" aria-hidden />
        <div>
          <p className="text-2xl font-bold text-[#94A3B8]">{corridor.threshold_days}</p>
          <p className="text-xs text-[#64748B]">seuil max</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-[#64748B]">
          <span>Progression</span>
          <span>{percent}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[#1E293B]"
          role="progressbar"
          aria-valuenow={daysUsed}
          aria-valuemin={0}
          aria-valuemax={corridor.threshold_days}
          aria-label={`${daysUsed} jours utilisés sur ${corridor.threshold_days}`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: status.bar }}
          />
        </div>
      </div>
    </div>
  )
}
