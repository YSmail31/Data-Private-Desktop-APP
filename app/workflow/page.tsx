'use client'

import { useState, useEffect, useRef } from 'react'
import { PageLoader } from '@/components/ui/page-loader'
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
    Sparkles,
    Play,
    ChevronRight,
    Send,
    Globe,
    Bot,
    Paperclip,
    Square,
    Settings2,
    Flag
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FR, ES, IT, DE, GB_ENG, DZ, PT, NL } from 'country-flag-icons/react/3x2'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { motion } from "framer-motion";
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
    const [isDark, setIsDark] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [progress, setProgress] = useState(0)
    const currentStep = Math.min(Math.floor(progress / 25), 3)
    const [originalText, setOriginalText] = useState(`Bonjour, je suis Jean Dupont, ne le 14 avril 1987. J'habite au 27 avenue des Lilas, 75019 Paris. Mon numero de telephone est le +33 6 48 72 19 05 et mon email jean.dupont@gmail.com. Je travaille comme ingenieur informatique.`)
    const [anonymizedText, setAnonymizedText] = useState('')
    const [isAnonymizing, setIsAnonymizing] = useState(false)
    const [entitiesFound, setEntitiesFound] = useState(0)
    const [showAnonymized, setShowAnonymized] = useState(false)
    const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python' | 'php' | 'go' | 'ruby'>('curl')
    const [lang, setLang] = useState<'fr' | 'en'>('fr')
    const [isPageLoading, setIsPageLoading] = useState(false)

    const heroRef = useRef<HTMLElement>(null)

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const { clientX, clientY } = e
        const rect = heroRef.current?.getBoundingClientRect()

        if (!rect) return

        const x = clientX - rect.left
        const y = clientY - rect.top

        heroRef.current?.style.setProperty("--x", `${x}px`)
        heroRef.current?.style.setProperty("--y", `${y}px`)
    }

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
        const timer = setTimeout(() => {
            setIsPageLoading(false)
        }, 500)
        return () => clearTimeout(timer)
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
                    { title: "Envoyez vos données", desc: "Texte, document PDF/Word, image ou audio - notre IA accepte tous les formats." },
                    { title: "Détection automatique", desc: "Notre IA identifie automatiquement 60+ types de données personnelles avec 92% de précision." },
                    { title: "Anonymisation instantanée", desc: "Les données sensibles sont remplacées par des labels anonymes (PERSON_1, DATE_1...)." },
                    { title: "Utilisez en sécurité", desc: "Envoyez le texte anonymisé à ChatGPT, Claude, Gemini ou tout autre LLM sans risque." }
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
                    { title: "Multi-format", desc: "Texte, PDF, Images" },
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
                    { title: "Send your data", desc: "Text, PDF/Word documents, images or audio - our IA accepts all formats." },
                    { title: "Auto-detection", desc: "Our IA automatically identifies 60+ types of personal data with 92% accuracy." },
                    { title: "Instant Anonymization", desc: "Sensitive data is replaced by anonymous labels (PERSON_1, DATE_1...)." },
                    { title: "Use Safely", desc: "Send the anonymized text to ChatGPT, Claude, Gemini or any other LLM risk-free." }
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
                hosting: "2026 Data Private. Hosted in France."
            }
        }
    }

    const t = translations[lang]

    // Auto-animate steps
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0
                return prev + 0.4
            })
        }, 50)
        return () => clearInterval(timer)
    }, [])

    // Simulated anonymization function
    const handleAnonymize = () => {
        setIsAnonymizing(true)

        setTimeout(() => {
            // Simulated entity detection and replacement
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
        }, 1500)
    }

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

    return (
        <div className={cn("min-h-screen", isDark && "dark")}>
            {isPageLoading && <PageLoader />}
            <div className="bg-background text-foreground transition-colors duration-500 h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-xl border-b border-border">
                    <div className="w-full mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-2 group">
                                <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
                                <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
                                <span className="font-bold text-2xl text-primary">Data Private</span>
                            </div>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center gap-6">
                                <a href="#comment-ca-marche" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.howItWorks}</a>
                                <a href="#demo" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.demo}</a>
                                <a href="#pourquoi" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.why}</a>
                                <Link href="/documentation" className="text-md text-muted-foreground hover:text-foreground transition-colors">{t.nav.api}</Link>
                            </div>

                            {/* Right side */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center bg-muted/50 p-1 rounded-xl mr-2">
                                    <button
                                        onClick={() => setLang('fr')}
                                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'fr' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        FR
                                    </button>
                                    <button
                                        onClick={() => setLang('en')}
                                        className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
                                <a href="#comment-ca-marche" className="text-sm text-muted-foreground">{t.nav.howItWorks}</a>
                                <a href="#demo" className="text-sm text-muted-foreground">{t.nav.demo}</a>
                                <a href="#pourquoi" className="text-sm text-muted-foreground">{t.nav.why}</a>
                                <Link href="/documentation" className="text-sm text-muted-foreground">{t.nav.api}</Link>
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

                {/* Comment ca marche */}
                <section
                    id="comment-ca-marche"
                    className="snap-start min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 bg-muted/30 dark:bg-muted/20"
                >
                    <div className="max-w-5xl sm:mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.how.title}</h2>
                            <p className="text-muted-foreground">{t.how.subtitle}</p>
                        </div>

                        {/* Steps container */}
                        <div className="relative">
                            {/* Horizontal scroll mobile / Grid desktop */}
                            <div
                                className="flex overflow-x-auto px-[7.5%] gap-4 pb-6 snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:snap-none justify-center"
                            >
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === index;
                                    const translation = t.how.steps[index];

                                    return (
                                        <div
                                            key={step.number}
                                            onClick={() => setProgress(index * 25)}
                                            className={`snap-center shrink-0 w-[85%] md:w-auto md:shrink md:snap-none relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${isActive
                                                ? "sm:block bg-card border-border scale-105 md:scale-110"
                                                : "sm:block hidden bg-card border-border hover:border-foreground/50"
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-muted">
                                                <Icon className="w-5 h-5 text-foreground" />
                                            </div>

                                            {/* Step number */}
                                            <div className="text-xs font-bold mb-2 text-muted-foreground">
                                                ÉTAPE {step.number}
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-semibold mb-2 text-foreground">
                                                {translation.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-muted-foreground">
                                                {translation.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress bar */}
                            <div className="mt-6 hidden">
                                <Progress
                                    className="hidden sm:block h-2"
                                    value={progress}
                                    indicatorClassName="transition-all duration-300 ease-linear bg-primary"
                                />
                            </div>
                        </div>

                        <div>

                        </div>

                    </div>
                </section>

                {/* Footer */}
                <footer className="snap-start py-10 sm:py-12 px-4 sm:px-6 border-t border-border bg-muted/30 dark:bg-muted/20">
                    <div className="max-w-6xl mx-auto">

                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">

                            {/* Logo */}
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <img src="/dark.svg" className="w-7 sm:w-8 dark:hidden" alt="Logo" />
                                <img src="/light.svg" className="w-7 sm:w-8 hidden dark:block" alt="Logo" />
                                <span className="font-bold text-xl sm:text-2xl text-primary">
                                    Data Private
                                </span>
                                <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
                            </div>

                            {/* Links */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm sm:text-md text-muted-foreground">
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
                            <div className="text-sm sm:text-md text-muted-foreground max-w-xs">
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