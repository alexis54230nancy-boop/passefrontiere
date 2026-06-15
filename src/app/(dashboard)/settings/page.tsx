import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { UpgradeButton } from '@/components/settings/UpgradeButton'
import type { Profile } from '@/lib/types/database'

export const metadata = { title: 'Paramètres — PasseFrontière' }

interface Props {
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const profile = profileRaw as Profile | null
  const plan = profile?.subscription_status ?? 'free'

  const params = await searchParams
  const paymentSuccess = params.success === 'true'
  const paymentCanceled = params.canceled === 'true'

  const planConfig: Record<string, { label: string; color: string; features: string[] }> = {
    free: {
      label: 'Gratuit',
      color: '#64748B',
      features: ['1 corridor actif', 'Suivi annuel des jours', 'Tableau de bord'],
    },
    pro: {
      label: 'Solo',
      color: '#22C55E',
      features: ['1 corridor complet', 'Alertes email & push', 'Export PDF annuel', 'Assistant IA'],
    },
    enterprise: {
      label: 'Pro',
      color: '#A855F7',
      features: ['Tous les corridors', 'Multi-employeurs', 'Assistant IA avancé', 'Historique illimité'],
    },
  }

  const currentPlan = planConfig[plan] ?? planConfig.free

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Paramètres</h1>
        <p className="mt-1 text-sm text-[#64748B]">Gérez votre compte et votre abonnement</p>
      </div>

      {/* Payment feedback banners */}
      {paymentSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3">
          <span className="text-[#22C55E]">✓</span>
          <p className="text-sm font-medium text-[#22C55E]">
            Paiement confirmé ! Votre abonnement est maintenant actif.
          </p>
        </div>
      )}
      {paymentCanceled && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3">
          <span className="text-[#F59E0B]">⚠</span>
          <p className="text-sm font-medium text-[#F59E0B]">
            Paiement annulé. Votre abonnement n&apos;a pas été modifié.
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Profile section */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
          <h2 className="mb-5 text-base font-semibold text-[#F8FAFC]">Profil</h2>
          <ProfileForm profile={profile} />
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6">
          <h2 className="mb-5 text-base font-semibold text-[#F8FAFC]">Abonnement</h2>

          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">Plan actuel</p>
              <p className="mt-1 text-xl font-bold" style={{ color: currentPlan.color }}>
                {currentPlan.label}
              </p>
            </div>
            {plan === 'free' && (
              <div className="flex flex-col items-end gap-2 sm:flex-row">
                <UpgradeButton plan="solo" />
                <UpgradeButton
                  plan="pro"
                  className="rounded-lg border border-[#A855F7]/30 bg-transparent px-4 py-2 text-sm font-semibold text-[#A855F7] hover:bg-[#A855F7]/10 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#020617] p-4">
            <p className="mb-2 text-xs font-medium text-[#94A3B8]">Inclus dans votre plan :</p>
            <ul className="space-y-1.5">
              {currentPlan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#64748B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {plan === 'free' && (
            <div className="mt-4 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-4">
              <p className="text-sm text-[#94A3B8]">
                <span className="font-semibold text-[#22C55E]">Solo à 7,99 €/mois</span> — alertes automatiques,
                export PDF, assistant IA inclus.{' '}
                <span className="font-semibold text-[#A855F7]">Pro à 14,99 €/mois</span> — tous les corridors,
                multi-employeurs, historique illimité.
              </p>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-6">
          <h2 className="mb-2 text-base font-semibold text-[#F8FAFC]">Zone de danger</h2>
          <p className="mb-4 text-sm text-[#64748B]">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
          </p>
          <button
            disabled
            className="cursor-not-allowed rounded-lg border border-[#EF4444]/30 px-4 py-2 text-sm font-medium text-[#EF4444] opacity-50"
            title="Contactez support@passefrontiere.fr"
          >
            Supprimer mon compte
          </button>
          <p className="mt-2 text-xs text-[#334155]">
            Pour supprimer votre compte, contactez support@passefrontiere.fr
          </p>
        </div>
      </div>
    </div>
  )
}
