'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/10">
            <MapPin className="h-6 w-6 text-[#22C55E]" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">PasseFrontière</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-8">
          <h2 className="mb-1 text-lg font-semibold text-[#F8FAFC]">Connexion</h2>
          <p className="mb-6 text-sm text-[#64748B]">Accédez à votre espace frontalier</p>

          {error && (
            <div className="mb-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#1E293B] bg-[#020617] px-4 py-2.5 pr-10 text-sm text-[#F8FAFC] placeholder-[#334155] outline-none transition-colors duration-150 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] cursor-pointer"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    : <Eye className="h-4 w-4" strokeWidth={1.75} />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#22C55E] py-2.5 text-sm font-semibold text-[#020617] transition-colors duration-150 hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-[#22C55E] hover:underline cursor-pointer">
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}
