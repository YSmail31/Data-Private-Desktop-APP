'use client'

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PageLoader } from "@/components/ui/page-loader"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Sparkles, Check, Zap, Building2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'
import Script from 'next/script'
import { Badge } from "@/components/ui/badge"

function SignupContent() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = React.useState<'fr' | 'en'>('fr')
  const [isPageLoading, setIsPageLoading] = useState(false)

  // Initialiser Google Identity Services
  const initGoogle = () => {
    if (typeof window === 'undefined' || !(window as any).google) return;

    (window as any).google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: true, // Permet l'inscription automatique si un seul compte est disponible
    });

    renderGoogleButton();
  };

  const renderGoogleButton = () => {
    if (typeof window === 'undefined' || !(window as any).google) return;

    const btnElem = document.getElementById("google-button-signup");
    if (btnElem && !isPageLoading) {
      const parentWidth = btnElem.parentElement?.clientWidth || 400;
      (window as any).google.accounts.id.renderButton(
        btnElem,
        {
          theme: "outline",
          size: "large",
          width: parentWidth,
          text: "signup_with",
        }
      );
    }
  };

  useEffect(() => {
    if (!isPageLoading) {
      renderGoogleButton();
    }
  }, [isPageLoading]);

  const handleGoogleResponse = async (response: any) => {
    console.log("Réponse Google reçue (signup):", response);
    if (response.error) {
      console.error("Erreur retournée par Google SDK (signup):", response.error);
      toast.error(lang === 'fr' ? `Erreur Google: ${response.error}` : `Google error: ${response.error}`);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', {
        id_token: response.credential,
        signup_if_not_exists: true
      });

      const { access_token } = res.data;
      localStorage.setItem('token', access_token);

      toast.success(lang === 'fr' ? "Inscription Google réussie !" : "Google signup successful!");
      const dest = planParam ? `/pricing?plan=${planParam}&cycle=${cycleParam}` : '/pricing'
      window.location.href = dest;
    } catch (err: any) {
      console.error("Erreur lors de l'envoi au backend (signup):", err);
      const msg = err.response?.data?.detail || (lang === 'fr' ? "Erreur lors de l'inscription Google." : "Google signup error.");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Tentative d'inscription Google...");
    if ((window as any).google) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn("Le prompt Google n'a pas pu être affiché (signup). Raison:", reason);

            if (reason === 'misconfigured_client') {
              toast.error(lang === 'fr'
                ? "Erreur 401: Client mal configuré. Vérifiez l'ID client et assurez-vous que l'origine (URL) est autorisée dans la console Google."
                : "Error 401: Misconfigured client. Check Client ID and ensure the origin (URL) is authorized in Google Console.");
            } else if (reason === 'suppressed_by_user') {
              toast.error(lang === 'fr'
                ? "Prompt Google bloqué. Veuillez vider les cookies de 'accounts.google.com' ou cliquer à nouveau."
                : "Google prompt suppressed. Please clear 'accounts.google.com' cookies or click again.");
            }
          }
        });
      } catch (err) {
        console.error("Erreur lors de l'appel à google.accounts.id.prompt:", err);
      }
    } else {
      console.error("SDK Google non disponible lors du clic.");
      toast.error(lang === 'fr' ? "Google n'est pas prêt. Réessayez dans un instant." : "Google is not ready. Try again in a moment.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const translations = {
    fr: {
      title: "Commencez à discuter",
      subtitle: "privément dès aujourd'hui.",
      desc: "Créez votre compte gratuit et découvrez les conversations IA avec une protection complète de la vie privée.",
      benefits: [
        { title: 'PII Local', desc: 'Les données restent ici' },
        { title: 'Multi-IA', desc: 'OpenAI, Claude & plus' },
        { title: 'Rapide', desc: 'Protection en temps réel' },
        { title: 'Gratuit', desc: 'Sans carte bancaire' },
      ],
      footerLeft: "Rejoignez plus de 10 000 utilisateurs prioritaires sur la confidentialité.",
      createAccount: "Créer votre compte",
      signupSubtitle: "Commencez avec votre compte gratuit",
      nameLabel: "Nom complet",
      namePlaceholder: "Jean Dupont",
      companyLabel: "Entreprise",
      companyOptional: "(optionnel)",
      companyPlaceholder: "Nom de votre entreprise",
      emailLabel: "Email",
      emailPlaceholder: "vous@exemple.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Créez un mot de passe fort",
      acceptTerms: "J'accepte les",
      termsLink: "Conditions d'utilisation",
      andThe: "et la",
      privacyLink: "Politique de confidentialité",
      signupButton: "Créer mon compte",
      signingUp: "Création...",
      orSignupWith: "Ou s'inscrire avec",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      loginLink: "Se connecter",
      passwordRequirements: {
        chars: "8+ caractères",
        upper: "Majuscule",
        number: "Chiffre",
        special: "Carac. spécial"
      }
    },
    en: {
      title: "Start chatting",
      subtitle: "privately today.",
      desc: "Create your free account and discover AI conversations with complete privacy protection.",
      benefits: [
        { title: 'Local PII', desc: 'Data stays here' },
        { title: 'Multi-AI', desc: 'OpenAI, Claude & more' },
        { title: 'Fast', desc: 'Real-time protection' },
        { title: 'Free', desc: 'No credit card' },
      ],
      footerLeft: "Join over 10,000 users who prioritize privacy.",
      createAccount: "Create your account",
      signupSubtitle: "Get started with your free account",
      nameLabel: "Full Name",
      namePlaceholder: "John Doe",
      companyLabel: "Company",
      companyOptional: "(optional)",
      companyPlaceholder: "Your company name",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a strong password",
      acceptTerms: "I accept the",
      termsLink: "Terms of Service",
      andThe: "and the",
      privacyLink: "Privacy Policy",
      signupButton: "Create my account",
      signingUp: "Creating...",
      orSignupWith: "Or sign up with",
      alreadyHaveAccount: "Already have an account?",
      loginLink: "Login",
      passwordRequirements: {
        chars: "8+ characters",
        upper: "Uppercase",
        number: "Number",
        special: "Special char"
      }
    }
  }

  const t = translations[lang]

  if (isPageLoading) return <PageLoader />

  const passwordRequirements = [
    { label: t.passwordRequirements.chars, met: password.length >= 8 },
    { label: t.passwordRequirements.upper, met: /[A-Z]/.test(password) },
    { label: t.passwordRequirements.number, met: /\d/.test(password) },
    { label: t.passwordRequirements.special, met: /[!@#$%^&*]/.test(password) }
  ]

  const passwordStrength = passwordRequirements.filter(r => r.met).length

  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const cycleParam = searchParams.get('cycle') || 'monthly'

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      toast.error(lang === 'fr' ? "Veuillez accepter les conditions." : "Please accept terms.")
      return
    }
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        full_name: name,
        company: company || undefined
      })

      const { access_token } = response.data
      localStorage.setItem('token', access_token)

      toast.success(lang === 'fr' ? "Compte créé ! Redirection..." : "Account created! Redirecting...")
      setTimeout(() => {
        const dest = planParam ? `/pricing?plan=${planParam}&cycle=${cycleParam}` : '/pricing'
        window.location.href = dest
      }, 1000)
    } catch (err: any) {
      const msg = err.response?.data?.detail || (lang === 'fr' ? "Une erreur est survenue." : "An error occurred.")
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,#ffffff_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_20%,#000000_0%,transparent_50%)]" />
          <div className="absolute top-1/3 left-0 w-80 h-80 bg-background/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className=" flex items-center gap-3 mb-8">
              <img src="/light.svg" className="w-8 dark:hidden" alt="Logo" />
              <img src="/dark.svg" className="w-8 hidden dark:block" alt="Logo" />
              <span className="font-bold text-2xl text-secondary">Data Private</span>
              <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
            </div>

            <div className="flex items-center bg-background/10 p-1 rounded-xl">
              <button
                onClick={() => setLang('fr')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'fr' ? 'bg-background text-foreground' : 'text-background/50 hover:text-background'}`}
              >
                FR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-background text-foreground' : 'text-background/50 hover:text-background'}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8 animate-reveal">
            <div>
              <h1 className="text-4xl font-black text-background leading-tight mb-4 tracking-tighter">
                {t.title}<br />
                <span className="opacity-70">
                  {t.subtitle}
                </span>
              </h1>
              <p className="text-background/70 text-lg max-w-md font-medium">
                {t.desc}
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              {t.benefits.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-background/5 border border-background/10 hover:bg-background/10 transition-colors">
                  {[Shield, Sparkles, Zap, Check][idx] && React.createElement([Shield, Sparkles, Zap, Check][idx], { className: "w-5 h-5 text-background mb-2" })}
                  <p className="text-background font-bold text-sm">{item.title}</p>
                  <p className="text-background/50 text-xs font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-background/50 text-sm font-medium">
            {t.footerLeft}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md sm:py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
            <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
            <span className="font-bold text-2xl text-primary">Data Private</span>
            <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
          </div>

          {/* Header */}
          <div className="mb-8 animate-reveal">
            <h2 className="text-3xl font-black text-foreground mb-2 tracking-tighter">
              {t.createAccount}
            </h2>
            <p className="text-muted-foreground font-medium">
              {t.signupSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4 animate-reveal" style={{ animationDelay: '100ms' }}>
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                {t.nameLabel}
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border focus:bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                {t.companyLabel} <span className="text-muted-foreground font-normal">{t.companyOptional}</span>
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t.companyPlaceholder}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border focus:bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                {t.emailLabel}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border focus:bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                {t.passwordLabel}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-muted/50 border border-border focus:bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level
                          ? passwordStrength <= 1 ? 'bg-foreground/40'
                            : passwordStrength <= 2 ? 'bg-foreground/60'
                              : passwordStrength <= 3 ? 'bg-foreground/80'
                                : 'bg-foreground'
                          : 'bg-muted'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {passwordRequirements.map((req, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-1 rounded-full font-bold ${req.met
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {req.met && <Check className="w-3 h-3 inline mr-1" />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-3 animate-reveal">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
                className="w-4 h-4 mt-0.5 rounded border-border accent-foreground"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground font-medium leading-tight">
                {t.acceptTerms}{' '}
                <Link href="/terms" className="text-foreground font-bold hover:underline">{t.termsLink}</Link>
                {' '}{t.andThe}{' '}
                <Link href="/terms" className="text-foreground font-bold hover:underline">{t.privacyLink}</Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="w-full py-3.5 rounded-xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg mt-6 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  {t.signingUp}
                </>
              ) : (
                <>
                  {t.signupButton}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground font-medium">
                  {t.orSignupWith}
                </span>
              </div>
            </div>

            <div id="google-button-signup" className="w-full min-h-[44px] flex justify-center" />
          </form>

          {/* Login link */}
          <p className="text-center mt-8 text-muted-foreground font-medium">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="text-foreground font-bold hover:underline transition-all">
              {t.loginLink}
            </Link>
          </p>
        </div>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignupContent />
    </Suspense>
  )
}
