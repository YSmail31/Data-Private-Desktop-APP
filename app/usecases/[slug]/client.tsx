'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PricingSection } from '@/components/pricing-section'
import { BetaAccessSection } from '@/components/beta-access-section'
import {
  ArrowRight, Shield, Check, Sun, Moon, Menu, X, ChevronRight,
  FileText, Gavel, Calculator, Heart, Users, Lock, ArrowLeft,
  Sparkles, Bot, Copy
} from 'lucide-react'
import Link from 'next/link'

// ─── Use Case Data ─────────────────────────────────────────────────────────────
const usecaseData: Record<string, {
  slug: string
  label: string
  icon: React.ElementType
  gradient: string
  hero: { title: string; subtitle: string; desc: string }
  examples: Array<{ title: string; before: string; after: string; entities: string[] }>
  benefits: string[]
  seoTitle: string
  seoDesc: string
  llmDemo: { docTitle: string; anonymizedSnippet: string; model: string; response: string[] }
}> = {
  juridique: {
    slug: 'juridique',
    label: 'Documents Juridiques',
    icon: Gavel,
    gradient: 'from-blue-600 to-indigo-700',
    seoTitle: 'Anonymisation Documents Juridiques | Data Private',
    seoDesc: 'Protégez vos contrats, accords NDA et documents juridiques sensibles avant de les traiter avec des LLMs. Conforme RGPD.',
    hero: {
      title: 'Anonymisez vos documents juridiques',
      subtitle: 'avant de les confier aux LLMs',
      desc: 'Contrats, NDA, accords de confidentialité — protégez les données personnelles de vos clients et partenaires avant toute analyse par l\'IA. Zéro risque de fuite, 100% conforme RGPD.'
    },
    examples: [
      {
        title: 'Contrat de prestation',
        before: 'Entre la société Acme Corp (SIRET 123 456 789 00012) représentée par Jean Dupont (PDG), et Monsieur Marc Martin, né le 14/03/1985, domicilié au 12 rue des Acacias, 75012 Paris.',
        after: 'Entre la société COMPANY_1 (SIRET SIRET_1) représentée par PERSON_1 (PDG), et Monsieur PERSON_2, né le DATE_1, domicilié au ADDRESS_1.',
        entities: ['COMPANY', 'SIRET', 'PERSON', 'DATE', 'ADDRESS']
      },
      {
        title: 'Accord NDA',
        before: 'Sophie Laurent (sophie.laurent@startup.io, +33 6 12 34 56 78) s\'engage à ne pas divulguer les informations confidentielles d\'InnovateTech SAS.',
        after: 'PERSON_1 (EMAIL_1, PHONE_1) s\'engage à ne pas divulguer les informations confidentielles de COMPANY_1.',
        entities: ['PERSON', 'EMAIL', 'PHONE', 'COMPANY']
      }
    ],
    benefits: [
      'Protection des données client dans les contrats',
      'Anonymisation des parties signataires (SIRET, RCS…)',
      'Sécurisation des correspondances juridiques',
      'Conformité RGPD pour le traitement IA de documents',
    ],
    llmDemo: {
      docTitle: 'Contrat de prestation — anonymisé',
      anonymizedSnippet: 'Entre la société COMPANY_1 (SIRET SIRET_1) représentée par PERSON_1 (PDG), et Monsieur PERSON_2, né le DATE_1, domicilié au ADDRESS_1.',
      model: 'GPT-4o',
      response: [
        '**Analyse du contrat de prestation**',
        'Ce contrat engage deux parties : une société (COMPANY_1) représentée par son dirigeant (PERSON_1) et un prestataire individuel (PERSON_2).',
        '**Points clés identifiés :**',
        '• Identification légale : la référence SIRET est présente et vérifiable — pensez à confirmer l\'immatriculation RCS.',
        '• Clause de domiciliation : l\'adresse du prestataire (ADDRESS_1) devra figurer sur la facture conforme à l\'article L441-9 du Code de commerce.',
        '• Date de naissance mentionnée (DATE_1) : non nécessaire dans un contrat commercial — recommandation de suppression pour allégement RGPD.',
        '**Risques juridiques détectés :** aucune clause de résiliation anticipée visible dans l\'extrait fourni.',
      ]
    }
  },
  contentieux: {
    slug: 'contentieux',
    label: 'Mises en Demeure',
    icon: FileText,
    gradient: 'from-orange-500 to-red-600',
    seoTitle: 'Anonymisation Contentieux & Mises en Demeure | Data Private',
    seoDesc: 'Anonymisez lettres de relance, injonctions et documents de contentieux avec Data Private. Protection RGPD automatique.',
    hero: {
      title: 'Protégez vos documents de contentieux',
      subtitle: 'sans compromettre vos dossiers',
      desc: 'Lettres de mise en demeure, procédures de recouvrement, dossiers de litiges — anonymisez les parties impliquées avant toute analyse IA. Gardez la stratégie, éliminez les risques.'
    },
    examples: [
      {
        title: 'Lettre de mise en demeure',
        before: 'Monsieur François Dubois, 34 avenue Victor Hugo, 69002 Lyon, est mis en demeure de régler la somme de 12 500€ due à Cabinet Martin & Associés (IBAN FR76 3000 4028...).',
        after: 'PERSON_1, ADDRESS_1, est mis en demeure de régler la somme de AMOUNT_1 due à COMPANY_1 (IBAN IBAN_1).',
        entities: ['PERSON', 'ADDRESS', 'AMOUNT', 'COMPANY', 'IBAN']
      },
      {
        title: 'Procédure de recouvrement',
        before: 'Suite à la créance impayée de M. Pierre Leroy (né 05/07/1972, N° SS 172 07 75 123 456 12), nous engageons une procédure judiciaire.',
        after: 'Suite à la créance impayée de PERSON_1 (né DATE_1, N° SS SSN_1), nous engageons une procédure judiciaire.',
        entities: ['PERSON', 'DATE', 'SSN']
      }
    ],
    benefits: [
      'Anonymisation des débiteurs et créanciers',
      'Protection des IBAN et données bancaires',
      'Sécurisation des pièces justificatives',
      'Traitement confidentiel des dossiers sensibles',
    ],
    llmDemo: {
      docTitle: 'Lettre de mise en demeure — anonymisée',
      anonymizedSnippet: 'PERSON_1, ADDRESS_1, est mis en demeure de régler la somme de AMOUNT_1 due à COMPANY_1 (IBAN IBAN_1).',
      model: 'Claude 3.5 Sonnet',
      response: [
        '**Analyse de la mise en demeure**',
        'Ce document constitue une lettre de mise en demeure formelle adressée à PERSON_1, lui intimant de régler une créance de AMOUNT_1.',
        '**Éléments de forme conformes :**',
        '• Identification des parties (PERSON_1 / COMPANY_1) : présente.',
        '• Référence bancaire (IBAN_1) communiquée pour le règlement : conforme.',
        '• Domiciliation du débiteur (ADDRESS_1) : mention obligatoire — présente.',
        '**Recommandation :** préciser le délai de règlement (généralement 8 jours) et la mention que passé ce délai, une procédure judiciaire sera engagée sans autre préavis.',
        '**Conformité RGPD :** les données sensibles ont été masquées — transmission à l\'IA sans risque de fuite.',
      ]
    }
  },
  comptabilite: {
    slug: 'comptabilite',
    label: 'Documents Comptables',
    icon: Calculator,
    gradient: 'from-emerald-500 to-teal-600',
    seoTitle: 'Anonymisation Documents Comptables | Data Private',
    seoDesc: 'Protégez vos factures, bulletins de paie et déclarations fiscales avant analyse IA. Conformité RGPD et sécurité financière.',
    hero: {
      title: 'Sécurisez vos documents financiers',
      subtitle: 'pour une analyse IA sans risque',
      desc: 'Factures, bulletins de paie, bilans comptables — vos données financières sont parmi les plus sensibles. Anonymisez automatiquement avant d\'utiliser ChatGPT ou Claude pour vos analyses.'
    },
    examples: [
      {
        title: 'Bulletin de paie',
        before: 'Employé: Marie Bernard (N° SS 278 04 69 123 456 78). Salaire brut: 3 850€. IBAN: FR76 1470 6000 9999 8765 4321 84. Entreprise: Tech Solutions SARL.',
        after: 'Employé: PERSON_1 (N° SS SSN_1). Salaire brut: SALARY_1. IBAN: IBAN_1. Entreprise: COMPANY_1.',
        entities: ['PERSON', 'SSN', 'SALARY', 'IBAN', 'COMPANY']
      },
      {
        title: 'Facture fournisseur',
        before: 'Facture émise par M. Antoine Moreau (TVA FR12 345 678 901) à Digitech Corp, 18 boulevard Haussmann 75009 Paris. Montant: 8 400€ TTC.',
        after: 'Facture émise par PERSON_1 (TVA TAX_ID_1) à COMPANY_1, ADDRESS_1. Montant: AMOUNT_1 TTC.',
        entities: ['PERSON', 'TAX_ID', 'COMPANY', 'ADDRESS', 'AMOUNT']
      }
    ],
    benefits: [
      'Protection des numéros de Sécurité Sociale',
      'Anonymisation des IBAN et données bancaires',
      'Sécurisation des bilans et rapports financiers',
      'Conformité fiscale et RGPD garantie',
    ],
    llmDemo: {
      docTitle: 'Bulletin de paie — anonymisé',
      anonymizedSnippet: 'Employé: PERSON_1 (N° SS SSN_1). Salaire brut: SALARY_1. IBAN: IBAN_1. Entreprise: COMPANY_1.',
      model: 'Gemini 1.5 Pro',
      response: [
        '**Analyse du bulletin de paie**',
        'Ce bulletin concerne un employé (PERSON_1) rattaché à l\'entreprise COMPANY_1 pour la période considérée.',
        '**Points de vigilance comptable :**',
        '• Le salaire brut (SALARY_1) devra être réconcilié avec le livre de paie mensuel et les déclarations DSN.',
        '• Le numéro de Sécurité Sociale (SSN_1) est masqué : vérification physique requise avant déclaration URSSAF.',
        '• L\'IBAN (IBAN_1) doit correspondre au RIB signé en dossier RH — aucune modification sans avenant.',
        '**Aucune anomalie de structure détectée.** Bulletin conforme au modèle légal en vigueur (décret n°2016-190).',
      ]
    }
  },
  medical: {
    slug: 'medical',
    label: 'Dossiers Médicaux',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    seoTitle: 'Anonymisation Dossiers Médicaux | Data Private',
    seoDesc: 'Protégez les données médicales de vos patients avant utilisation IA. Conformité RGPD et HDS. Hébergé en France.',
    hero: {
      title: 'Protégez les données médicales',
      subtitle: 'de vos patients avant l\'IA',
      desc: 'Comptes-rendus, ordonnances, résultats d\'analyses — les données de santé sont les plus protégées par la loi. Anonymisez-les automatiquement pour utiliser l\'IA médicale en toute conformité.'
    },
    examples: [
      {
        title: 'Compte-rendu médical',
        before: 'Patient: Isabelle Leclerc, née le 22/08/1978, N° SS 278 08 75 123 456 89. Médecin: Dr. Paul Renard. Diagnostic: Diabète type 2. Ordonnance: Metformine 850mg.',
        after: 'Patient: PERSON_1, née le DATE_1, N° SS SSN_1. Médecin: DOCTOR_1. Diagnostic: CONDITION_1. Ordonnance: MEDICATION_1.',
        entities: ['PERSON', 'DATE', 'SSN', 'DOCTOR', 'CONDITION', 'MEDICATION']
      },
      {
        title: 'Résultat d\'analyse',
        before: 'Résultat pour M. Thomas Girard (06 78 90 12 34, thomas.girard@email.fr), adressé au Dr. Claire Simon, CHU de Bordeaux. Glycémie à jeun: 1,26 g/L (positif).',
        after: 'Résultat pour PERSON_1 (PHONE_1, EMAIL_1), adressé à DOCTOR_1, HOSPITAL_1. Glycémie à jeun: VALUE_1 (positif).',
        entities: ['PERSON', 'PHONE', 'EMAIL', 'DOCTOR', 'HOSPITAL', 'VALUE']
      }
    ],
    benefits: [
      'Protection des données médicales sensibles (HDS)',
      'Anonymisation des identifiants patients',
      'Conformité RGPD et réglementation santé',
      'Sécurisation des échanges avec les LLMs médicaux',
    ],
    llmDemo: {
      docTitle: 'Compte-rendu médical — anonymisé',
      anonymizedSnippet: 'Patient: PERSON_1, née le DATE_1, N° SS SSN_1. Médecin: DOCTOR_1. Diagnostic: CONDITION_1. Ordonnance: MEDICATION_1.',
      model: 'GPT-4o',
      response: [
        '**Synthèse du compte-rendu médical**',
        'Ce document décrit un suivi médical pour un(e) patient(e) (PERSON_1) pris(e) en charge par DOCTOR_1.',
        '**Informations cliniques clés :**',
        '• Pathologie détectée : CONDITION_1 — pathologie chronique nécessitant un suivi régulier.',
        '• Traitement prescrit : MEDICATION_1 — vérifier les contre-indications et interactions médicamenteuses avec les antécédents du patient.',
        '• N° Sécurité Sociale (SSN_1) masqué : transmission sécurisée, aucune fuite de données de santé.',
        '**Recommandation IA :** planifier un bilan de suivi dans les 3 mois. Les données personnelles restent protégées tout au long de l\'analyse.',
      ]
    }
  },
  rh: {
    slug: 'rh',
    label: 'Ressources Humaines',
    icon: Users,
    gradient: 'from-violet-500 to-purple-600',
    seoTitle: 'Anonymisation Documents RH | Data Private',
    seoDesc: 'Anonymisez CV, contrats de travail et evaluations RH avant analyse IA. Protection RGPD des données de vos employés.',
    hero: {
      title: 'Anonymisez vos données RH',
      subtitle: 'pour sécuriser le recrutement IA',
      desc: 'CV, entretiens d\'embauche, évaluations annuelles, contrats de travail — vos équipes RH utilisent l\'IA quotidiennement. Protégez les données de vos candidats et employés automatiquement.'
    },
    examples: [
      {
        title: 'CV candidat',
        before: 'Alexia Fontaine, 28 ans, alexia.fontaine@gmail.com, +33 7 56 89 12 34. 12 rue du Moulin, 31000 Toulouse. LinkedIn: linkedin.com/in/alexia-fontaine.',
        after: 'PERSON_1, AGE_1, EMAIL_1, PHONE_1. ADDRESS_1. LinkedIn: SOCIAL_URL_1.',
        entities: ['PERSON', 'AGE', 'EMAIL', 'PHONE', 'ADDRESS', 'SOCIAL_URL']
      },
      {
        title: 'Entretien d\'évaluation',
        before: 'Évaluation de Lucas Martin (Matricule RH: EMP-2847), Manager: Sarah Dupuis. Salaire actuel: 52 000€. Objectif bonus: 8%. Prochaine revue: 15 mars 2025.',
        after: 'Évaluation de PERSON_1 (Matricule RH: EMP_ID_1), Manager: PERSON_2. Salaire actuel: SALARY_1. Objectif bonus: RATE_1. Prochaine revue: DATE_1.',
        entities: ['PERSON', 'EMP_ID', 'SALARY', 'RATE', 'DATE']
      }
    ],
    benefits: [
      'Anonymisation des CV pour la sélection IA',
      'Protection des données salariales confidentielles',
      'Sécurisation des évaluations de performance',
      'Conformité RGPD pour le traitement RH',
    ],
    llmDemo: {
      docTitle: 'Évaluation annuelle — anonymisée',
      anonymizedSnippet: 'Évaluation de PERSON_1 (Matricule RH: EMP_ID_1), Manager: PERSON_2. Salaire actuel: SALARY_1. Objectif bonus: RATE_1. Prochaine revue: DATE_1.',
      model: 'Claude 3.5 Sonnet',
      response: [
        '**Analyse de l\'entretien d\'évaluation**',
        'Ce document porte sur l\'évaluation annuelle de PERSON_1, supervisé(e) par PERSON_2.',
        '**Points saillants RH :**',
        '• Rémunération actuelle (SALARY_1) : à comparer avec la grille de salaires interne pour détecter un éventuel écart d\'équité.',
        '• Objectif de bonus (RATE_1) : cohérent avec la politique de rémunération variable si aligné sur les KPIs définis.',
        '• Prochaine revue (DATE_1) : à planifier dans l\'outil SIRH avec rappel automatique 30 jours avant.',
        '**Risque identifié :** aucune mention de plan de développement professionnel — recommandé pour conformité légale (entretien professionnel biennal, art. L6315-1 CT).',
      ]
    }
  },
  confidentiel: {
    slug: 'confidentiel',
    label: 'Documents Confidentiels',
    icon: Lock,
    gradient: 'from-slate-600 to-zinc-700',
    seoTitle: 'Anonymisation Documents Confidentiels | Data Private',
    seoDesc: 'Protégez vos correspondances privées, notes internes et stratégies d\'entreprise avant utilisation IA. Hébergé en France.',
    hero: {
      title: 'Protégez vos documents stratégiques',
      subtitle: 'avant l\'analyse par l\'IA',
      desc: 'Notes de direction, stratégies d\'entreprise, correspondances privées — vos informations les plus confidentielles méritent la meilleure protection. Utilisez l\'IA sans jamais exposer votre avantage concurrentiel.'
    },
    examples: [
      {
        title: 'Note de direction',
        before: 'Confidentiel — Projet Titan. CEO: Bernard Leconte (b.leconte@groupe-titan.fr). Acquisition cible: NovaTech (valorisation estimée 45M€). Décision finale: CA du 12/04/2025.',
        after: 'Confidentiel — Projet CODENAME_1. CEO: PERSON_1 (EMAIL_1). Acquisition cible: COMPANY_1 (valorisation estimée AMOUNT_1). Décision finale: EVENT_1 du DATE_1.',
        entities: ['CODENAME', 'PERSON', 'EMAIL', 'COMPANY', 'AMOUNT', 'DATE']
      },
      {
        title: 'Email stratégique',
        before: 'De: Pierre Moreau <p.moreau@conseil.fr> À: Julie Blanc <j.blanc@partenaire.com>. Sujet: Suite RDV lundi — Alliance commerciale avec Groupe Weber.',
        after: 'De: PERSON_1 <EMAIL_1> À: PERSON_2 <EMAIL_2>. Sujet: Suite RDV DATE_1 — Alliance commerciale avec COMPANY_1.',
        entities: ['PERSON', 'EMAIL', 'DATE', 'COMPANY']
      }
    ],
    benefits: [
      'Protection des secrets commerciaux',
      'Anonymisation des dirigeants et parties prenantes',
      'Sécurisation des stratégies M&A et partenariats',
      'Zéro fuite vers les serveurs tiers des LLMs',
    ],
    llmDemo: {
      docTitle: 'Note de direction — anonymisée',
      anonymizedSnippet: 'Confidentiel — Projet CODENAME_1. CEO: PERSON_1 (EMAIL_1). Acquisition cible: COMPANY_1 (valorisation estimée AMOUNT_1). Décision finale: EVENT_1 du DATE_1.',
      model: 'Gemini 1.5 Pro',
      response: [
        '**Synthèse de la note exécutive**',
        'Ce document confidentiel concerne un projet d\'acquisition stratégique (CODENAME_1) porté au niveau de la direction générale (PERSON_1).',
        '**Éléments stratégiques identifiés :**',
        '• Valorisation cible (AMOUNT_1) : à benchmarker avec les multiples sectoriels EV/EBITDA pour valider la cohérence du prix.',
        '• Décision finale prévue lors de l\'événement de gouvernance (EVENT_1) du DATE_1 — délai compatible avec une due diligence accélérée de 3 semaines.',
        '• Communication limitée : le niveau de confidentialité de ce document justifie une diffusion restreinte au comité exécutif uniquement.',
        '**Aucune donnée personnelle n\'a transitée vers l\'IA.** Avantage concurrentiel et identités des parties totalement protégés.',
      ]
    }
  }
}

