'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Shield,
  Lock,
  FileText,
  Check,
  ArrowRight,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  User,
  Eye,
  EyeOff,
  Play,
  ChevronRight,
  ChevronLeft,
  Send,
  Globe,
  Bot,
  Square,
  Flag,
  Type,
  Image as ImageIcon,
  Music,
  AudioLines,
  Download,
  Printer,
  Search,
  ZoomIn,
  Gavel,
  Calculator,
  Heart,
  Users as UsersIcon
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FR, ES, IT, DE, GB_ENG, DZ, PT, NL } from 'country-flag-icons/react/3x2'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DotPattern } from "@/components/ui/dot-pattern"
import { RevealText } from "@/components/ui/reveal-text"
import { RevealTags } from "@/components/ui/reveal-tags"
import { PricingSection } from "@/components/pricing-section"
import { BetaAccessSection } from "@/components/beta-access-section"
import { InfrastructureSection } from "@/components/infrastructure-section"
import { ApiSection } from "@/components/api-section"
import { DesktopChat } from "@/components/dashboardv2/desktop-chat"
import { isTauriRuntime } from "@/lib/platform"

// Use case definitions for the nav dropdown
const NAV_USE_CASES = [
  { slug: 'juridique', label: 'Documents Juridiques', labelEn: 'Legal Documents', icon: Gavel, gradient: 'from-blue-600 to-indigo-700' },
  { slug: 'contentieux', label: 'Mises en Demeure', labelEn: 'Formal Notices', icon: FileText, gradient: 'from-orange-500 to-red-600' },
  { slug: 'comptabilite', label: 'Documents Comptables', labelEn: 'Accounting Documents', icon: Calculator, gradient: 'from-emerald-500 to-teal-600' },
  { slug: 'medical', label: 'Dossiers Médicaux', labelEn: 'Medical Records', icon: Heart, gradient: 'from-rose-500 to-pink-600' },
  { slug: 'rh', label: 'Ressources Humaines', labelEn: 'Human Resources', icon: UsersIcon, gradient: 'from-violet-500 to-purple-600' },
  { slug: 'confidentiel', label: 'Documents Confidentiels', labelEn: 'Confidential Documents', icon: Lock, gradient: 'from-slate-600 to-zinc-700' },
]

// En desktop (Tauri) on ouvre directement le chat ; en web on garde la landing.
export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    setMounted(true)
    const desktop = isTauriRuntime()
    setIsDesktop(desktop)
    if (desktop) {
      // App desktop : on garde l'authentification. Sans token, on envoie
      // l'utilisateur sur la page de login avant d'afficher le chat.
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }
      setHasToken(true)
    }
  }, [])

  if (mounted && isDesktop) {
    return hasToken ? <DesktopChat /> : null
  }

  return <LandingPage />
}

