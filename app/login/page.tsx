'use client'

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PageLoader } from "@/components/ui/page-loader"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { isTauriRuntime } from '@/lib/platform'
import { toast } from 'sonner'
import Script from 'next/script'
import { Badge } from "@/components/ui/badge"

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [lang, setLang] = React.useState<'fr' | 'en'>('fr')
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const cycleParam = searchParams.get('cycle') || 'monthly'
  const [isPageLoading, setIsPageLoading] = useState(false)
  const version = process.env.NEXT_PUBLIC_REVISION || 'dev'
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ref.current.style.setProperty("--x", `${x}px`);
    ref.current.style.setProperty("--y", `${y}px`);
  };

  // Initialiser Google Identity Services
  const initGoogle = () => {
    if (typeof window === 'undefined' || !(window as any).google) return;

    (window as any).google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: true, // Permet la connexion automatique si un seul compte est disponible
    });

    renderGoogleButton();
  };

  const renderGoogleButton = () => {
    if (typeof window === 'undefined' || !(window as any).google) return;

    const btnElem = document.getElementById("google-button");
    if (btnElem) {
      const parentWidth = btnElem.parentElement?.clientWidth || 400;
      (window as any).google.accounts.id.renderButton(
        btnElem,
        {
          theme: "outline",
          size: "large",
          width: parentWidth,
          text: "continue_with"
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
    if (response.error) {
      console.error("Erreur retournée par Google SDK:", response.error);
      toast.error(lang === 'fr' ? `Erreur Google: ${response.error}` : `Google error: ${response.error}`);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', {
        id_token: response.credential
      });

      const { access_token, must_renew } = res.data;
      localStorage.setItem('token', access_token);

      // Async wakeup request
      api.post('/pii/wakeup').catch(e => console.error("Wakeup failed", e));

      toast.success(lang === 'fr' ? "Connexion Google réussie !" : "Google login successful!");
      const defaultDest = isTauriRuntime() ? '/' : '/dashboard'
      const dest = must_renew ? '/dashboard#profile' : (planParam ? `/pricing?plan=${planParam}&cycle=${cycleParam}` : defaultDest)
      window.location.href = dest;
    } catch (err: any) {
      console.error("Erreur lors de l'envoi au backend:", err);
      if (err.response?.status === 404) {
        toast.error(lang === 'fr'
          ? "Aucun compte trouvé avec cet email. Veuillez vous inscrire."
          : "No account found with this email. Please sign up.");
        setTimeout(() => {
          window.location.href = '/signup';
        }, 2000);
      } else {
        const msg = err.response?.data?.detail || (lang === 'fr' ? "Erreur lors de la connexion Google." : "Google login error.");
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Tentative de connexion Google...");
    if ((window as any).google) {
      try {
        // Optionnel: On peut aussi essayer de forcer l'affichage du One Tap
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn("Le prompt Google n'a pas pu être affiché. Raison:", reason);

            // Si le prompt automatique est bloqué, on peut utiliser le bouton de secours ou informer l'utilisateur
            if (reason === 'opt_out_or_no_session') {
              // C'est normal si l'utilisateur n'est pas connecté à Google ou a refusé le One Tap
              // Dans ce cas, on devrait idéalement avoir un bouton de rendu Google standard
              console.log("L'utilisateur n'est pas connecté ou a opt-out. Utilisation du bouton standard conseillée.");
            }

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
      title: "Votre vie privée,",
      subtitle: "notre priorité.",
      desc: "Discutez avec l'IA tout en gardant vos informations personnelles totalement privées et sécurisées.",
      features: [
        { text: "Protection PII sur l'appareil" },
        { text: "Plusieurs fournisseurs d'IA" }
      ],
      footerLeft: "Approuvé par des milliers d'utilisateurs soucieux de leur vie privée.",
      welcome: "Bon retour parmi nous",
      loginSubtitle: "Connectez-vous pour accéder à votre compte",
      emailLabel: "Email",
      emailPlaceholder: "vous@exemple.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Votre mot de passe",
      forgotPassword: "Oublié ?",
      rememberMe: "Se souvenir de moi pendant 30 jours",
      loginButton: "Se connecter",
      loggingIn: "Connexion...",
      orContinueWith: "Ou continuer avec",
      noAccount: "Vous n'avez pas de compte ?",
      signupLink: "S'inscrire gratuitement"
    },
    en: {
      title: "Your privacy,",
      subtitle: "our priority.",
      desc: "Chat with AI while keeping your personal information completely private and secure.",
      features: [
        { text: "On-device PII protection" },
        { text: "Multiple AI providers" }
      ],
      footerLeft: "Trusted by thousands of privacy-conscious users.",
      welcome: "Welcome back",
      loginSubtitle: "Log in to access your account",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Your password",
      forgotPassword: "Forgot?",
      rememberMe: "Remember me for 30 days",
      loginButton: "Login",
      loggingIn: "Logging in...",
      orContinueWith: "Or continue with",
      noAccount: "Don't have an account?",
      signupLink: "Sign up for free"
    }
  }

  const t = translations[lang]

  if (isPageLoading) return <PageLoader />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const data = new URLSearchParams()
      data.append('username', email)
      data.append('password', password)

      const response = await api.post(
        '/auth/login',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const { access_token, must_renew } = response.data
      localStorage.setItem('token', access_token)

      // Async wakeup request
      api.post('/pii/wakeup').catch(e => console.error("Wakeup failed", e));

      toast.success(lang === 'fr' ? 'Connexion réussie !' : 'Login successful!')
      const defaultDest = isTauriRuntime() ? '/' : '/dashboard'
      const dest = must_renew ? '/dashboard#profile' : (planParam ? `/pricing?plan=${planParam}&cycle=${cycleParam}` : defaultDest)
      window.location.href = dest
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        (lang === 'fr'
          ? 'Email ou mot de passe incorrect.'
          : 'Invalid email or password.')

      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }





  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground"
      >
        {/* Radial background (FULL BACKGROUND) */}
        <div
          className="
      pointer-events-none absolute inset-0 opacity-20
      [background:radial-gradient(800px_circle_at_var(--x)_var(--y),white,transparent_60%)]
      dark:[background:radial-gradient(800px_circle_at_var(--x)_var(--y),rgba(0,0,0,1),transparent_60%)]
    "
        />

        {/* Optional ambient blob */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-background/10 rounded-full blur-3xl opacity-30" />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/light.svg" className="w-8 dark:hidden" alt="Logo" />
              <img src="/dark.svg" className="w-8 hidden dark:block" alt="Logo" />
              <span className="font-bold text-2xl text-secondary">
                Data Private
              </span>
              <span className="text-xs text-muted-foreground hidden group-hover:block">{version}</span>
              <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
            </Link>

            <div className="flex items-center bg-background/10 p-1 rounded-xl">
              <button
                onClick={() => setLang("fr")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === "fr"
                  ? "bg-background text-foreground"
                  : "text-background/50 hover:text-background"
                  }`}
              >
                FR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === "en"
                  ? "bg-background text-foreground"
                  : "text-background/50 hover:text-background"
                  }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8 animate-reveal max-w-lg">
            <div>
              <h1 className="text-4xl font-black text-background leading-tight mb-4 tracking-tighter">
                {t.title}
                <br />
                <span className="opacity-70">{t.subtitle}</span>
              </h1>
              <p className="text-background/70 text-lg font-medium">
                {t.desc}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {t.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-background" />
                  </div>
                  <span className="text-background/80 text-sm font-medium">
                    {feature.text}
                  </span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
            <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
            <span className="font-bold text-2xl text-prima">Data Private</span>
          </div>

          {/* Header */}
          <div className="mb-8 animate-reveal">
            <h2 className="text-3xl font-black text-foreground mb-2 tracking-tighter">
              {t.welcome}
            </h2>
            <p className="text-muted-foreground font-medium">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 animate-reveal" style={{ animationDelay: '100ms' }}>
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
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border focus:bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-foreground">
                  {t.passwordLabel}
                </label>
                <Link href="/forgot-password" title={t.forgotPassword} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {t.forgotPassword}
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border accent-foreground"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground font-medium">
                {t.rememberMe}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-3 animate-reveal">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  {t.loggingIn}
                </>
              ) : (
                <>
                  {t.loginButton}
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
                  {t.orContinueWith}
                </span>
              </div>
            </div>

            <div id="google-button" className="w-full min-h-[44px] flex justify-center" />
          </form>

          {/* Sign up link */}
          <p className="text-center mt-8 text-muted-foreground font-medium">
            {t.noAccount}{' '}
            <Link href="/signup" className="text-foreground font-bold hover:underline transition-all">
              {t.signupLink}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginContent />
    </Suspense>
  )
}
