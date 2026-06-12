'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Zap, Shield, Crown, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    id: 'starter',
    monthlyPrice: 29,
    yearlyPrice: "24,17",
    totalYearly: 290,
    savings: 58,
    description: 'Démarrer en toute sécurité avec l’IA',
    features: [
      '1000 crédits IA inclus',
      'Protection automatique des données sensibles',
      'Accès multi-modèles (GPT, Claude, Mistral…)',
      'Chat IA sécurisé',
      'Support PDF, Doc & images',
      'Hébergement RGPD (France)',
    ],
    icon: Shield,
    color: 'blue'
  },
  {
    name: 'Pro',
    id: 'pro',
    monthlyPrice: 99,
    yearlyPrice: "82,50",
    totalYearly: 990,
    savings: 198,
    description: 'Automatiser et gagner du temps',
    features: [
      'Fonctionnalités de Starter',
      '4000 crédits IA',
      'Modèles Pro plus performants',
      'Raisonnement avancé',
      'API (500 requêtes incluses)',
      'Priorité de traitement',
    ],
    icon: Zap,
    color: 'emerald',
    popular: true
  },
  // {
  //   name: 'Business',
  //   id: 'business',
  //   monthlyPrice: 299,
  //   yearlyPrice: "249,17",
  //   totalYearly: 2990,
  //   savings: 598,
  //   description: 'Scalabilité et organisation',
  //   features: [
  //     '10 000 crédits IA',
  //     'API jusqu’à 3000 requêtes',
  //     'Multi-utilisateurs (5 inclus)',
  //     'Workspace & organisation',
  //     'Dashboard d’usage',
  //     'Support prioritaire',
  //   ],
  //   icon: Crown,
  //   color: 'purple'
  // },
  {
    name: 'Enterprise',
    id: 'enterprise',
    monthlyPrice: "Contact",
    yearlyPrice: "Contact",
    description: 'Sécurité et conformité à grande échelle',
    features: [
      'API avancée & usage illimité',
      'Intégration SI',
      'SLA & support dédié',
      'SSO (à venir)',
      'Logs & audit (à venir)',
      'Déploiement personnalisé'
    ],
    icon: Shield,
    color: 'red'
  }
]

export interface PricingSectionProps {
  isModal?: boolean;
  currentPlanId?: string;
  currentBillingCycle?: string;
}

