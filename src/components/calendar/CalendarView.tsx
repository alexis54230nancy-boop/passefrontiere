'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react'
import { addWorkDay, deleteWorkDay } from '@/lib/actions/work-days'
import type { Corridor, WorkDay } from '@/lib/types/database'

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const LOCATION_LABELS: Record<string, string> = {
  home_country: 'France (télétravail)',
  work_country: "Pays d'emploi",
  third_country: 'Pays tiers',
}

const LOCATION_COLORS: Record<string, string> = {
  home_country: '#22C55E',
  work_country: '#3B82F6',
  third_country: '#94A3B8',
}

type Location = 'home_country' | 'work_country' | 'third_country'

interface CalendarViewProps {
  year: number
  month: number
  workDays: WorkDay[]
  corridors: Corridor[]
}

export default function CalendarView({ year, month, workDays, corridors }: CalendarViewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedWorkDay, setSelectedWorkDay] = useState<WorkDay | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [location, setLocation] = useState<Location>('home_country')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const workDayMap = new Map<string, WorkDay>()
  for (const wd of workDays) {
    workDayMap.set(wd.work_date, wd)
  }

  // Build calendar grid (Monday-first)
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  function navigateMonth(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    startTransition(() => router.push(`/calendar?year=${y}&month=${m}`))
  }

  function openDay(day: number) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const existing = workDayMap.get(dateStr) ?? null
    setSelectedDate(dateStr)
    setSelectedWorkDay(existing)
    setLocation('home_country')
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setSelectedDate(null)
    setSelectedWorkDay(null)
    setError(null)
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedDate) return
    setSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('location', location)
    const result = await addWorkDay(formData)
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
    } else {
      closeModal()
    }
  }

  async function handleDelete() {
    if (!selectedWorkDay) return
    setSubmitting(true)
    const result = await deleteWorkDay(selectedWorkDay.id)
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
    } else {
      closeModal()
    }
  }

  const isNextMonthFuture = () => {
    const next = new Date(year, month, 1)
    return next > today
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>

        <h2 className="text-base font-semibold text-[#F8FAFC]">
          {MONTHS_FR[month - 1]} {year}
        </h2>

        <button
          onClick={() => navigateMonth(1)}
          disabled={isNextMonthFuture()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-default"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
        {Object.entries(LOCATION_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: LOCATION_COLORS[key] }} />
            {label}
          </span>
        ))}
        <span className="text-[#334155]">· Cliquez sur un jour pour enregistrer</span>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-[#1E293B]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#1E293B] bg-[#0F172A]">
          {DAYS_FR.map((d) => (
            <div key={d} className="py-2.5 text-center text-xs font-medium text-[#64748B]">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 bg-[#020617]">
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="h-16 border-b border-r border-[#1E293B] last:border-r-0 sm:h-20"
                />
              )
            }

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const workDay = workDayMap.get(dateStr)
            const isToday = dateStr === todayStr
            const isFuture = dateStr > todayStr

            return (
              <button
                key={day}
                onClick={() => !isFuture && openDay(day)}
                disabled={isFuture}
                className={[
                  'relative flex h-16 flex-col items-start border-b border-r border-[#1E293B] p-1.5 text-left transition-colors duration-100 sm:h-20',
                  isFuture
                    ? 'cursor-default opacity-25'
                    : 'cursor-pointer hover:bg-[#0F172A]',
                  isToday && !isFuture ? 'bg-[#22C55E]/5' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday ? 'bg-[#22C55E] font-bold text-[#020617]' : 'text-[#94A3B8]',
                  ].join(' ')}
                >
                  {day}
                </span>
                {workDay && (
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: LOCATION_COLORS[workDay.location] }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 shadow-2xl">
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-[#F8FAFC]">
                {selectedWorkDay ? 'Jour enregistré' : 'Ajouter un jour'}
              </h3>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <p className="mb-5 text-sm font-medium text-[#22C55E]">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {selectedWorkDay ? (
              /* ---- Existing day: show details + delete ---- */
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1E293B] bg-[#020617] p-4 space-y-3">
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-[#64748B]">Lieu de travail</p>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: LOCATION_COLORS[selectedWorkDay.location] }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: LOCATION_COLORS[selectedWorkDay.location] }}
                      />
                      {LOCATION_LABELS[selectedWorkDay.location]}
                    </span>
                  </div>
                  {selectedWorkDay.notes && (
                    <div>
                      <p className="mb-0.5 text-xs font-medium text-[#64748B]">Notes</p>
                      <p className="text-sm text-[#94A3B8]">{selectedWorkDay.notes}</p>
                    </div>
                  )}
                </div>

                {error && <p className="text-sm text-[#EF4444]">{error}</p>}

                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EF4444]/30 py-2.5 text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  {submitting ? 'Suppression…' : 'Supprimer ce jour'}
                </button>
              </div>
            ) : (
              /* ---- New day: add form ---- */
              <form onSubmit={handleAdd} className="space-y-4">
                <input type="hidden" name="work_date" value={selectedDate} />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B]" htmlFor="corridor_id">
                    Corridor frontalier
                  </label>
                  <select
                    id="corridor_id"
                    name="corridor_id"
                    required
                    className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2.5 text-sm text-[#F8FAFC] focus:border-[#22C55E] focus:outline-none cursor-pointer"
                  >
                    <option value="">Sélectionner un corridor…</option>
                    {corridors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (seuil : {c.threshold_days} j)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-[#64748B]">Lieu de travail</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'home_country' as Location, label: 'France', sub: 'Télétravail', color: '#22C55E' },
                      { value: 'work_country' as Location, label: "Pays d'emploi", sub: 'Présentiel', color: '#3B82F6' },
                      { value: 'third_country' as Location, label: 'Pays tiers', sub: 'Autre', color: '#94A3B8' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLocation(opt.value)}
                        className={[
                          'flex flex-col items-center rounded-lg border p-2.5 text-center transition-colors duration-150 cursor-pointer',
                          location === opt.value
                            ? 'border-[#22C55E] bg-[#22C55E]/10'
                            : 'border-[#1E293B] hover:border-[#334155]',
                        ].join(' ')}
                      >
                        <span
                          className="mb-1 h-2 w-2 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="text-xs font-medium text-[#F8FAFC] leading-tight">{opt.label}</span>
                        <span className="text-[10px] text-[#64748B]">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B]" htmlFor="notes">
                    Notes <span className="text-[#334155]">(optionnel)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="Réunion client, formation, déplacement…"
                    className="w-full resize-none rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>

                {error && <p className="text-sm text-[#EF4444]">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#22C55E] py-2.5 text-sm font-semibold text-[#020617] hover:bg-[#16A34A] transition-colors duration-150 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement…' : 'Enregistrer ce jour →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
