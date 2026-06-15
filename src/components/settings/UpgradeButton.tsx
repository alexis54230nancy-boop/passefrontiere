'use client'

import { useState } from 'react'

interface UpgradeButtonProps {
  plan: 'solo' | 'pro'
  className?: string
}

const PLAN_LABELS = {
  solo: 'Passer à Solo — 7,99 €/mois',
  pro: 'Passer à Pro — 14,99 €/mois',
}

export function UpgradeButton({ plan, className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      alert('Erreur lors de la redirection vers le paiement. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        className ??
        'rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-[#020617] hover:bg-[#16A34A] transition-colors duration-150 cursor-pointer disabled:opacity-50'
      }
    >
      {loading ? 'Redirection…' : PLAN_LABELS[plan]}
    </button>
  )
}
