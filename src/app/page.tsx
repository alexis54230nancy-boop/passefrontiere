'use client'

import { useState } from 'react'
import Link from 'next/link'
import s from './landing.module.css'
import { joinWaitlist } from '@/lib/actions/waitlist'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [corridor, setCorridor] = useState('')
  const [problem, setProblem] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit() {
    setFormError(null)
    if (!email || !email.includes('@')) {
      setFormError('Veuillez saisir un email valide.')
      return
    }
    if (!corridor) {
      setFormError('Veuillez sélectionner votre corridor frontalier.')
      return
    }
    setLoading(true)
    const result = await joinWaitlist({ email, corridor, problem })
    setLoading(false)
    if (result?.error) {
      setFormError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className={s.page}>
      {/* NAV */}
      <nav className={s.nav}>
        <span className={s.logo}>Passe<span>Frontière</span></span>
        <a href="#rejoindre" className={s.ctaNav}>Rejoindre la liste</a>
      </nav>

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroBadge}>
            <span className={s.dot} />
            Bientôt disponible — Rejoignez les premiers
          </div>

          <h1 className={s.h1}>
            Vos jours frontaliers,<br />
            <em>sous contrôle enfin.</em>
          </h1>

          <p className={s.heroSub}>
            PasseFrontière suit automatiquement vos jours travaillés, vous alerte avant les
            seuils fiscaux et centralise toutes vos démarches transfrontalières.
          </p>

          {/* THRESHOLD PILLS */}
          <div className={s.ticker}>
            {[
              { val: '19 j', label: '🇫🇷 → 🇱🇺 Luxembourg' },
              { val: '45 j', label: '🇫🇷 → 🇨🇭 Suisse' },
              { val: '45 j', label: '🇫🇷 → 🇩🇪 Allemagne' },
              { val: '24 j', label: '🇫🇷 → 🇧🇪 Belgique' },
            ].map((t) => (
              <div key={t.label} className={s.tick}>
                <div className={s.tickVal}>{t.val}</div>
                <div className={s.tickLabel}>{t.label}</div>
              </div>
            ))}
          </div>

          {/* WAITLIST FORM */}
          <div className={s.formCard} id="rejoindre">
            {submitted ? (
              <div className={s.successState}>
                <div className={s.successIcon}>✅</div>
                <h3>Vous êtes sur la liste !</h3>
                <p>On vous contacte en premier dès l&apos;ouverture de la bêta.<br />Merci de nous faire confiance.</p>
              </div>
            ) : (
              <>
                <div className={s.formTitle}>Rejoindre la liste d&apos;attente</div>
                <p className={s.formSub}>Accès prioritaire + tarif bêta. Gratuit, sans engagement.</p>

                <div className={s.formRow}>
                  <label className={s.formLabel} htmlFor="email">Email professionnel</label>
                  <input
                    id="email"
                    type="email"
                    className={s.formInput}
                    placeholder="vous@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={s.formRow}>
                  <label className={s.formLabel}>Votre corridor frontalier</label>
                  <div className={s.corridorGrid}>
                    {[
                      { id: 'lux', value: 'Luxembourg', flag: '🇱🇺', label: 'France → Luxembourg' },
                      { id: 'ch',  value: 'Suisse',     flag: '🇨🇭', label: 'France → Suisse' },
                      { id: 'de',  value: 'Allemagne',  flag: '🇩🇪', label: 'France → Allemagne' },
                      { id: 'be',  value: 'Belgique',   flag: '🇧🇪', label: 'France → Belgique' },
                    ].map((c) => (
                      <div key={c.id} className={s.corridorOption}>
                        <input
                          type="radio"
                          name="corridor"
                          id={c.id}
                          value={c.value}
                          checked={corridor === c.value}
                          onChange={() => setCorridor(c.value)}
                        />
                        <label htmlFor={c.id} className={s.corridorLabel}>
                          <span>{c.flag}</span>
                          {c.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={s.formRow}>
                  <label className={s.formLabel} htmlFor="problem">
                    Votre principale galère en tant que frontalier
                  </label>
                  <textarea
                    id="problem"
                    className={s.formTextarea}
                    placeholder="Ex : je sais jamais combien de jours de télétravail il me reste…"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                  />
                </div>

                {formError && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '8px' }}>
                    {formError}
                  </p>
                )}

                <button
                  className={s.submitBtn}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Envoi…' : 'Rejoindre la liste prioritaire →'}
                </button>
                <p className={s.formNote}>
                  🔒 Vos données ne sont pas revendues. Désinscription en un clic.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={s.stats}>
        <div className={s.statsInner}>
          {[
            { num: '400 000+', desc: 'frontaliers français concernés' },
            { num: '4 pays',   desc: 'corridors couverts au lancement' },
            { num: '0 Excel',  desc: 'plus besoin de tout gérer à la main' },
            { num: '100%',     desc: 'automatique et mis à jour' },
          ].map((stat) => (
            <div key={stat.num}>
              <div className={s.statNum}>{stat.num}</div>
              <div className={s.statDesc}>{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.eyebrow}>Le problème</div>
          <h2 className={s.h2}>Être frontalier, c&apos;est gérer l&apos;invisible.</h2>
          <p className={s.sectionLead}>
            Chaque jour travaillé hors de votre pays d&apos;emploi compte. Dépasser le seuil,
            c&apos;est un redressement fiscal, une perte d&apos;allocations, des mois de galère administrative.
          </p>
          <div className={s.painGrid}>
            {[
              { icon: '📅', title: 'Comptage manuel fastidieux', desc: "Excel, agenda papier, notes sur le téléphone… personne n'a un système fiable pour suivre ses jours." },
              { icon: '⚠️', title: 'Risque de dépassement silencieux', desc: "On dépasse la règle des 19 jours sans s'en rendre compte. On le découvre au contrôle ou au redressement." },
              { icon: '🔍', title: 'Infos éparpillées partout', desc: "Sites gouvernementaux, forums, expert-comptable… les règles changent et personne ne les centralise." },
              { icon: '💸', title: 'Expert-comptable trop cher', desc: "Payer 200-400€ pour une question basique sur sa résidence fiscale, c'est inadmissible." },
            ].map((p) => (
              <div key={p.title} className={s.painCard}>
                <div className={s.painIcon}>{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`${s.section} ${s.hiw}`}>
        <div className={s.sectionInner}>
          <div className={s.eyebrow}>Comment ça marche</div>
          <h2 className={s.h2}>Simple. Automatique. Fiable.</h2>
          <p className={s.sectionLead}>Trois étapes pour ne plus jamais vous inquiéter de vos jours frontaliers.</p>
          <div className={s.steps}>
            {[
              { n: '1', title: 'Choisissez votre corridor', desc: 'France-Luxembourg, France-Suisse, France-Allemagne ou France-Belgique. Les règles sont déjà configurées.' },
              { n: '2', title: 'Saisissez vos jours', desc: 'Télétravail, déplacements, congés — en 10 secondes par jour depuis votre téléphone ou ordinateur.' },
              { n: '3', title: 'Recevez vos alertes', desc: "À 80%, 95% et 100% du seuil, vous êtes prévenu par email ou notification. Vous agissez avant qu'il soit trop tard." },
              { n: '4', title: 'Exportez votre suivi', desc: "Un PDF propre et certifié, prêt pour votre expert-comptable ou l'administration fiscale." },
            ].map((step) => (
              <div key={step.n} className={s.step}>
                <div className={s.stepNum}>{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORRIDORS */}
      <section className={s.section}>
        <div className={s.sectionInner}>
          <div className={s.eyebrow}>Corridors couverts</div>
          <h2 className={s.h2}>Votre frontière, nos règles.</h2>
          <p className={s.sectionLead}>
            PasseFrontière connaît les spécificités fiscales de chaque corridor.
            Pas de configuration, pas d&apos;erreur.
          </p>
          <div className={s.corridorCards}>
            {[
              { flags: '🇫🇷🇱🇺', route: 'France → Luxembourg', rule: 'Règle des 19 jours', count: '~120 000 frontaliers' },
              { flags: '🇫🇷🇨🇭', route: 'France → Suisse',     rule: 'Règle des 45 jours', count: '~200 000 frontaliers' },
              { flags: '🇫🇷🇩🇪', route: 'France → Allemagne',  rule: 'Règle des 45 jours', count: '~50 000 frontaliers' },
              { flags: '🇫🇷🇧🇪', route: 'France → Belgique',   rule: 'Règle des 24 jours', count: '~40 000 frontaliers' },
              { flags: '🇫🇷🇦🇩', route: 'France → Andorre',    rule: 'Résidence fiscale stricte', count: '~5 000 frontaliers', soon: true },
            ].map((c) => (
              <div key={c.route} className={s.corridorCard}>
                <div className={s.flags}>{c.flags}</div>
                <div className={s.route}>{c.route}</div>
                <div className={s.rule}>{c.rule}</div>
                <div className={s.count}>{c.count}</div>
                {c.soon && <span className={s.badgeSoon}>Bientôt</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={`${s.section} ${s.hiw}`}>
        <div className={s.sectionInner} style={{ textAlign: 'center' }}>
          <div className={s.eyebrow}>Tarifs</div>
          <h2 className={s.h2}>Moins cher qu&apos;une heure d&apos;expert-comptable.</h2>
          <p className={s.sectionLead} style={{ margin: '0 auto 40px' }}>
            Tarifs bêta pour les premiers inscrits. Prix définitifs à confirmer selon vos retours.
          </p>
          <div className={s.pricingGrid}>
            <div className={s.priceCard}>
              <div className={s.planName}>Gratuit</div>
              <div className={s.priceAmount}>0€</div>
              <div className={s.pricePeriod}>pour toujours</div>
              <ul className={s.priceFeatures}>
                <li>1 corridor</li>
                <li>Suivi basique des jours</li>
                <li>Tableau de bord simple</li>
              </ul>
            </div>
            <div className={`${s.priceCard} ${s.featured}`}>
              <div className={s.priceBadge}>⭐ Le plus populaire</div>
              <div className={s.planName}>Solo</div>
              <div className={s.priceAmount}>7,99€</div>
              <div className={s.pricePeriod}>par mois · sans engagement</div>
              <ul className={s.priceFeatures}>
                <li>1 corridor complet</li>
                <li>Alertes email &amp; push</li>
                <li>Export PDF annuel</li>
                <li>Assistant IA inclus</li>
              </ul>
            </div>
            <div className={s.priceCard}>
              <div className={s.planName}>Pro</div>
              <div className={s.priceAmount}>14,99€</div>
              <div className={s.pricePeriod}>par mois · sans engagement</div>
              <ul className={s.priceFeatures}>
                <li>Tous les corridors</li>
                <li>Multi-employeurs</li>
                <li>Assistant IA avancé</li>
                <li>Historique illimité</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={s.finalCta}>
        <h2 className={s.h2}>Ne ratez plus jamais un seuil fiscal.</h2>
        <p>
          Rejoignez des centaines de frontaliers qui attendent PasseFrontière.<br />
          Accès bêta prioritaire, tarif réduit garanti.
        </p>
        <a href="#rejoindre" className={s.ctaBtn}>Rejoindre la liste maintenant →</a>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        © 2026 PasseFrontière · Outil de suivi uniquement · Ne constitue pas un conseil fiscal ·{' '}
        <a href="#">Confidentialité</a>
        {' '}·{' '}
        <Link href="/login" style={{ color: 'inherit' }}>Connexion</Link>
      </footer>
    </div>
  )
}