export function PricingSection({
  isModal = false,
  currentPlanId,
  currentBillingCycle
}: PricingSectionProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [promoCode, setPromoCode] = useState('')
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false)

  const handleSubscribe = async (planId: string, customCycle?: 'monthly' | 'yearly') => {
    const cycle = customCycle || billingCycle

    if (isModal) {
      try {
        const response = await api.post('/stripe/update-portal', {
          plan_name: planId,
          billing_cycle: cycle
        })
        const data = response.data
        if (data.url) {
          window.location.href = data.url
        }
      } catch (error) {
        console.error('Update portal error:', error)
      }
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      // Redirect to signup with intent
      router.push(`/signup?plan=${planId}&cycle=${cycle}`)
      return
    }

    try {
      const response = await api.post('/stripe/create-checkout', {
        plan_name: planId,
        billing_cycle: cycle,
        promo_code: promoCode === 'BASIC100' && planId === 'basic' ? 'BASIC100' : undefined
      })
      const data = response.data
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  // Auto-subscribe effect
  useEffect(() => {
    const planFromUrl = searchParams.get('plan')
    const cycleFromUrl = searchParams.get('cycle') as 'monthly' | 'yearly' | null
    const token = localStorage.getItem('token')

    if (token && planFromUrl && !hasAutoTriggered) {
      setHasAutoTriggered(true)
      handleSubscribe(planFromUrl, cycleFromUrl || 'monthly')
    }
  }, [searchParams, hasAutoTriggered])

  // const displayPlans = isModal ? plans.filter(p => p.id !== 'enterprise') : plans
  const displayPlans = plans

  return (
    <section id="pricing" className="snap-start  min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">Choisissez votre plan</h2>
          <p className="text-lg text-muted-foreground mx-auto mb-8">
            Des prix transparents pour protéger vos données. Économisez 20% avec l'abonnement annuel.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn("text-sm font-bold", billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground")}>Mensuel</span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-muted rounded-full p-1 transition-colors duration-300 focus:outline-none"
            >
              <div className={cn(
                "w-5 h-5 bg-primary rounded-full transition-transform duration-300",
                billingCycle === 'yearly' ? "translate-x-7" : "translate-x-0"
              )} />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-bold", billingCycle === 'yearly' ? "text-foreground" : "text-muted-foreground")}>Annuel</span>
              <Badge variant="default" className="px-2 py-1">
                2 mois offerts
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPlans.map((plan) => {
            const isCurrentPlan = isModal && plan.id === currentPlanId && billingCycle === currentBillingCycle;
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative rounded-3xl p-8 flex flex-col transition-all duration-300",
                  plan.popular
                    ? "bg-zinc-950 text-white shadow-2xl scale-105 z-10 dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-50 text-zinc-900 border border-zinc-100 shadow-sm dark:bg-zinc-950 dark:text-white dark:border-zinc-800"
                )}
              >
                {/* {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-white text-zinc-950 px-4 py-1 rounded-full text-xs font-black shadow-lg hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-800">
                    LE PLUS POPULAIRE
                  </Badge>
                </div>
              )} */}

                <div className="flex flex-row gap-4 mb-6">
                  <h3 className={cn("text-xl font-medium", plan.popular ? "text-white dark:text-black" : "text-zinc-600 dark:text-zinc-300")}>{plan.name}</h3>
                  {plan.popular && (
                    <Badge className="flex flex-row items-center gap-2 bg-white text-zinc-950 px-3 py-1 rounded-full text-xs font-black shadow-lg hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-800">
                      <Star className="w-3 h-3" fill="currentColor" /> Recommandé
                    </Badge>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    {plan.id !== 'enterprise' && billingCycle === 'yearly' && (
                      <span className="text-2xl font-semibold line-through text-muted-foreground opacity-80">
                        {plan.monthlyPrice}€
                      </span>
                    )}

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold">{billingCycle === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice || plan.monthlyPrice)}{plan.id !== 'enterprise' ? '€' : ''}</span>
                      <span className={cn("font-medium", plan.popular ? "text-white dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400", plan.id === 'enterprise' ? "opacity-0" : "opacity-100")}>/mois</span>
                    </div>
                  </div>
                  <p className={cn("text-xs font-medium mt-2", plan.popular ? "text-white dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
                    , billingCycle === 'yearly' ? "opacity-100" : "opacity-0"
                    , plan.id === 'enterprise' ? "opacity-0" : "opacity-100")}>
                    {plan.totalYearly}€ facturés par an (Économisez {plan.savings}€)
                  </p>

                </div>

                {/* <p className={cn("text-sm mb-8", plan.popular ? "text-white dark:text-black" : "text-zinc-500 dark:text-zinc-400")}>{plan.description}</p> */}

                <div className="mb-4">
                  <p className={cn("text-sm font-medium mb-4", plan.popular ? "text-white dark:text-black" : "text-zinc-900 dark:text-zinc-300")}>Fonctionnalités :</p>
                  <div className="space-y-4 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-medium">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          plan.popular ? "bg-white text-black dark:bg-black dark:text-white" : "bg-black text-white dark:bg-white dark:text-black"
                        )}>
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className={cn(plan.popular ? "text-white dark:text-black" : "text-zinc-600 dark:text-zinc-300")}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-grow"></div>

                <Button
                  onClick={() => plan.id === 'enterprise' ? window.location.href = 'mailto:contact@dataprivate.fr' : handleSubscribe(plan.id)}
                  size="lg"
                  disabled={isCurrentPlan}
                  className={cn(
                    "w-full h-12 rounded-xl font-medium text-base transition-all duration-300 mt-8",
                    plan.popular ? "bg-white text-black hover:bg-zinc-200 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800" : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
                    isCurrentPlan && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {plan.id === 'enterprise' ? 'Nous contacter' : isCurrentPlan ? 'Abonnement actuel' : "S'abonner"}
                </Button>
              </motion.div>
            )
          })}
        </div>
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 dark:bg-zinc-950 rounded-xl px-5 py-2.5">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Paiement 100% sécurisé par notre partenaire</span>
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded translate-y-[1px] shadow-sm">
              <span className="bg-[#635BFF] text-white px-2 py-0.5 font-bold text-xs">stripe</span>
              <span className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 font-medium text-xs">Partner</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
