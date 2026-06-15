'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import type { Profile } from '@/lib/types/database'

export function ProfileForm({ profile }: { profile: Profile | null; email?: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="mb-1.5 block text-xs font-medium text-[#64748B]"
          htmlFor="full_name"
        >
          Nom complet
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={profile?.full_name ?? ''}
          placeholder="Votre nom complet"
          className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#334155] focus:border-[#22C55E] focus:outline-none transition-colors"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-[#64748B]">Email</p>
        <p className="rounded-lg border border-[#1E293B] bg-[#020617]/50 px-3 py-2.5 text-sm text-[#64748B]">
          {profile?.email}
          <span className="ml-2 text-xs text-[#334155]">(non modifiable)</span>
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-[#64748B]">Membre depuis</p>
        <p className="text-sm text-[#94A3B8]">
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : '—'}
        </p>
      </div>

      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      {success && (
        <p className="text-sm text-[#22C55E]">Profil mis à jour avec succès ✓</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#22C55E] px-5 py-2 text-sm font-semibold text-[#020617] hover:bg-[#16A34A] transition-colors duration-150 cursor-pointer disabled:opacity-50"
      >
        {isPending ? 'Enregistrement…' : 'Sauvegarder'}
      </button>
    </form>
  )
}