function LandingPage() {
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [usecaseMenuOpen, setUsecaseMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const currentStep = Math.min(Math.floor(progress / 25), 3)
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python' | 'php' | 'go' | 'ruby'>('curl')
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  const steps = [
    {
      number: '01',
      title: 'Envoyez vos donnees',
      desc: 'Texte, document PDF/Word, image ou audio - notre IA accepte tous les formats.',
      icon: FileText
    },
    {
      number: '02',
      title: 'Detection automatique',
      desc: 'Notre IA identifie automatiquement 60+ types de donnees personnelles avec 92% de precision.',
      icon: Eye
    },
    {
      number: '03',
      title: 'Anonymisation instantanee',
      desc: 'Les donnees sensibles sont remplacees par des labels anonymes (PERSON_1, DATE_1...).',
      icon: Shield
    },
    {
      number: '04',
      title: 'Utilisez en securite',
      desc: 'Envoyez le texte anonymise a ChatGPT, Claude, Gemini ou tout autre LLM sans risque.',
      icon: Lock
    },
  ]

  const heroRef = useRef<HTMLElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const howRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: howRef,
    container: pageRef,
    offset: ["start start", "end end"]
  })

  const [windowWidth, setWindowWidth] = useState(0)
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const stepWidth = windowWidth < 640 ? windowWidth * 0.85 : 400
  const stepGap = windowWidth < 640 ? 20 : 40

  // x ranges from 0 to negative width of all items except the first
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(steps.length - 1) * (stepWidth + stepGap)}px`])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest * 100)
  })



  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Check if we should use dark mode from local storage or system preference
    const darkMode = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(darkMode)
    if (darkMode) document.documentElement.classList.add('dark')

    // Simuler un temps de chargement initial ou attendre que le client soit prêt
    // const timer = setTimeout(() => {
    //   setIsPageLoading(false)
    // }, 500)
    // return () => clearTimeout(timer)
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

  const scrollToStep = (index: number) => {
    if (pageRef.current && howRef.current) {
      const stepHeight = window.innerHeight;
      const targetScroll = howRef.current.offsetTop + (index * stepHeight);
      pageRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const translations = {
    fr: {
      nav: {
        howItWorks: "Comment ça marche",
        demo: "Démo",
        why: "Pourquoi Data Private",
        api: "Documentation",
        login: "Connexion",
        signup: "S'inscrire",
      },
      hero: {
        badge: "Hébergé en France - Conforme RGPD",
        title: "Protégez vos données personnelles",
        subtitle: "avant d'utiliser les LLMs",
        desc: "Data Private est la solution d'entreprise pour détecter et anonymiser automatiquement vos données sensibles. Sécurisez vos interactions avec ChatGPT, Claude et Gemini en un clic.",
        ctaStart: "Essayer Maintenant",
        ctaDemo: "Voir la démo",
        trust: "Ils nous font confiance",
      },
      how: {
        title: "Comment ça marche ?",
        subtitle: "4 étapes simples pour protéger vos données",
        steps: [
          { title: "Entrée", desc: "Data Private est multimodal, il accepte le texte, document PDF/Word, image ou audio." },
          { title: "Détection", desc: "Notre modèle identifie automatiquement 60+ types de données personnelles avec 92% de précision. tels que les noms, adresses, emails, numéros de téléphone, etc..." },
          { title: "Anonymisation", desc: "Les données sensibles sont masquées pour les Providers de façon intelligente et ne peuvent pas etre reconstruites ou retracées." },
          { title: "Utilisation", desc: "Envoyez vos requêtes anonymisées vers les grand providers les plus utilisés comme ChatGPT, Claude, Gemini ou tout autre LLM sans risque." }
        ]
      },
      demo: {
        title: "Voyez la magie en action",
        subtitle: "Entrez votre texte, anonymisez-le, puis envoyez-le au LLM",
        original: "Original",
        anonymized: "Anonymisé",
        entities: "entités",
        placeholder: "Entrez votre texte contenant des données personnelles...\n\nEx: Jean Dupont, né le 14 avril 1987, habite au 27 avenue des Lilas, Paris. Tel: +33 6 48 72 19 05, email: jean.dupont@gmail.com",
        ctaAnonymize: "Anonymiser",
        ctaAnonymizing: "Anonymisation...",
        ctaOriginal: "Voir original",
        charCount: "caractères"
      },
      deployment: {
        title: "Déployez comme vous voulez",
        subtitle: "Data Private s'adapte à votre infrastructure et vos besoins de sécurité",
        desktop: "Application native Windows, Mac & Linux",
        mobile: "Applications iOS & Android natives",
        proxy: "Intercepte et anonymise automatiquement",
        hardware: "Appliance physique pour data centers",
        extension: "Extension Chrome, Firefox & Edge",
        offline: "Offline",
        soon: "Bientôt",
        enterprise: "Enterprise",
        onpremise: "On-premise",
        free: "Gratuit",
        browser: "Navigateur",
        web: "All web browsers and responsive",
        online: "Online"
      },
      usecases: {
        badge: "Cas d'usage",
        title: "Protégez vos documents sensibles",
        subtitle: "Data Private s'adapte à tous les secteurs et types de documents contenant des informations personnelles",
        legal: { title: "Documents Juridiques", desc: "Contrats, accords, statuts, procès-verbaux d'assemblées générales" },
        notice: { title: "Mises en Demeure", desc: "Lettres de relance, injonctions, contentieux et litiges" },
        accounting: { title: "Documents Comptables", desc: "Factures, bilans, bulletins de paie, déclarations fiscales" },
        medical: { title: "Dossiers Médicaux", desc: "Comptes-rendus, ordonnances, résultats d'analyses, dossiers patients" },
        hr: { title: "Ressources Humaines", desc: "CV, contrats de travail, évaluations, entretiens annuels" },
        confidential: { title: "Documents Confidentiels", desc: "Correspondances privées, notes internes, stratégies d'entreprise" },
        footer: "Quel que soit votre secteur, Data Private protège vos données sensibles",
        tryFree: "Essayer gratuitement"
      },
      whySection: {
        title: "Pourquoi utiliser Data Private ?",
        items: [
          { title: "Protection RGPD", desc: "Vos données ne quittent jamais la France. Conforme aux réglementations européennes sur la protection des données." },
          { title: "Rapide et Simple", desc: "Anonymisez un document en quelques secondes. Pas besoin de compétences techniques." },
          { title: "Compatible ChatGPT", desc: "Utilisez ChatGPT, Claude, Mistral ou tout autre LLM en toute sécurité avec vos données anonymisées." }
        ]
      },
      dataTypes: {
        title: "60+ types de données détectées",
        subtitle: "Notre IA reconnaît automatiquement toutes ces catégories",
        items: ['Nom complet', 'Prénom', 'Email', 'Téléphone', 'Adresse', 'Code postal', 'Ville', 'Date de naissance', 'N. Sécurité sociale', 'N. Carte identité', 'N. Passeport', 'IBAN', 'Carte bancaire', 'Entreprise', 'Fonction', 'Adresse IP'],
        more: "Et bien plus : données médicales, coordonnées GPS, plaques d'immatriculation..."
      },
      chat: {
        title: "Chattez en toute discrétion",
        subtitle: "Posez toutes vos questions à plus grande IA en toute confiance",
      },
      languages: {
        title: "8 langues supportées",
        subtitle: "Notre IA traite nativement les documents multilingues",
        items: ['Français', 'Anglais', 'Arabe', 'Allemand', 'Italien', 'Portugais', 'Néerlandais']
      },
      providers: {
        title: " Compatible avec vos outils",
        subtitle: "Intégrez Data Private avec les meilleurs modèles d'IA du marché",
        items: ['OpenAI', 'Google Gemini', 'Anthropic Claude', 'Mistral AI', 'DeepSeek']
      },
      apiSection: {
        title: "Intégrez l'API en quelques lignes",
        subtitle: "Une API REST simple pour anonymiser vos données automatiquement",
        features: [
          { title: "REST API", desc: "Simple et standard" },
          { title: "Multi-Modal", desc: "Texte, PDF, Images" },
          { title: "Temps réel", desc: "Réponse en < 500ms" }
        ],
        ctaDoc: "Voir la documentation API"
      },
      ctaFinal: {
        title: "Prêt à protéger vos données ?",
        desc: "Commencez gratuitement. Pas de carte bancaire requise. Anonymisez vos premiers documents en quelques clics.",
        cta: "Commencer Gratuitement"
      },
      footer: {
        legal: "Mentions légales",
        cgu_cgv: "CGU-CGV",
        privacy: "Confidentialité",
        contact: "Contact",
        hosting: "2026 Data Private. Hébergé en France."
      },
      pdfDemo: {
        title: "Anonymisation de documents PDF",
        subtitle: "Comparez le document original avec sa version anonymisée",
      }
    },
    en: {
      nav: {
        howItWorks: "How it works",
        demo: "Demo",
        why: "Why Data Private",
        api: "Documentation",
        login: "Login",
        signup: "Sign Up",
      },
      chat: {
        title: "Chat in complete discretion",
        subtitle: "Ask all your questions to the greatest AI with confidence",
      },
      hero: {
        badge: "Hosted in France - GDPR Compliant",
        title: "Protect your personal data",
        subtitle: "before using LLMs",
        desc: "Data Private is the enterprise solution for automatically detecting and anonymizing your sensitive data. Secure your interactions with ChatGPT, Claude and Gemini in one click.",
        ctaStart: "Try Now",
        ctaDemo: "Watch demo",
        trust: "Trusted by",
      },
      how: {
        title: "How it works?",
        subtitle: "4 simple steps to protect your data",
        steps: [
          { title: "Input", desc: "Data Private is multimodal, it accepts text, PDF/Word documents, images or audio." },
          { title: "Detection", desc: "Our model automatically identifies 60+ types of personal data with 92% accuracy. such as names, addresses, emails, phone numbers, etc..." },
          { title: "Anonymization", desc: "Sensitive data is intelligently masked for Providers and cannot be reconstructed or traced." },
          { title: "Usage", desc: "Send your anonymized requests to the most popular providers like ChatGPT, Claude, Gemini or any other LLM risk-free." }
        ]
      },
      demo: {
        title: "See the magic in action",
        subtitle: "Enter your text, anonymize it, then send it to the LLM",
        original: "Original",
        anonymized: "Anonymized",
        entities: "entities",
        placeholder: "Enter your text containing personal data...\n\nEx: John Doe, born April 14, 1987, lives at 27 Lilas Avenue, Paris. Tel: +33 6 48 72 19 05, email: john.doe@gmail.com",
        ctaAnonymize: "Anonymize",
        ctaAnonymizing: "Anonymizing...",
        ctaOriginal: "See original",
        charCount: "characters"
      },
      deployment: {
        title: "Deploy as you wish",
        subtitle: "Data Private adapts to your infrastructure and security needs",
        desktop: "Native Windows, Mac & Linux app",
        mobile: "Native iOS & Android apps",
        proxy: "Automatically intercepts and anonymizes",
        hardware: "Physical appliance for data centers",
        extension: "Chrome, Firefox & Edge extension",
        offline: "Offline",
        soon: "Soon",
        enterprise: "Enterprise",
        onpremise: "On-premise",
        free: "Free",
        browser: "Browser",
        web: "Web",
        online: "Online"
      },
      usecases: {
        badge: "Use cases",
        title: "Protect your sensitive documents",
        subtitle: "Data Private adapts to all sectors and document types containing personal information",
        legal: { title: "Legal Documents", desc: "Contracts, agreements, bylaws, minutes of general meetings" },
        notice: { title: "Formal Notices", desc: "Reminder letters, injunctions, litigation and disputes" },
        accounting: { title: "Accounting Documents", desc: "Invoices, balance sheets, payslips, tax declarations" },
        medical: { title: "Medical Records", desc: "Reports, prescriptions, analysis results, patient files" },
        hr: { title: "Human Resources", desc: "CVs, employment contracts, evaluations, annual interviews" },
        confidential: { title: "Confidential Documents", desc: "Private correspondence, internal notes, business strategies" },
        footer: "Whatever your sector, Data Private protects your sensitive data",
        tryFree: "Try for free"
      },
      whySection: {
        title: "Why use Data Private?",
        items: [
          { title: "GDPR Protection", desc: "Your data never leaves France. Compliant with European data protection regulations." },
          { title: "Fast and Simple", desc: "Anonymize a document in seconds. No technical skills required." },
          { title: "ChatGPT Compatible", desc: "Use ChatGPT, Claude, Mistral or any other LLM safely with your anonymized data." }
        ]
      },
      dataTypes: {
        title: "60+ data types detected",
        subtitle: "Our AI automatically recognizes all these categories",
        items: ['Full name', 'First name', 'Email', 'Phone', 'Address', 'Postal code', 'City', 'Date of birth', 'Social Security No.', 'ID Card No.', 'Passport No.', 'IBAN', 'Credit card', 'Company', 'Position', 'IP Address'],
        more: "And much more: medical data, GPS coordinates, license plates..."
      },
      languages: {
        title: "8 languages supported",
        subtitle: "Our AI natively processes multilingual documents",
        items: ['French', 'English', 'Arabic', 'German', 'Italian', 'Portuguese', 'Dutch']
      },
      providers: {
        title: "Integrate with your tools",
        subtitle: "Connect Data Private with the market's best AI models",
        items: ['OpenAI', 'Google Gemini', 'Anthropic Claude', 'Mistral AI', 'DeepSeek']
      },
      apiSection: {
        title: "Integrate the API in a few lines",
        subtitle: "A simple REST API to anonymize your data automatically",
        features: [
          { title: "REST API", desc: "Simple and standard" },
          { title: "Multi-format", desc: "Text, PDF, Images" },
          { title: "Real-time", desc: "Response in < 500ms" }
        ],
        ctaDoc: "View API Documentation"
      },
      ctaFinal: {
        title: "Ready to protect your data?",
        desc: "Start for free. No credit card required. Anonymize your first documents in a few clicks.",
        cta: "Start for Free"
      },
      footer: {
        legal: "Legal notice",
        cgu_cgv: "Terms & Conditions",
        privacy: "Privacy policy",
        contact: "Contact",
        hosting: "2026 Data Private. Hosted in France.",
        version: "Version"
      },
      pdfDemo: {
        title: "PDF Document Anonymization",
        subtitle: "Compare the original document with its anonymized version",
      }
    }
  }
  const version = process.env.NEXT_PUBLIC_REVISION || 'dev'
  const t = translations[lang]

  // Skip auto-animate as we use scroll progress now
  useEffect(() => {
    // Scroll progress is now handled by the horizontal scroll section
  }, [])

  // Simulated anonymization function moved to MultimodalDemo


  return (
    <div className={cn("min-h-screen", isDark && "dark")}>
      {/* {isPageLoading && <PageLoader />} */}
      <div
        ref={pageRef}
        className="bg-background text-foreground transition-colors duration-500 h-screen overflow-y-scroll snap-y snap-proximity scroll-smooth overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-xl border-b border-border">
          <div className="w-full mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2 group">
                <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
                <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
                <span className="font-bold text-2xl text-primary">Data Private</span>
                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
                <span className="text-xs text-muted-foreground hidden group-hover:block">{version}</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <a href="#comment-ca-marche" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.howItWorks}</a>
                <a href="#demo" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.demo}</a>

                {/* Use Cases Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setUsecaseMenuOpen(true)}
                  onMouseLeave={() => setUsecaseMenuOpen(false)}
                >
                  <button className="text-md text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    {lang === 'fr' ? 'Cas d\'usage' : 'Use cases'}
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200", usecaseMenuOpen && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {usecaseMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1.5">
                          {NAV_USE_CASES.map((uc) => {
                            const UcIcon = uc.icon
                            return (
                              <Link
                                key={uc.slug}
                                href={`/usecases/${uc.slug}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {lang === 'fr' ? uc.label : uc.labelEn}
                                </span>
                                <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <a href="#pourquoi" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.why}</a>
                <Link href="/documentation" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.api}</Link>
              </div>

              {/* Right side */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center bg-muted/50 p-1 rounded-xl mr-2">
                  <button
                    onClick={() => setLang('fr')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'fr' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    EN
                  </button>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl hover:bg-muted transition-all duration-300"
                >
                  {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-foreground" />}
                </button>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-foreground text-background hover:opacity-90 shadow-lg transition-all duration-300 border-none">
                    {t.nav.signup}
                  </Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 hover:bg-muted rounded-xl text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background p-4">
              <div className="flex flex-col gap-4">
                <a href="#comment-ca-marche" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground">{t.nav.howItWorks}</a>
                <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground">{t.nav.demo}</a>
                <a href="#pourquoi" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground">{t.nav.why}</a>
                <Link href="/documentation" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground">{t.nav.api}</Link>

                {/* Use Cases mobile list */}
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    {lang === 'fr' ? 'Cas d\'usage' : 'Use cases'}
                  </p>
                  <div className="flex flex-col gap-1">
                    {NAV_USE_CASES.map((uc) => {
                      const UcIcon = uc.icon
                      return (
                        <Link
                          key={uc.slug}
                          href={`/usecases/${uc.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4"
                        >
                          {lang === 'fr' ? uc.label : uc.labelEn}
                        </Link>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center bg-muted/50 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setLang('fr')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'fr' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    EN
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">{t.nav.login}</Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button size="sm" className="bg-foreground text-background w-full">{t.nav.signup}</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section
          ref={heroRef}
          className="snap-start min-h-screen flex flex-col lg:flex-row items-center justify-between pt-20 pb-10 px-4 sm:px-10 lg:px-20 gap-6 lg:gap-12 overflow-hidden"
        >
          <div className="w-full lg:w-[45%] text-left py-6 sm:py-16 px-2 sm:px-6">
            {/* <div className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm border border-border text-foreground px-4 py-1.5 rounded-full text-xs font-bold mb-8 animate-reveal shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
              </span>
              {t.hero.badge}
            </div> */}


            <div className="flex flex-col text-3xl sm:text-5xl lg:text-6xl font-black mb-6 leading-[1.15] tracking-tighter animate-reveal" style={{ animationDelay: '100ms' }}>
              <span className="bg-gradient-to-r from-foreground via-foreground/50 to-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                {t.hero.title}
              </span>
              <span className="text-muted-foreground/60">
                {t.hero.subtitle}
              </span>
            </div>

            <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-xl animate-reveal font-medium leading-relaxed" style={{ animationDelay: '200ms' }}>
              {t.hero.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 animate-reveal" style={{ animationDelay: '300ms' }}>
              <a href="#beta" className="w-full sm:w-auto">
                <Button size="lg" className="flex flex-row w-full h-13 rounded-xl bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 py-4">
                  {t.hero.ctaStart}
                  <ArrowRight className="w-4 h-4" />

                </Button>
              </a>
              <a href="#chat" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="flex flex-row w-full h-13 rounded-xl bg-background/50 text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  {t.hero.ctaDemo}
                </Button>
              </a>
            </div>
          </div>

          <div className="w-full lg:w-[50%] h-[250px] sm:h-[400px] lg:h-[800px] relative overflow-hidden">
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,theme(colors.background)_60%)]" />
            <RevealTags
              lang={lang}
              tags={[
                { value: "Data Private", en_type: "COMPANY", fr_type: "ENTREPRISE" },
                { value: "France", en_type: "COUNTRY", fr_type: "PAYS" },
                { value: "FennecLAB", en_type: "ORGANIZATION", fr_type: "ORGANISATION" },
                { value: "SLM", en_type: "MODEL", fr_type: "MODELE" },
                { value: "IA", en_type: "DOMAIN", fr_type: "DOMAINE" },
                { value: "RGPD", en_type: "PRIVACY", fr_type: "CONFIDENTIALITE" },
                { value: "MultiLangue", en_type: "LANGUAGE", fr_type: "LANGUE" },
                { value: "Multiplateforme", en_type: "PLATEFORME", fr_type: "PLATEFORME" },
                { value: "Chat", en_type: "TOOLS", fr_type: "OUTILS" },
                { value: "99.9%", en_type: "PRECISION", fr_type: "PRECISION" },
                { value: "<50ms", en_type: "LATENCE", fr_type: "LATENCE" },
                { value: "Multimodal", en_type: "INPUTS", fr_type: "INPUTS" },
              ]}
              rows={8}
            />
          </div>
        </section>

        {/* Comment ca marche - Motion.dev Style Horizontal Scroll */}
        <div ref={howRef} className="snap-start relative h-[400vh] bg-background">
          <section
            id="comment-ca-marche"
            className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden"
          >
            <div className="absolute top-8 sm:top-12 left-0 right-0 text-center z-10 px-6 py-4 sm:py-12">
              <h2 className="text-2xl sm:text-5xl font-black mb-2 sm:mb-4 tracking-tight">{t.how.title}</h2>
            </div>

            {/* Centered Viewport Context */}
            <div className="relative w-full max-w-[88vw] sm:max-w-[450px] mx-auto h-[420px] sm:h-[550px] mt-16 sm:mt-24">
              <div className="absolute inset-0 overflow-visible flex items-center">
                <motion.div
                  style={{ x }}
                  className="flex gap-5 sm:gap-10"
                >
                  {steps.map((step, index) => {
                    const isActive = currentStep === index;
                    const translation = t.how.steps[index];

                    // Define a vibrant gradient for each card
                    const gradients = [
                      "from-blue-500 to-indigo-600",
                      "from-emerald-500 to-teal-600",
                      "from-orange-500 to-rose-600",
                      "from-purple-500 to-fuchsia-600"
                    ];

                    return (
                      <div
                        key={step.number}
                        onClick={() => scrollToStep(index)}
                        style={{ width: stepWidth }}
                        className={`shrink-0 h-[380px] sm:h-[500px] relative rounded-[2rem] border-0 overflow-hidden p-5 sm:p-8 flex flex-col gap-4 sm:gap-10 transition-all duration-700 ${isActive
                          ? "border-primary/40 shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] scale-100 opacity-100"
                          : "border-border/50 scale-90 opacity-60 blur-sm"
                          } cursor-pointer`}
                      >
                        {/* Background Gradient Layer */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} z-0`} />
                        <div className={cn("absolute inset-0 bg-card/40 z-0", isActive ? "backdrop-blur-none" : "backdrop-blur-md")} />

                        {/* Content */}
                        <div className="relative z-1">
                          <h3 className="text-2xl sm:text-4xl font-black text-foreground leading-tight">
                            {translation.title}
                          </h3>
                        </div>

                        <div className="relative z-10">
                          <p className="text-xl sm:text-2xl text-primary font-medium leading-relaxed mb-6">
                            {translation.desc}
                          </p>
                        </div>

                        {/* Large Background Number */}
                        <div className={cn("absolute -bottom-10 -right-6 text-[120px] sm:text-[180px] font-black select-none pointer-events-none", isActive ? "opacity-80" : "opacity-30")}>
                          {step.number}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

          </section>
        </div>

        {/* Multimodal Demo Section */}
        <div id="demo">
          <MultimodalDemo lang={lang} t={t} />
        </div>

        {/* Chat Section */}
        <NetworkChatSection t={t} />

        {/* Deployment Options */}
        <section id="deploiement" className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                {t.deployment.title}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.deployment.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: t.deployment.online, title: 'Web', desc: t.deployment.web, badge: t.deployment.online },
                { label: t.deployment.offline, title: 'Desktop', desc: t.deployment.desktop, badge: t.deployment.offline },
                { label: "Application", title: 'Mobile', desc: t.deployment.mobile, badge: "Application" },
                { label: t.deployment.enterprise, title: 'Proxy', desc: t.deployment.proxy, badge: t.deployment.enterprise },
                { label: t.deployment.onpremise, title: 'Hardware', desc: t.deployment.hardware, badge: t.deployment.onpremise },
                { label: t.deployment.browser, title: 'Extension', desc: t.deployment.extension, badge: t.deployment.browser },
              ].map((item, idx) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/30 transition-all duration-300 group">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span className="text-primary/60">+</span>
                    {item.label}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight mb-3 group-hover:text-primary transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="usecases" className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 bg-muted/10 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                {t.usecases.title}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.usecases.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { slug: 'juridique', label: 'Juridique', title: t.usecases.legal.title, desc: t.usecases.legal.desc, tags: ['Contrats', 'NDA', 'CGV'] },
                { slug: 'contentieux', label: 'Contentieux', title: t.usecases.notice.title, desc: t.usecases.notice.desc, tags: ['Relances', 'Litiges', 'Recours'] },
                { slug: 'comptabilite', label: 'Comptabilité', title: t.usecases.accounting.title, desc: t.usecases.accounting.desc, tags: ['Factures', 'Paie', 'Bilans'] },
                { slug: 'medical', label: 'Médical', title: t.usecases.medical.title, desc: t.usecases.medical.desc, tags: ['HIPAA', 'Ordonnances', 'Analyses'] },
                { slug: 'rh', label: 'RH', title: t.usecases.hr.title, desc: t.usecases.hr.desc, tags: ['CV', 'Contrats', 'Evaluations'] },
                { slug: 'confidentiel', label: 'Confidentiel', title: t.usecases.confidential.title, desc: t.usecases.confidential.desc, tags: ['Emails', 'Notes', 'Stratégies'] },
              ].map((item, idx) => (
                <Link key={idx} href={`/usecases/${item.slug}`} className="block">
                  <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/30 transition-all duration-300 group h-full cursor-pointer">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <span className="text-primary/60">+</span>
                      {item.label}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight mb-3 group-hover:text-primary transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-[10px] font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {lang === 'fr' ? 'Découvrir ce cas d\'usage' : 'Explore this use case'}
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure Section */}
        <InfrastructureSection />

        {/* Types de donnees */}
        <section className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 bg-muted/10 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                {t.dataTypes.title}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.dataTypes.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {t.dataTypes.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border hover:border-foreground/50 transition-all duration-300 group"
                >
                  <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="sm:mt-16 pt-5 sm:pt-10 sm:border-t sm:border-border/50">
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
                {lang === 'fr' ? 'Formats supportés' : 'Supported Formats'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {['PDF', 'DOCX', 'TXT', 'JSON', 'CSV', 'XML', 'PNG', 'JPG'].map((fmt) => (
                  <div key={fmt} className="px-4 py-2 bg-muted/50 rounded-lg border border-border/50 text-xs font-bold font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-default">
                    {fmt}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-8">
                {t.dataTypes.more}
              </p>
            </div>
          </div>
        </section>

        {/* Languages Section */}
        <section className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
                {t.languages.title}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.languages.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['French', 'English', 'Arabic', 'Spanish', 'German', 'Italian', 'Portuguese', 'Dutch'].map((language, index) => {
                const colors = [
                  { text: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { text: 'text-orange-500', bg: 'bg-orange-500/10' },
                  { text: 'text-purple-500', bg: 'bg-purple-500/10' }
                ][index % 4];

                return (
                  <div
                    key={index}
                    className="group flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border hover:border-foreground/50 transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors", colors.bg)}>
                      <span className="text-lg font-bold">
                        {language.toLowerCase().includes('french') ? <FR className="w-6 h-6" /> :
                          language.toLowerCase().includes('english') ? <GB_ENG className="w-6 h-6" /> :
                            language.toLowerCase().includes('arabic') ? <DZ className="w-6 h-6" /> :
                              language.toLowerCase().includes('german') ? <DE className="w-6 h-6" /> :
                                language.toLowerCase().includes('italian') ? <IT className="w-6 h-6" /> :
                                  language.toLowerCase().includes('portuguese') ? <PT className="w-6 h-6" /> :
                                    language.toLowerCase().includes('spanish') ? <ES className="w-6 h-6" /> :
                                      language.toLowerCase().includes('dutch') ? <NL className="w-6 h-6" /> : <> </>
                        }
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">{language}</span>
                  </div>
                );
              })}
            </div>
            {/* Centering fix for flex approach if desired, but grid is fine. */}
          </div>
        </section>

        <ApiSection t={t} lang={lang} />

        {/* Pricing Section */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center font-bold">Chargement des tarifs...</div>}>
          <PricingSection />
        </Suspense>

        {/* Beta Access Section */}
        <BetaAccessSection />

        {/* Footer */}
        <footer className="snap-start py-20 px-4 sm:px-6 border-t border-border bg-muted/10">
          <div className="max-w-6xl mx-auto">

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 text-center lg:text-left">

              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <img src="/dark.svg" className="w-7 sm:w-8 dark:hidden" alt="Logo" />
                <img src="/light.svg" className="w-7 sm:w-8 hidden dark:block" alt="Logo" />
                <span className="font-bold text-xl sm:text-2xl text-primary">
                  Data Private
                </span>
              </div>

              {/* Links */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm sm:text-base text-muted-foreground">
                <Link href="/legal" className="hover:text-foreground transition-colors">
                  {t.footer.legal}
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t.footer.cgu_cgv}
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t.footer.privacy}
                </Link>
                <a href="mailto:contact@private-data.ai" className="hover:text-foreground transition-colors">
                  {t.footer.contact}
                </a>
              </div>

              {/* Hosting */}
              <div className="text-sm sm:text-base text-muted-foreground max-w-xs">
                {t.footer.hosting}
              </div>

            </div>

          </div>
        </footer>

      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}



function MultimodalDemo({ lang, t }: { lang: 'fr' | 'en', t: any }) {
  const [activeTab, setActiveTab] = useState<'text' | 'document' | 'image' | 'audio'>('text')

  // Text Demo State & Logic
  const [originalText, setOriginalText] = useState(`Bonjour, je suis Jean Dupont, ne le 14 avril 1987. J'habite au 27 avenue des Lilas, 75019 Paris. Mon numero de telephone est le +33 6 48 72 19 05 et mon email jean.dupont@gmail.com. Je travaille comme ingenieur informatique.`)
  const [anonymizedText, setAnonymizedText] = useState('')
  const [isAnonymizing, setIsAnonymizing] = useState(false)
  const [entitiesFound, setEntitiesFound] = useState(0)
  const [showAnonymized, setShowAnonymized] = useState(false)

  const handleAnonymize = () => {
    setIsAnonymizing(true)
    setTimeout(() => {
      const entities = [
        { original: 'Jean Dupont', replacement: '<span class="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-xs">PERSON_1</span>', type: 'PERSON' },
        { original: '14 avril 1987', replacement: '<span class="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-xs">DATE_OF_BIRTH_1</span>', type: 'DATE' },
        { original: '27 avenue des Lilas, 75019 Paris', replacement: '<span class="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-xs">ADDRESS_1</span>', type: 'ADDRESS' },
        { original: '+33 6 48 72 19 05', replacement: '<span class="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-xs">PHONE_1</span>', type: 'PHONE' },
        { original: 'jean.dupont@gmail.com', replacement: '<span class="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-xs">EMAIL_1</span>', type: 'EMAIL' },
        { original: 'ingenieur informatique', replacement: '<span class="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono text-xs">OCCUPATION_1</span>', type: 'OCCUPATION' },
      ]
      let result = originalText
      let count = 0
      entities.forEach(entity => {
        if (result.includes(entity.original)) {
          result = result.replace(entity.original, entity.replacement)
          count++
        }
      })
      setAnonymizedText(result)
      setEntitiesFound(count)
      setIsAnonymizing(false)
      setShowAnonymized(true)
    }, 1500)
  }

  // PDF & Image Slider Logic
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Audio Demo Logic
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let x = 0
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
    } else {
      x = (e as MouseEvent).clientX - rect.left
    }
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pos)
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      let x = 0
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left
      } else {
        x = (e as React.MouseEvent).clientX - rect.left
      }
      const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPos(pos)
    }
  }

  useEffect(() => {
    const handleUp = () => { isDragging.current = false }
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    return () => {
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [])

  const tabs = [
    { id: 'text', label: lang === 'fr' ? 'Texte' : 'Text', icon: Type },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'audio', label: 'Audio', icon: Music },
  ] as const

  return (
    <section className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 bg-muted/10 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
            {t.demo.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.demo.subtitle}
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border backdrop-blur-sm shadow-sm",
                  isActive
                    ? "bg-foreground text-background border-foreground scale-105 shadow-xl"
                    : "bg-background/50 text-muted-foreground border-border hover:bg-background hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-background" : "text-primary")} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area with AnimatePresence */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* TEXT DEMO */}
            {activeTab === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl shadow-primary/10 mx-auto max-w-4xl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                    <button
                      onClick={() => setShowAnonymized(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${!showAnonymized ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t.demo.original}
                    </button>
                    <button
                      onClick={() => anonymizedText && setShowAnonymized(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${showAnonymized ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      {t.demo.anonymized}
                    </button>
                  </div>
                  {showAnonymized && (
                    <span className="text-[10px] text-foreground font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                      {entitiesFound} {t.demo.entities} detected
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-8 h-[250px] sm:h-[300px] overflow-y-auto text-sm sm:text-lg leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: showAnonymized ? anonymizedText || `<p class="italic text-muted-foreground/50">${t.demo.anonymized}...</p>` : originalText }} />
                </div>
                <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{originalText.length} {t.demo.charCount}</span>
                  <Button
                    onClick={() => {
                      if (showAnonymized) setShowAnonymized(false)
                      else handleAnonymize()
                    }}
                    disabled={isAnonymizing}
                    className="bg-foreground text-background font-bold rounded-xl px-8"
                  >
                    {isAnonymizing ? t.demo.ctaAnonymizing : showAnonymized ? t.demo.ctaOriginal : t.demo.ctaAnonymize}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* DOCUMENT / PDF DEMO */}
            {activeTab === 'document' && (
              <motion.div
                key="document"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                ref={containerRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className="relative aspect-[3/4] sm:aspect-[16/10] w-full max-w-4xl mx-auto rounded-[1.5rem] border border-border shadow-2xl shadow-primary/20 overflow-hidden cursor-col-resize select-none bg-card"
              >
                {/* Bottom Layer: Original */}
                <div className="absolute inset-0 z-0 flex flex-col">
                  {/* PDF Header Mockup */}
                  <div className="h-10 bg-[#323639] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 p-1 rounded-sm">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">Resume.pdf</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-300">
                      <Search size={14} className="hover:text-white cursor-pointer transition-colors" />
                      <div className="w-[px] h-4 bg-gray-600" />
                      <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded">1 / 1</span>
                      <div className="w-[1px] h-4 bg-gray-600" />
                      <ZoomIn size={14} className="hover:text-white cursor-pointer transition-colors" />
                      <Download size={14} className="hover:text-white cursor-pointer transition-colors" />
                      <Printer size={14} className="hover:text-white cursor-pointer transition-colors" />
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <iframe src="/demo/Resume.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0" className="w-full h-full border-none pointer-events-none" title="Original Resume" />
                    <div className="absolute top-6 left-6 bg-background/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-bold border border-border/50 shadow-sm">{t.demo.original}</div>
                  </div>
                </div>

                {/* Top Layer: Anonymized */}
                <div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                  <div className="absolute inset-0 bg-background flex flex-col">
                    {/* Synchronized Header */}
                    <div className="h-10 bg-[#323639] flex items-center justify-between px-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 p-1 rounded-sm">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white text-xs font-medium">Resume.pdf</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-300">
                        <Search size={14} />
                        <div className="w-[1px] h-4 bg-gray-600" />
                        <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded">1 / 1</span>
                        <div className="w-[1px] h-4 bg-gray-600" />
                        <ZoomIn size={14} />
                        <Download size={14} />
                        <Printer size={14} />
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <iframe src="/demo/Resume-Anon.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0" className="w-full h-full border-none pointer-events-none" title="Anonymized Resume" />
                      <div className="absolute top-6 right-10 bg-background/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-bold border border-border/50 shadow-sm">{t.demo.anonymized}</div>
                    </div>
                  </div>
                </div>

                {/* Slider Handle */}
                <div className="absolute top-0 bottom-0 z-20 w-1 bg-background group" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-background/90 backdrop-blur-xl border-4 border-primary/30 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                    <div className="flex items-center gap-1.5 text-primary">
                      <ChevronLeft size={20} strokeWidth={3} /><ChevronRight size={20} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />
                </div>
              </motion.div>
            )}

            {/* IMAGE DEMO */}
            {activeTab === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                ref={containerRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className="relative aspect-[16/10] w-full max-w-4xl mx-auto rounded-[1.5rem] border border-border shadow-2xl shadow-primary/20 overflow-hidden cursor-col-resize select-none bg-card"
              >
                {/* Bottom Layer: Original */}
                <div
                  className="absolute inset-0 z-0 bg-muted/20"
                  style={{
                    backgroundImage: 'url(/demo/id_card_original.png?v=1)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute top-6 left-6 bg-background/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-bold border border-border/50 shadow-sm">{t.demo.original}</div>
                </div>

                {/* Top Layer: Anonymized */}
                <div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'url(/demo/id_card_anon.png?v=1)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                  </div>
                  <div className="absolute top-6 right-10 bg-background/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-bold border border-border/50 shadow-sm">{t.demo.anonymized}</div>
                </div>

                {/* Slider Handle */}
                <div className="absolute top-0 bottom-0 z-20 w-1 bg-background group" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-background/90 backdrop-blur-xl border-4 border-primary/30 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                    <div className="flex items-center gap-1.5 text-primary"><ChevronLeft size={20} /><ChevronRight size={20} /></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AUDIO DEMO */}
            {activeTab === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-2xl shadow-primary/20 mx-auto max-w-4xl p-12 text-center"
              >
                <audio
                  ref={audioRef}
                  src="/demo/audio_clair.mp3"
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="mb-12">
                  <div className="flex justify-center items-center gap-2 mb-8 h-20">
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? { height: [10, Math.random() * 60 + 20, 10] } : { height: 10 }}
                        transition={isPlaying ? { repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" } : { duration: 0.3 }}
                        className="w-2.5 bg-primary/40 rounded-full"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <Button
                      size="icon"
                      onClick={toggleAudio}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-foreground text-background hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Square className="w-6 h-6 sm:w-8 sm:h-8 fill-current" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />}
                    </Button>
                    <div className="text-left">
                      <p className="text-xl font-bold">audio.mp3</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {isPlaying ? "En cours de lecture..." : "Prêt à écouter"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-3xl p-8 text-left border border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Transcription Anonymisée</h4>
                  <p className="text-lg leading-relaxed italic text-foreground/80">
                    {lang === 'fr' ? (
                      <>
                        "Bonjour, je m'appelle <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-mono text-sm">PERSON_1</span>, je travaille chez  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-mono text-sm">COMPANY_1</span>. Mon numéro de sécurité sociale est le <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-mono text-sm">PHONE_NUMBER_1</span>..."
                      </>
                    ) : (
                      <>
                        "Hello, my name is <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-mono text-sm">PERSON_1</span>, I am the CFO of <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-mono text-sm">COMPANY_1</span>. My direct phone number is <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-mono text-sm">PHONE_NUMBER_1</span>..."
                      </>
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function NetworkChatSection({ t }: { t: any }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  const [step, setStep] = useState(0)
  const [inputText, setInputText] = useState("")
  const [showUserBubble, setShowUserBubble] = useState(false)
  const [anonymized, setAnonymized] = useState(false)
  const [streamed, setStreamed] = useState("")

  const fullInput =
    "Je suis Jean Dupont (jean.dupont@email.com). Peux-tu m'aider avec mon dossier chez Data-Private ?"

  const badgeClasses = [
    "sm:px-2 bg-blue-500/20 text-blue-400 text-sm sm:text-base rounded-md  sm:blur hover:blur-none hover:bg-blue-500/20 ",
    "sm:px-2 bg-emerald-500/20 text-emerald-400 text-sm sm:text-base rounded-md  sm:blur hover:blur-none hover:bg-emerald-500/20 ",
    "sm:px-2 bg-orange-500/20 text-orange-400 text-sm sm:text-base rounded-md  sm:blur hover:blur-none hover:bg-orange-500/20 ",
    "sm:px-2 bg-purple-500/20 text-purple-400 text-sm sm:text-base rounded-md  sm:blur hover:blur-none hover:bg-purple-500/20 "
  ]

  const taggedInput =
    (<span>Je suis <Badge className={`${badgeClasses[0]}`}>Jean Dupont</Badge> (<Badge className={`${badgeClasses[1]}`}>jean.dupont@email.com</Badge>). Peux-tu m'aider avec mon dossier chez <Badge className={`${badgeClasses[2]}`}>Data-Private</Badge> ?</span>)

  const aiText =
    "Bonjour, j'ai bien reçu votre demande concernant Data-Private. Je peux vous aider à analyser vos documents en toute sécurité."

  // Detect visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.6 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Main timeline
  useEffect(() => {
    if (!visible) return

    let timeouts: any[] = []

    const start = () => {
      setStep(0)
      setInputText("")
      setShowUserBubble(false)
      setAnonymized(false)
      setStreamed("")

      // typing input
      let i = 0
      const typing = setInterval(() => {
        setInputText(fullInput.slice(0, i))
        i++
        if (i > fullInput.length) {
          clearInterval(typing)

          // clear input + show bubble
          setTimeout(() => {
            setInputText("")
            setShowUserBubble(true)
            setStep(1)
          }, 600)

          // tool thinking
          setTimeout(() => setStep(2), 0)

          // anonymize
          setTimeout(() => {
            setAnonymized(true)
            setStep(3)
          }, 2600)

          // AI streaming
          setTimeout(() => setStep(4), 3500)

          // restart
          setTimeout(() => start(), 11000)
        }
      }, 25)

      timeouts.push(typing)
    }

    start()

    return () => timeouts.forEach(clearInterval)
  }, [visible])

  // Streaming
  useEffect(() => {
    if (step !== 4) return
    let i = 0
    const interval = setInterval(() => {
      setStreamed(aiText.slice(0, i))
      i++
      if (i > aiText.length) clearInterval(interval)
    }, 15)
    return () => clearInterval(interval)
  }, [step])

  return (
    <section
      id="chat"
      ref={ref}
      className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 bg-muted/10 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
            {t.chat.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.chat.subtitle}
          </p>
        </div>

        <div className="w-full aspect-[4/5] sm:aspect-[16/10] bg-card border border-border rounded-[2rem] shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)] flex flex-col relative overflow-hidden transition-all duration-700">

          {/* Messages area */}
          <div className="flex flex-col flex-1 w-full overflow-hidden">

            {/* SCROLLABLE CHAT */}
            <div className="flex-1 overflow-y-auto">
              <ScrollArea className="h-full w-full">
                <div className="w-full sm:max-w-[90%] mx-auto flex flex-col gap-4 px-2 sm:px-5 py-6">

                  {/* USER BUBBLE */}
                  {showUserBubble && (
                    <>
                      <div className="flex gap-3 flex-row-reverse justify-start">
                        <div className={cn(
                          "sm:w-16 sm:h-16 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-transform hover:scale-110",
                          "bg-muted/80 text-foreground border-border/50"
                        )}>
                          <User className="sm:h-8 sm:w-8 h-4 w-4" />
                        </div>

                        <div className="sm:max-w-[70%] max-w-[85%] px-3 sm:px-5 sm:py-3.5 py-2 sm:rounded-3xl rounded-lg sm:text-base text-sm
                text-primary leading-relaxed whitespace-pre-wrap break-words
                bg-muted/80 border border-border/50 rounded-tr-none">
                          {false ? fullInput : (
                            <div className="flex flex-wrap gap-2 line-height-2">
                              {taggedInput}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TOOL THINKING */}
                      {step === 2 && (
                        <div className="self-start px-2 sm:px-5 text-primary animate-pulse text-sm sm:text-base">
                          🛠 Anonymisation des données ...
                        </div>
                      )}

                      {/* AI BUBBLE */}
                      {step >= 4 && (
                        <div className="flex gap-3 justify-start">
                          <div className={cn(
                            "sm:w-16 sm:h-16 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-transform hover:scale-110",
                            "bg-muted/80 text-foreground border-border/50"
                          )}>
                            <Bot className="sm:h-8 sm:w-8 h-4 w-4" />
                          </div>

                          <div className="sm:max-w-[70%] max-w-[85%] px-3 sm:px-5 sm:py-3.5 py-2 sm:rounded-3xl rounded-lg sm:text-base text-sm
                  text-primary leading-relaxed whitespace-pre-wrap break-words
                  bg-muted/80 border border-border/50 rounded-tr-none">
                            {streamed}
                            <span className="animate-pulse">▍</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>
              </ScrollArea>
            </div>
          </div>
          {/* FIXED INPUT */}
          <div className="shrink-0 w-full border-t border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-[80%] mx-auto p-3 sm:p-5">
              <div className="bg-background/50 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-xl overflow-hidden">

                {/* IMPORTANT: min-h-0 allows max-h to work inside flex */}
                <div className="min-h-[80px] max-h-[30px] sm:min-h-[100px] p-3 sm:p-4 flex items-start gap-3 min-h-0">

                  {/* SCROLLABLE INPUT */}
                  <ScrollArea className="flex-1 min-h-10  overflow-y-auto">
                    <div className="text-primary sm:text-base text-sm p-2 whitespace-pre-wrap break-words">
                      {inputText}
                      <span className="animate-pulse">|</span>
                    </div>
                  </ScrollArea>

                  <button
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md",
                      "bg-primary text-primary-foreground hover:scale-110 active:scale-95"
                    )}
                  >
                    {step > 0 ? (
                      <Square size={16} className="fill-current" />
                    ) : step > 1 ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send size={16} className="fill-current" />
                    )}
                  </button>

                </div>

              </div>
            </div>
          </div>

        </div >
      </div >
    </section >
  )
}