const NAV_USE_CASES = [
  { slug: 'juridique', label: 'Documents Juridiques', icon: Gavel, gradient: 'from-blue-600 to-indigo-700' },
  { slug: 'contentieux', label: 'Mises en Demeure', icon: FileText, gradient: 'from-orange-500 to-red-600' },
  { slug: 'comptabilite', label: 'Documents Comptables', icon: Calculator, gradient: 'from-emerald-500 to-teal-600' },
  { slug: 'medical', label: 'Dossiers Médicaux', icon: Heart, gradient: 'from-rose-500 to-pink-600' },
  { slug: 'rh', label: 'Ressources Humaines', icon: Users, gradient: 'from-violet-500 to-purple-600' },
  { slug: 'confidentiel', label: 'Documents Confidentiels', icon: Lock, gradient: 'from-slate-600 to-zinc-700' },
]

interface Props { slug: string }

export default function UseCaseClientPage({ slug }: Props) {
  const data = usecaseData[slug]

  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [usecaseMenuOpen, setUsecaseMenuOpen] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(darkMode)
    if (darkMode) document.documentElement.classList.add('dark')
    window.scrollTo(0, 0)
  }, [])

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!data) {
    return (
      <div className={cn("min-h-screen bg-background text-foreground flex items-center justify-center", isDark && "dark")}>
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Page introuvable</h1>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  const Icon = data.icon
  const otherUsecases = Object.values(usecaseData).filter(u => u.slug !== slug)

  return (
    <div className={cn("min-h-screen", isDark && "dark")}>
      <div
        className="bg-background text-foreground transition-colors duration-500 h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollSnapType: 'y mandatory' }}
      >

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-xl border-b border-border">
          <div className="w-full mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
                <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
                <span className="font-bold text-2xl text-primary">Data Private</span>
                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/#comment-ca-marche" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comment ça marche</Link>
                <Link href="/#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Démo</Link>

                {/* Use Cases Dropdown */}
                <div className="relative" onMouseEnter={() => setUsecaseMenuOpen(true)} onMouseLeave={() => setUsecaseMenuOpen(false)}>
                  <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:text-foreground transition-colors">
                    Cas d'usage
                    <ChevronRight className={cn("w-3 h-3 transition-transform duration-200", usecaseMenuOpen && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {usecaseMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-68 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1.5">
                          {NAV_USE_CASES.map((uc) => {
                            const UcIcon = uc.icon
                            return (
                              <Link
                                key={uc.slug}
                                href={`/usecases/${uc.slug}`}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group",
                                  uc.slug === slug && "bg-muted/40"
                                )}
                              >
                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{uc.label}</span>
                                {uc.slug === slug && <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Actif</span>}
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link href="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
              </div>

              {/* Right side */}
              <div className="hidden md:flex items-center gap-3">
                <button onClick={toggleDarkMode} className="p-2.5 rounded-xl hover:bg-muted transition-all duration-300">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-foreground" />}
                </button>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">Connexion</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-foreground text-background hover:opacity-90 shadow-lg transition-all duration-300 border-none">
                    S'inscrire
                  </Button>
                </Link>
              </div>

              {/* Mobile button */}
              <button className="md:hidden p-2 hover:bg-muted rounded-xl text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background p-4">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cas d'usage</p>
                {NAV_USE_CASES.map((uc) => {
                  const UcIcon = uc.icon
                  return (
                    <Link key={uc.slug} href={`/usecases/${uc.slug}`} onClick={() => setMobileMenuOpen(false)}
                      className={cn("flex items-center gap-3 py-2 text-sm px-4", uc.slug === slug ? "text-foreground font-semibold" : "text-muted-foreground")}>

                      {uc.label}
                    </Link>
                  )
                })}
                <div className="border-t border-border mt-2 pt-3 grid grid-cols-2 gap-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">Connexion</Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button size="sm" className="bg-foreground text-background w-full">S'inscrire</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col justify-center pt-16 px-4 sm:px-6 relative overflow-hidden snap-start snap-always">
          {/* Background gradient orbs */}
          <div className={cn("absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl bg-gradient-to-br pointer-events-none", data.gradient)} />
          <div className={cn("absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl bg-gradient-to-br pointer-events-none", data.gradient)} />

          <div className="max-w-6xl mx-auto w-full relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8 mt-4 flex-wrap">
              <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Accueil
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm text-muted-foreground">Cas d'usage</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm font-semibold text-foreground">{data.label}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-10 lg:py-16">
              {/* Left */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-primary")}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cas d'usage · {data.label}</span>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-[1.1] tracking-tighter"
                >
                  <span className="bg-gradient-to-r from-foreground via-foreground/70 to-foreground bg-clip-text text-transparent">
                    {data.hero.title}
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-2xl sm:text-3xl font-black text-muted-foreground/50 mb-6 tracking-tight"
                >
                  {data.hero.subtitle}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl"
                >
                  {data.hero.desc}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <a href="#beta">
                    <Button size="lg" className="w-full sm:w-auto h-13 rounded-xl bg-foreground text-background font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 py-4 px-8">
                      Demander l'accès bêta
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="#exemples">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all duration-200 py-4 px-8">
                      Voir les exemples
                    </Button>
                  </a>
                </motion.div>
              </div>

              {/* Right — Benefits card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl shadow-primary/5"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-1.5">
                  <span className="text-primary/60">+</span> Avantages clés
                </p>
                <ul className="space-y-4">
                  {data.benefits.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed font-medium">{b}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* RGPD badge */}
                <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Hébergé en France</p>
                    <p className="text-[11px] text-muted-foreground">100% conforme RGPD · Zéro fuite de données</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Examples Section ────────────────────────────────────────── */}
        <section id="exemples" className="min-h-screen py-24 px-4 sm:px-6 bg-muted/10 snap-start snap-always overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
                <span className="text-primary/60">+</span> Exemples concrets
              </p>
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                Voyez l'anonymisation en action
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comparez le document original avec sa version anonymisée, prête à être envoyée à n'importe quel LLM.
              </p>
            </div>

            <div className="space-y-8">
              {data.examples.map((example, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm"
                >
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-3 flex-wrap">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-primary")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{example.title}</span>
                    <div className="ml-auto flex flex-wrap gap-1.5">
                      {example.entities.map((e) => (
                        <span key={e} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2">
                    {/* Before */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Original
                      </p>
                      <p className="text-sm text-foreground leading-relaxed font-mono bg-muted/30 rounded-xl p-4">
                        {example.before}
                      </p>
                    </div>

                    {/* After */}
                    <div className="p-6 bg-muted/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Anonymisé
                      </p>
                      <p className="text-sm text-foreground leading-relaxed font-mono bg-muted/30 rounded-xl p-4">
                        {example.after.split(/([A-Z][A-Z_0-9]+_\d+)/).map((part, i) => {
                          const isToken = /^[A-Z][A-Z_0-9]+_\d+$/.test(part)
                          return isToken
                            ? <span key={i} className="bg-foreground text-background px-1.5 py-0.5 rounded font-mono text-xs font-bold mx-0.5 inline-block">{part}</span>
                            : <span key={i}>{part}</span>
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '60+', label: 'Types de données détectées' },
                { value: '92%', label: 'Précision de détection' },
                { value: '<50ms', label: 'Temps de réponse API' },
                { value: '100%', label: 'Hébergé en France' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Step 4 — LLM Secure Use ──────────────────────────────── */}
        <section className="min-h-screen py-24 px-4 sm:px-6 snap-start snap-always overflow-y-auto flex flex-col justify-center">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Étape 4 sur 4
              </div>
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                Utilisez votre document en toute sécurité
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Vos données anonymisées sont prêtes. L'IA analyse, résume et répond — sans jamais voir vos informations réelles.
              </p>
            </div>

            {/* Chat window */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground ml-2">Chat sécurisé — Data Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[11px] font-bold text-foreground">{data.llmDemo.model}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Sécurisé</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* User bubble — anonymized doc */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[85%] bg-foreground text-background rounded-2xl rounded-tr-sm px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">{data.llmDemo.docTitle}</p>
                    <p className="text-sm leading-relaxed font-mono opacity-90">
                      {data.llmDemo.anonymizedSnippet.split(/([A-Z][A-Z_0-9]+_\d+)/).map((part, i) => {
                        const isToken = /^[A-Z][A-Z_0-9]+_\d+$/.test(part)
                        return isToken
                          ? <span key={i} className="bg-background/20 px-1 py-0.5 rounded text-xs font-bold mx-0.5 inline-block">{part}</span>
                          : <span key={i}>{part}</span>
                      })}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-1">
                    <span className="text-xs font-black text-foreground">Vous</span>
                  </div>
                </div>

                {/* AI response bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-[85%] bg-muted/40 border border-border rounded-2xl rounded-tl-sm px-5 py-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{data.llmDemo.model} — Réponse générée</span>
                    </div>
                    <div className="space-y-2">
                      {data.llmDemo.response.map((line, i) => {
                        const isBold = line.startsWith('**') && line.endsWith('**')
                        const isBullet = line.startsWith('•')
                        if (isBold) {
                          return (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, x: -4 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + i * 0.08 }}
                              className="text-sm font-bold text-foreground mt-3 first:mt-0"
                            >
                              {line.replace(/\*\*/g, '')}
                            </motion.p>
                          )
                        }
                        if (isBullet) {
                          return (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, x: -4 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + i * 0.08 }}
                              className="text-sm text-muted-foreground leading-relaxed pl-2"
                            >
                              {line}
                            </motion.p>
                          )
                        }
                        return (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, x: -4 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className="text-sm text-foreground leading-relaxed"
                          >
                            {line}
                          </motion.p>
                        )
                      })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Aucune donnée personnelle transmise</span>
                      <button className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <Copy className="w-3 h-3" /> Copier
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Input bar (decorative) */}
              <div className="px-6 pb-6">
                <div className="flex items-center gap-3 bg-muted/30 border border-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="flex-1 text-sm text-muted-foreground/60 italic">Posez une question sur votre document anonymisé…</span>
                  <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-background" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom note */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Les données personnelles ont été anonymisées avant transmission · Hébergé en France · 100% RGPD
            </p>
          </div>
        </section>

        {/* ── Other Use Cases ─────────────────────────────────────────── */}
        <section className="min-h-screen py-24 px-4 sm:px-6 snap-start snap-always flex flex-col justify-center">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">Autres cas d'usage</h2>
              <p className="text-muted-foreground text-sm">Data Private s'adapte à tous vos besoins de protection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherUsecases.map((uc) => {
                const UcIcon = uc.icon
                return (
                  <Link key={uc.slug} href={`/usecases/${uc.slug}`}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/30 transition-all duration-300 group cursor-pointer h-full"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-primary")}>
                          <UcIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                            <span className="text-primary/60">+</span> {uc.slug}
                          </p>
                          <h3 className="text-base font-black text-foreground leading-tight mb-2 group-hover:text-primary transition-colors duration-200">
                            {uc.label}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{uc.hero.desc.slice(0, 80)}…</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                        Voir ce cas d'usage <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────── */}
        <div className="snap-start snap-always min-h-screen overflow-y-auto">
          <Suspense fallback={<div className="h-96 flex items-center justify-center font-bold">Chargement des tarifs...</div>}>
            <PricingSection />
          </Suspense>
        </div>

        {/* ── Beta Form ───────────────────────────────────────────────── */}
        <div id="beta" className="snap-start snap-always min-h-screen overflow-y-auto">
          <BetaAccessSection />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="py-12 px-4 sm:px-6 border-t border-border bg-muted/10 snap-start snap-always">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 text-center lg:text-left">
              <Link href="/" className="flex items-center gap-2">
                <img src="/dark.svg" className="w-7 dark:hidden" alt="Logo" />
                <img src="/light.svg" className="w-7 hidden dark:block" alt="Logo" />
                <span className="font-bold text-xl text-primary">Data Private</span>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <Link href="/legal" className="hover:text-foreground transition-colors">Mentions légales</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">CGU-CGV</Link>
                <a href="mailto:contact@private-data.ai" className="hover:text-foreground transition-colors">Contact</a>
              </div>
              <p className="text-sm text-muted-foreground">© 2026 Data Private. Hébergé en France.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
