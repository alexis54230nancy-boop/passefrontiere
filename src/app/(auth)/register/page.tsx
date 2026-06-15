'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !password) { setError('Remplissez tous les champs.'); return }
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#22C55E]/30 bg-[#0F172A] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/10">
            <MapPin className="h-6 w-6 text-[#22C55E]" strokeWidth={2.5} />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[#F8FAFC]">Vérifiez votre email</h2>
          <p className="text-sm text-[#64748B]">
            Un lien de confirmation a été envoyé à <strong className="text-[#94A3B8]">{email}</strong>.
            Cliquez sur le lien pour activer votre compte.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-[#22C55E] hover:underline cursor-pointer"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/10">
            <MapPin className="h-6 w-6 text-[#22C55E]" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">PasseFrontière</h1>
        </div>

        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-8">
          <h2 className="mb-1 text-lg font-semibold text-[#F8FAFC]">Créer un compte</h2>
          <p className="mb-6 text-sm text-[#64748B]">Gratuit — aucune carte bancaire requise</p>

          {error && (
            <div className="mb-4 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                Nom complet
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#334155] outline-none transition-colors duration-150 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#334155] outline-none transition-colors duration-150 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#334155] outline-none transition-colors duration-150 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#22C55E] py-2.5 text-sm font-semibold text-[#020617] transition-colors duration-150 hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#22C55E] hover:underline cursor-pointer">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
