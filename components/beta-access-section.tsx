'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowRight, Check } from 'lucide-react'

const TOTAL_SLOTS = 100
const TAKEN_SLOTS = 87

const benefits = [
  {
    bold: 'Clé API en 72h ouvrées',
    desc: '— 1 M tokens offerts sur votre cas d\'usage',
  },
  {
    bold: 'Canal Slack privé',
    desc: '— accès direct à une équipe d\'ingénieurs IA',
  },
  {
    bold: 'Influence produit',
    desc: '— vos retours façonnent la roadmap et les politiques de détection',
  },
  {
    bold: 'Tarif early-access garanti',
    desc: '— conditions bêta maintenues au lancement',
  },
  {
    bold: 'Badge early-access numéroté',
    desc: `— de #001 à #100`,
  },
  {
    bold: 'Aucun spam',
    desc: '— Réponse sous 72h ouvrées.',
  },
  {
    bold: 'RGPD-compliant',
    desc: `— Données traitées en France`,
  }
]

const stackOptions = ['Python', 'Node.js', 'Go', 'Java', 'Rust', 'PHP', '.NET', 'Autre']
const llmOptions = ['OpenAI', 'Anthropic', 'Mistral', 'Gemini', 'Llama / local', 'Aucun']

export function BetaAccessSection() {
  const [selectedStack, setSelectedStack] = useState<string[]>([])
  const [selectedLlm, setSelectedLlm] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const toggleItem = (
    item: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const remaining = TOTAL_SLOTS - TAKEN_SLOTS
  const pct = Math.round((TAKEN_SLOTS / TOTAL_SLOTS) * 100)

  return (
    <section
      id="beta"
      className="snap-start min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 bg-muted/10"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section label */}

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start ">
          {/* ── LEFT ── */}
          <div className="py-16">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
              Accès limité à {TOTAL_SLOTS} équipes.{' '}
              {/* <span className="text-primary">{TAKEN_SLOTS} déjà prises.</span> */}
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              Testez DATAPRIVATE sur vos cas d'usage réels, avec vos données, pendant 30 jours. Sans engagement commercial.
            </p>

            <b>Que quelques places disponibles !</b>
            {/* Scarcity bar
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {remaining} places restantes
                </span>
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  #{String(TAKEN_SLOTS).padStart(3, '0')} / {TOTAL_SLOTS}
                </span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div> */}

            {/* Benefits */}
            <ul className="space-y-5 mt-10">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    <span className="font-bold">{b.bold}</span>{' '}
                    <span className="text-muted-foreground">{b.desc}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* ── RIGHT — Form card ── */}
          <div className="bg-card border border-border rounded-[1rem] p-6 shadow-[0_0_50px_-12px_rgba(var(--primary),0.08)]">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[420px] text-center gap-6"
              >
                <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center">
                  <Check className="w-7 h-7" strokeWidth={3} />
                </div>
                {/* <div>
                  <h3 className="text-xl font-black mb-2">Demande envoyée !</h3>
                  <p className="text-muted-foreground text-sm">
                    Réponse sous 72h ouvrées. Données traitées en France · RGPD-compliant.
                  </p>
                </div> */}
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-extrabold text-muted-foreground tracking-widest uppercase">
                    Demande d'accès bêta
                  </span>
                  {/* <span className="text-xs font-bold text-primary tabular-nums">
                    #{String(TAKEN_SLOTS).padStart(3, '0')} / {TOTAL_SLOTS}
                  </span> */}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Email professionnel <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@entreprise.fr"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 transition-colors"
                    />
                  </div>

                  {/* Nom & Fonction */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Nom &amp; Fonction <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jean Dupont · Lead Backend"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 transition-colors"
                    />
                  </div>

                  {/* Entreprise */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Entreprise · Taille
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Corp · ~500 employés"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 transition-colors"
                    />
                  </div>

                  {/* Stack */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Stack principale <span className="text-primary">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {stackOptions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleItem(s, selectedStack, setSelectedStack)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[40px]',
                            selectedStack.includes(s)
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LLM */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      LLM actuellement utilisés
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {llmOptions.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => toggleItem(l, selectedLlm, setSelectedLlm)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 min-h-[40px]',
                            selectedLlm.includes(l)
                              ? 'bg-foreground text-background border-foreground'
                              : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cas d'usage */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Cas d'usage visé{' '}
                      <span className="normal-case font-normal">(optionnel mais utile)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="clients contenant des PII, générer des synthèses de dossiers médicaux, copilote interne sur code propriétaire..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 transition-colors resize-none"
                    />
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    className="w-full h-13 rounded-xl bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 py-4"
                  >
                    Rejoindre la bêta
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
                    Aucun spam. Réponse sous 72h ouvrées.
                    <br />
                    Données traitées en France · RGPD-compliant.
                  </p> */}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
