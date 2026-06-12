'use client'

import { cn } from '@/lib/utils'

const infraCards = [
  {
    span: 'col-span-2',
    label: 'Déploiement',
    title: 'Cloud · Souverain · On-Prem · Air-Gap',
    desc: "Votre infrastructure, pas la nôtre. Compatible OVHcloud, Outscale, Numspot. Déploiement on-premise sans dépendance tierce. Mode air-gap pour environnements classifiés.",
    tags: [],
  },
  {
    span: 'col-span-1',
    label: 'Latence P95',
    title: '< 500\u202fms',
    titleSmall: 'ms',
    desc: "Ajout imperceptible. Mesuré en production sur pipelines PII complexes.",
    tags: [],
  },
  {
    span: 'col-span-1',
    label: 'Authentification',
    title: 'mTLS + OIDC',
    desc: "Clés API rotatives. SSO entreprise. Politique par équipe.",
    tags: [],
  },
  {
    span: 'col-span-1',
    label: 'Rétention données',
    title: '0 · zéro',
    desc: "Aucune donnée sensible persistée. Traitement en mémoire, purge immédiate.",
    tags: [],
  },
  {
    span: 'col-span-1',
    label: 'Journalisation',
    title: 'SIEM-ready',
    desc: "Logs inaltérables, horodatés. Export Splunk / Elastic / Sentinel natif.",
    tags: [],
  },
  {
    span: 'col-span-2',
    label: 'Providers supportés',
    title: 'OpenAI · Anthropic · Mistral · Gemini · Llama · vLLM',
    desc: '',
    tags: ['gpt-4o', 'claude-sonnet-4-5', 'mistral-large', 'gemini-2.5', 'llama-3.3', 'Ollama', 'HuggingFace', 'self-hosted'],
  },
  {
    span: 'col-span-1',
    label: 'Conformité & Référentiels',
    title: 'RGPD · AI Act · NIS2 · DORA',
    desc: '',
    tags: ['ANSSI-compatible', 'SecNumCloud (en cours)', 'HDS (cible 2026)', 'ISO 27001 (cible)'],
  },
]

export function InfrastructureSection() {
  return (
    <section
      id="pourquoi"
      className="snap-start min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Heading */}
        <div className="text-start mb-14">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
            Traité comme une brique de sécurité.{' '}
            <span className="text-primary">Parce que c'en est une.</span>
          </h2>
          <p className="px-4 text-lg sm:text-xl text-muted-foreground max-w-6xl mx-auto">
            Une API qui anonymise des données sensibles doit elle-même passer la revue RSSI.
            DATAPRIVATE est conçu avec les standards d'un équipement de sécurité, pas d'un wrapper Python.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {infraCards.map((card, i) => (
            <div
              key={i}
              className={cn(
                'bg-card border border-border rounded-2xl p-6 hover:border-foreground/30 transition-all duration-300 group',
                // On large screens, respect column spans
                card.span === 'col-span-2' ? 'lg:col-span-2' : 'lg:col-span-1'
              )}
            >
              {/* Card label */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <span className="text-primary/60">+</span>
                {card.label}
              </p>

              {/* Card title */}
              <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight mb-3 group-hover:text-primary transition-colors duration-200">
                {card.title}
              </h3>

              {/* Description */}
              {card.desc && (
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              )}

              {/* Tags */}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
