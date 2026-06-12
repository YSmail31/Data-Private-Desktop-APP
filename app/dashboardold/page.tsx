"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { toast } from "sonner"
import { PageLoader } from "@/components/ui/page-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarPortal
} from "@/components/ui/menubar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Send, Bot, User, Shield, Eye, EyeOff, Lock, Unlock, Plus, MessageSquare,
  Trash2, Sparkles, Search, Paperclip, X, FileText, ImageIcon, Menu,
  ChevronDown, ChevronLeft, ChevronRight, Settings, HelpCircle, Sun, Hourglass, LogOut, LayoutDashboard,
  Key, Database, Smartphone, Monitor, Box, Cpu, Activity, Tags, TrendingUp, ArrowRight, Zap,
  Bell, HelpCircle as Help, Search as SearchIcon, Copy, Check, Rocket, ShieldCheck, Terminal, Code2, Play, BarChart3, CircleArrowRight,
  Apple, Wind, Download, Square, RotateCcw, PanelLeft, Loader2, FileIcon, CheckCircle2, XCircle
} from "lucide-react"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { fetchAIProviders, getProviderForModel, DEFAULT_AI_PROVIDERS, AIProvider } from "@/lib/ai-config"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


// --- Interfaces & Types ---
interface PII {
  id: string
  value: string
  type: string
  placeholder?: string
  locked: boolean
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  piis: PII[]
  showPiiValues: boolean
  isLoading?: boolean
  error?: boolean
  isProcessingFiles?: boolean
  fileProcessingStatus?: FileProcessingStatus[]
  filePiiMappings?: Record<string, string> // New field for file-specific PIIs
}

interface FileProcessingStatus {
  id: string
  filename: string
  status: "pending" | "loader" | "anonymisation" | "finished" | "error"
  error?: string
  output_base64?: string
  mime_type?: string
  pii_map?: Record<string, string>
}

// --- Mock Data ---
const labels_dict: Record<string, string[]> = {
  "personal_identity": [
    "first_name", "last_name", "title", "date of birth", "country", "city",
    "address", "postal code", "national id number", "identity card number",
    "identity document number", "passport number", "passport_number", "passport expiration date",
    "driver's license number", "social_security_number", "tax identification number",
    "cpf", "cnpj"
  ],
  "contact_information": [
    "phone number", "mobile phone number", "fax number", "email",
    "email address", "social media handle", "username"
  ],
  "financial_information": [
    "credit card number", "credit card expiration date", "credit card brand",
    "cvv", "cvc", "bank account number", "iban", "bic", "money", "transaction number"
  ],
  "health_information": [
    "medical condition", "medication", "drug", "dose", "blood type", "healthcare number"
  ],
  "sensitive_personal_information": [
    "religion", "marital status"
  ],
  "professional_information": [
    "organization_name", "occupation", "registration number", "insurance company"
  ],
  "vehicle_and_travel": [
    "license plate number", "vehicle registration number", "serial number",
    "flight number", "visa number"
  ],
  "technical_and_digital": [
    "ip address", "mac address", "digital signature", "password"
  ],
  "date_and_time": [
    "date", "time"
  ],
  "other": [
    "numerical"
  ]
}

const translations: any = {
  fr: {
    sidebar: {
      newChat: "Nouveau Chat",
      principal: "Principal",
      overview: "Vue d'ensemble",
      apiKeys: "Clés API",
      entityDetection: "Détection d'entités",
      chatbot: "Chatbot",
      documentation: "Documentation",
      applications: "Applications et Extensions",
      desktop: "Application Desktop",
      mobile: "Application Mobile",
      infrastructure: "Infrastructure",
      docker: "Docker & Proxy",
      hardware: "Appliance Hardware",
      light: "Clair",
      dark: "Sombre",
      comingSoon: "Bientôt",
      word: "Extension Word",
      n8n: "Nœud n8n",
      dev: "Développeurs"
    },
    navbar: {
      search: "Rechercher...",
      monCompte: "Mon Compte",
      profil: "Profil",
      logout: "Déconnexion"
    },
    profile: {
      title: "Mon Profil",
      subtitle: "Gérez vos informations personnelles et votre compte.",
      personalInfo: "Informations Personnelles",
      fullName: "Nom complet",
      email: "Adresse Email",
      company: "Entreprise",
      planInfo: "Détails du Plan",
      currentPlan: "Plan actuel",
      status: "Statut du compte",
      security: "Sécurité",
      changePassword: "Changer le mot de passe",
      oldPassword: "Ancien mot de passe",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le nouveau mot de passe",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      passwordSuccess: "Mot de passe mis à jour avec succès",
      passwordError: "Erreur lors de la mise à jour du mot de passe",
      active: "Actif",
      edit: "Modifier le profil",
      save: "Enregistrer",
      cancel: "Annuler",
      updateSuccess: "Profil mis à jour avec succès",
      updateError: "Erreur lors de la mise à jour du profil",
      upgradePlan: "Choisir un plan",
      upgradeSuccess: "Plan mis à jour avec succès",
      upgradeError: "Erreur lors de la mise à jour du plan",
      choosePlan: "Protegez vos données ",
      enterpriseContact: "Contactez-nous",
      planPro: {
        name: "PRO",
        price: "29€",
        period: "/mois",
        features: [
          "10,000 requêtes / mois",
          "Support prioritaire",
          "Tous les modèles LLM",
          "Accès aux nouvelles fonctionnalités"
        ]
      },
      planEnterprise: {
        name: "Enterprise",
        price: "Sur mesure",
        features: [
          "Requêtes illimitées",
          "Déploiement On-Premise",
          "SLA Garanti",
          "Contactez-nous pour une offre entreprise"
        ]
      }
    },
    overview: {
      title: "Vue d'ensemble",
      subtitle: "Bienvenue sur votre espace de gestion Data Private.",
      stats: {
        apiRequests: "Requêtes API",
        detectedEntities: "Entités détectées",
        monthlyLimit: "Limite mensuelle",
        plan: "Plan"
      },
      apiUsage: {
        title: "Utilisation API",
        subtitle: "Votre consommation ce mois-ci",
        requests: "Requêtes",
        activeKeys: "Nombre de clé API"
      },
      quickActions: {
        title: "Actions rapides",
        subtitle: "Accès rapide aux fonctionnalités principales",
        manageApiKeys: "Gérer les clés API",
        detectEntities: "Détecter des entités",
        openChatbot: "Ouvrir le chatbot",
        deployDocker: "Déployer Docker"
      },
      recentActivity: {
        title: "Activité récente",
        subtitle: "Vos dernières actions",
        viewAll: "Voir tout"
      }
    },
    desktop: {
      title: "Application Desktop",
      subtitle: "La puissance de la protection PII, directement sur votre machine.",
      features: [
        { title: "100% Local", desc: "Détection et anonymisation sans connexion cloud nécessaire." },
        { title: "Performance Native", desc: "Optimisé pour utiliser les capacités de votre processeur (M1/M2/Intel)." },
        { title: "Zéro Latence", desc: "Traitement instantané de vos documents et conversations." }
      ],
      securityTitle: "Pourquoi choisir la version Desktop ?",
      securityPoints: [
        "Vos clés API restent stockées dans votre trousseau d'accès système sécurisé.",
        "Analyse en temps réel de votre presse-papier (clipboard) pour prévenir les fuites accidentelles.",
        "Support des fichiers volumineux (PDF, CSV) jusqu'à 500 Mo en local.",
        "Intégration native avec les raccourcis clavier système."
      ]
    },
    apiKeys: {
      title: "Clés API",
      subtitle: "Gérez vos clés API pour accéder aux services d'anonymisation.",
      newKey: "Nouvelle clé",
      modal: {
        title: "Créer une nouvelle clé API",
        nameLabel: "Nom de la clé",
        namePlaceholder: "ex: Application Production",
        typeLabel: "Environnement",
        expirationLabel: "Date d'expiration",
        limitLabel: "Limite de requêtes",
        unlimited: "Illimitée",
        cancel: "Annuler",
        create: "Créer la clé",
        creating: "Création..."
      },
      stats: {
        activeKeys: "Nombre de clé API",
        accordingToPlan: "selon votre plan",
        totalRequests: "Requêtes totales",
        thisMonth: "ce mois-ci",
        monthlyLimit: "Limite mensuelle",
        remaining: "requêtes restantes"
      },
      table: {
        title: "Vos clés API",
        description: "Cliquez sur une clé pour la copier. Gardez vos clés secrètes.",
        name: "Nom",
        key: "Clé",
        created: "Créée le",
        lastUsed: "Dernière utilisation",
        status: "Statut",
        requests: "Requêtes",
        actions: "Actions"
      }
    },
    apiDocs: {
      title: "Documentation API",
      subtitle: "Intégrez la puissance de Data Private dans vos propres applications et flux de travail.",
      introParagraph: "Data Private offre une API robuste et sécurisée pour l'anonymisation de données en temps réel. Que vous construisiez un chatbot interne, un système de traitement de documents ou que vous souhaitiez simplement protéger les données de vos utilisateurs, notre API vous fournit les outils nécessaires pour identifier et masquer les informations personnellement identifiables (PII) avec une précision exceptionnelle.",
      supportedLabels: {
        title: "Labels Supportés",
        description: "Notre modèle est capable de détecter et d'anonymiser une vaste gamme d'entités sensibles :",
        list: [
          "first_name", "last_name", "organization_name", "phone number", "religion", "marital status", "address",
          "passport number", "email", "credit card number", "date of birth", "date", "time", "mobile phone number",
          "bank account number", "medication", "cpf", "driver's license number", "tax identification number",
          "medical condition", "blood type", "dose", "drug", "identity card number", "national id number",
          "ip address", "email address", "iban", "bic", "credit card expiration date", "username", "healthcare number",
          "registration number", "flight number", "cvv", "digital signature", "social media handle",
          "license plate number", "cnpj", "postal code", "passport_number", "serial number",
          "vehicle registration number", "credit card brand", "fax number", "visa number", "insurance company",
          "identity document number", "transaction number", "cvc", "passport expiration date",
          "social_security_number", "country", "money", "numerical", "title", "occupation", "city",
          "mac address", "password"
        ]
      },
      developerSteps: {
        title: "Étapes pour les développeurs",
        step1: {
          title: "Obtenir une clé API",
          description: "Générez une clé d'accès sécurisée depuis votre tableau de bord pour authentifier vos requêtes.",
          paragraph: "La première étape consiste à créer une identité numérique pour votre application. Dans l'onglet 'Clés API', vous pouvez générer des clés uniques pour différents environnements (développement, test, production). Chaque clé vous permet de suivre votre consommation et de gérer les limites de requêtes de manière indépendante."
        },
        step2: {
          title: "Configurer l'authentification",
          description: "Ajoutez le header 'X-API-Key' à vos requêtes HTTP pour valider votre identité.",
          paragraph: "Pour des raisons de sécurité, Data Private utilise une authentification par clé API. Vous devez inclure votre clé dans chaque appel sortant vers nos services. Le header standard à utiliser est 'X-API-Key'. Assurez-vous de garder cette clé secrète et de ne jamais l'exposer dans du code client (frontend) public."
        },
        step3: {
          title: "Effectuer votre premier appel",
          description: "Utilisez l'endpoint d'extraction pour commencer à anonymiser vos contenus immédiatement.",
          paragraph: "Une fois authentifié, vous pouvez envoyer vos données textuelles à notre endpoint d'extraction. L'API analysera le contenu, identifiera les entités sensibles selon vos paramètres, et vous renverra une version anonymisée prête à être utilisée ou stockée en toute conformité avec le RGPD."
        }
      },
      quickStart: {
        title: "Démarrage Rapide",
        step1: "Récupérez votre clé API dans l'onglet 'Clés API'.",
        step2: "Configurez l'authentification dans vos headers.",
        step3: "Envoyez votre première requête d'extraction."
      },
      authentication: {
        title: "Authentification",
        description: "Pour authentifier vos requêtes, vous devez inclure votre clé API dans le header HTTP 'X-API-Key'."
      },
      endpoints: {
        title: "Endpoints",
        extract: {
          title: "Extraction PII",
          description: "Anonymise un texte en remplaçant les entités identifiées par des placeholders.",
          method: "POST",
          path: "/api/v1/public/extract"
        }
      },
      parameters: {
        title: "Paramètres de la requête",
        name: "Nom",
        type: "Type",
        description: "Description",
        required: "Requis",
        fields: {
          text: "Le texte brut à analyser (ex: emails, chats, documents).",
          labels: "Optionnel. Liste des types d'entités à détecter. Si omis ou vide, tous les types supportés seront recherchés.",
          threshold: "Optionnel. Seuil de confiance minimal (0.0 à 1.0). Valeur par défaut : 0.1."
        }
      },
      response: {
        title: "Format de la réponse",
        description: "L'API retourne un objet JSON contenant le texte anonymisé et les entités détectées.",
        fields: {
          text: "Le texte avec les placeholders.",
          entities: "Liste des entités trouvées avec leurs positions et types.",
          duration: "Temps de traitement en millisecondes."
        }
      },
      examples: {
        title: "Exemples de code",
        copy: "Copier",
        copied: "Copié !",
        test: "Tester l'API",
        testing: "En cours...",
        payload: "Corps de la requête (JSON)",
        response: "Réponse de l'API",
        noResponse: "Aucune réponse pour le moment"
      },
      help: {
        title: "Besoin d'aide ?",
        description: "Consultez notre FAQ ou contactez le support technique pour toute question relative à l'intégration."
      }
    },
    chatbot: {
      welcome: "Bienvenue",
      iam: "Je suis",
      principle: "Je suis basé sur un seul principe simple",
      joke: "“Gardons ça privé”.",
      title: "Assistant IA Sécurisé",
      subtitle: "Vos données sont anonymisées localement avant traitement",
      placeholder: "Posez une question ou envoyez un document...",
      thinking: "Génération de réponse en cours...",
      config: {
        title: "Paramètres de l'IA (LLM)",
        subtitle: "Choisissez votre fournisseur et modèle",
        provider: "Fournisseur",
        model: "Modèle",
        apiKey: "Clé API Fournisseur",
        apiKeyPlaceholder: "Entrez votre clé API OpenAI",
        save: "Enregistrer la configuration",
        saving: "Enregistrement...",
        cancel: "Annuler"
      },
      piiPanel: {
        title: "Entités Détectées",
        subtitle: "Données sensibles identifiées",
        search: "Rechercher...",
        noEntities: "Aucune entité détectée",
        locked: "Verrouillé",
        unlocked: "Déverrouillé",
        hidePii: "Masquer PII",
        revealPii: "Révéler PII",
        detected: "Détectés"
      },
      noApiKey: {
        title: "Clé API manquante",
        description: "Vous ne pouvez pas utiliser le chatbot sans configurer la clé API de votre fournisseur (OpenAI, Claude, etc.).",
        action: "Configurer maintenant"
      }
    },
    entityDetection: {
      title: "Détection d'entités",
      subtitle: "Identifiez et anonymisez les informations sensibles dans vos textes.",
      inputPlaceholder: "Entrez votre texte contenant des données personnelles ici...\n\nExemple : Bonjour, je suis Jean Dupont, né le 14 avril 1987. J'habite au 27 avenue des Lilas, 75019 Paris.",
      resultPlaceholder: "Le résultat de la détection apparaîtra ici...",
      copy: "Copier le texte",
      copied: "Copié !",
      duration: "Temps de traitement",
      confidenceThreshold: "Seuil de confiance",
      sidebarTitle: "Paramètres de détection",
      labelsTitle: "Labels à détecter",
      labelsSubtitle: "Sélectionnez les entités à rechercher",
      selectAll: "Tout sélectionner",
      deselectAll: "Tout désélectionner",
      originalText: "Texte Original",
      detectionResult: "Résultat de Détection",
      entities: "Entités",
      noEntities: "Aucune entité sensible détectée dans ce texte.",
      categories: {
        personal_identity: "Identité Personnelle",
        contact_information: "Coordonnées",
        financial_information: "Informations Financières",
        health_information: "Informations de Santé",
        sensitive_personal_information: "Données Sensibles",
        professional_information: "Informations Professionnelles",
        vehicle_and_travel: "Véhicules et Voyages",
        technical_and_digital: "Données Techniques",
        date_and_time: "Dates et Heures",
        other: "Autres"
      },
      entitiesTable: {
        title: "Entités détectées",
        value: "Valeur",
        type: "Type",
        confidence: "Confiance"
      }
    }
  },
  en: {
    sidebar: {
      newChat: "New Chat",
      principal: "Main",
      overview: "Overview",
      apiKeys: "API Keys",
      entityDetection: "Entity Detection",
      chatbot: "Chatbot",
      documentation: "Documentation",
      applications: "Applications & Extensions",
      desktop: "Desktop App",
      mobile: "Mobile App",
      infrastructure: "Infrastructure",
      docker: "Docker & Proxy",
      hardware: "Appliance Hardware",
      light: "Light",
      dark: "Dark",
      comingSoon: "Soon",
      word: "Word Extension",
      n8n: "n8n Node",
      dev: "Developers"
    },
    navbar: {
      search: "Search...",
      monCompte: "My Account",
      profil: "Profile",
      logout: "Logout"
    },
    profile: {
      title: "My Profile",
      subtitle: "Manage your personal information and account.",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      email: "Email Address",
      company: "Company",
      planInfo: "Plan Details",
      currentPlan: "Current Plan",
      status: "Account Status",
      security: "Security",
      changePassword: "Change Password",
      oldPassword: "Old Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      passwordMismatch: "Passwords do not match",
      passwordSuccess: "Password updated successfully",
      passwordError: "Error updating password",
      active: "Active",
      edit: "Edit Profile",
      save: "Save",
      cancel: "Cancel",
      updateSuccess: "Profile updated successfully",
      updateError: "Error updating profile",
      upgradePlan: "Upgrade Plan",
      upgradeSuccess: "Plan updated successfully",
      upgradeError: "Error updating plan",
      choosePlan: "Choose a plan",
      enterpriseContact: "Contact us for an enterprise offer"
    },
    overview: {
      title: "Overview",
      subtitle: "Welcome to your Data Private management space.",
      stats: {
        apiRequests: "API Requests",
        detectedEntities: "Detected Entities",
        monthlyLimit: "Monthly Limit",
        plan: "Plan"
      },
      apiUsage: {
        title: "API Usage",
        subtitle: "Your consumption this month",
        requests: "Requests",
        activeKeys: "API Key Count"
      },
      quickActions: {
        title: "Quick Actions",
        subtitle: "Quick access to main features",
        manageApiKeys: "Manage API Keys",
        detectEntities: "Detect Entities",
        openChatbot: "Open Chatbot",
        deployDocker: "Deploy Docker"
      },
      recentActivity: {
        title: "Recent Activity",
        subtitle: "Your last actions",
        viewAll: "View all"
      }
    },
    desktop: {
      title: "Desktop Application",
      subtitle: "The power of PII protection, directly on your machine.",
      features: [
        { title: "100% Local", desc: "Detection and anonymization without cloud connection required." },
        { title: "Native Performance", desc: "Optimized to use your processor's capabilities (M1/M2/Intel)." },
        { title: "Zero Latency", desc: "Instant processing of your documents and conversations." }
      ],
      securityTitle: "Why choose the Desktop version?",
      securityPoints: [
        "Your API keys stay stored in your secure system keychain.",
        "Real-time analysis of your clipboard to prevent accidental leaks.",
        "Support for large files (PDF, CSV) up to 500 MB locally.",
        "Native integration with system keyboard shortcuts."
      ]
    },
    apiKeys: {
      title: "API Keys",
      subtitle: "Manage your API keys to access anonymization services.",
      newKey: "New Key",
      modal: {
        title: "Create New API Key",
        nameLabel: "Key Name",
        namePlaceholder: "e.g., Production App",
        typeLabel: "Environment",
        expirationLabel: "Expiration Date",
        limitLabel: "Request Limit",
        unlimited: "Unlimited",
        cancel: "Cancel",
        create: "Create Key",
        creating: "Creating..."
      },
      stats: {
        activeKeys: "API Key Count",
        accordingToPlan: "according to your plan",
        totalRequests: "Total Requests",
        thisMonth: "this month",
        monthlyLimit: "Monthly Limit",
        remaining: "requests remaining"
      },
      table: {
        title: "Your API Keys",
        description: "Click on a key to copy. Keep your keys secret.",
        name: "Name",
        key: "Key",
        created: "Created on",
        lastUsed: "Last used",
        status: "Status",
        requests: "Requests",
        actions: "Actions"
      }
    },
    apiDocs: {
      title: "API Documentation",
      subtitle: "Integrate the power of Data Private into your own applications and workflows.",
      introParagraph: "Data Private provides a robust and secure API for real-time data anonymization. Whether you're building an internal chatbot, a document processing system, or simply looking to protect your users' data, our API gives you the tools to identify and mask personally identifiable information (PII) with exceptional accuracy.",
      supportedLabels: {
        title: "Supported Labels",
        description: "Our model is capable of detecting and anonymizing a wide range of sensitive entities:",
        list: [
          "first_name", "last_name", "organization_name", "phone number", "religion", "marital status", "address",
          "passport number", "email", "credit card number", "date of birth", "date", "time", "mobile phone number",
          "bank account number", "medication", "cpf", "driver's license number", "tax identification number",
          "medical condition", "blood type", "dose", "drug", "identity card number", "national id number",
          "ip address", "email address", "iban", "bic", "credit card expiration date", "username", "healthcare number",
          "registration number", "flight number", "cvv", "digital signature", "social media handle",
          "license plate number", "cnpj", "postal code", "passport_number", "serial number",
          "vehicle registration number", "credit card brand", "fax number", "visa number", "insurance company",
          "identity document number", "transaction number", "cvc", "passport expiration date",
          "social_security_number", "country", "money", "numerical", "title", "occupation", "city",
          "mac address", "password"
        ]
      },
      developerSteps: {
        title: "Developer Steps",
        step1: {
          title: "Get an API Key",
          description: "Generate a secure access key from your dashboard to authenticate your requests.",
          paragraph: "The first step is to create a digital identity for your application. In the 'API Keys' tab, you can generate unique keys for different environments (development, test, production). Each key allows you to track your usage and manage request limits independently."
        },
        step2: {
          title: "Configure Authentication",
          description: "Add the 'X-API-Key' header to your HTTP requests to validate your identity.",
          paragraph: "For security reasons, Data Private uses API key authentication. You must include your key in every outgoing call to our services. The standard header to use is 'X-API-Key'. Make sure to keep this key secret and never expose it in public client-side (frontend) code."
        },
        step3: {
          title: "Make Your First Call",
          description: "Use the extraction endpoint to start anonymizing your content immediately.",
          paragraph: "Once authenticated, you can send your text data to our extraction endpoint. The API will analyze the content, identify sensitive entities according to your settings, and return an anonymized version ready to be used or stored in full compliance with GDPR."
        }
      },
      quickStart: {
        title: "Quick Start",
        step1: "Retrieve your API key from the 'API Keys' tab.",
        step2: "Configure authentication in your headers.",
        step3: "Send your first extraction request."
      },
      authentication: {
        title: "Authentication",
        description: "To authenticate your requests, you must include your API key in the 'X-API-Key' HTTP header."
      },
      endpoints: {
        title: "Endpoints",
        extract: {
          title: "PII Extraction",
          description: "Anonymizes a text by replacing identified entities with placeholders.",
          method: "POST",
          path: "/api/v1/pii/extract"
        }
      },
      parameters: {
        title: "Request Parameters",
        name: "Name",
        type: "Type",
        description: "Description",
        required: "Required",
        fields: {
          text: "The raw text to analyze (e.g., emails, chats, documents).",
          labels: "Optional. List of entity types to detect. If omitted or empty, all supported types will be searched.",
          threshold: "Optional. Minimum confidence threshold (0.0 to 1.0). Default: 0.1."
        }
      },
      response: {
        title: "Response Format",
        description: "The API returns a JSON object containing the anonymized text and detected entities.",
        fields: {
          text: "The text with placeholders.",
          entities: "List of found entities with their positions and types.",
          duration: "Processing time in milliseconds."
        }
      },
      examples: {
        title: "Code Examples",
        copy: "Copy",
        copied: "Copied!",
        test: "Test API",
        testing: "Testing...",
        payload: "Request Body (JSON)",
        response: "API Response",
        noResponse: "No response yet"
      },
      help: {
        title: "Need help?",
        description: "Check our FAQ or contact technical support for any integration-related questions."
      }
    },
    chatbot: {
      welcome: "Welcome back",
      iam: "I am",
      principle: "I’m built on one simple principle",
      joke: "Let's keep it private",
      title: "Secure AI Assistant",
      subtitle: "Your data is anonymized locally before processing",
      placeholder: "Ask a question or send a document...",
      thinking: "Generating response...",
      config: {
        title: "AI Settings (LLM)",
        subtitle: "Choose your provider and model",
        provider: "Provider",
        model: "Model",
        apiKey: "Provider API Key",
        apiKeyPlaceholder: "Enter OpenAI API key",
        save: "Save configuration",
        saving: "Saving...",
        cancel: "Cancel"
      },
      piiPanel: {
        title: "Detected Entities",
        subtitle: "Identified sensitive data",
        search: "Search...",
        noEntities: "No entities detected",
        locked: "Locked",
        unlocked: "Unlocked",
        hidePii: "Hide PII",
        revealPii: "Reveal PII",
        detected: "Detected"
      },
      noApiKey: {
        title: "Missing API Key",
        description: "You cannot use the chatbot without configuring your provider's API key (OpenAI, Claude, etc.).",
        action: "Configure Now"
      }
    },
    entityDetection: {
      title: "Entity Detection",
      subtitle: "Identify and anonymize sensitive information in your text.",
      inputPlaceholder: "Enter your text containing personal data here...\\n\\nExample: Hello, I am Jean Dupont, born on April 14, 1987. I live at 27 avenue des Lilas, 75019 Paris.",
      resultPlaceholder: "Detection results will appear here...",
      copy: "Copy text",
      copied: "Copied!",
      duration: "Processing time",
      confidenceThreshold: "Confidence threshold",
      sidebarTitle: "Detection Settings",
      labelsTitle: "Labels to detect",
      labelsSubtitle: "Select entities to look for",
      selectAll: "Select all",
      deselectAll: "Deselect all",
      originalText: "Original Text",
      detectionResult: "Detection Result",
      entities: "Entities",
      noEntities: "No sensitive entities detected in this text.",
      categories: {
        personal_identity: "Personal Identity",
        contact_information: "Contact Information",
        financial_information: "Financial Information",
        health_information: "Health Information",
        sensitive_personal_information: "Sensitive Personal Information",
        professional_information: "Professional Information",
        vehicle_and_travel: "Vehicle & Travel",
        technical_and_digital: "Technical & Digital",
        date_and_time: "Date & Time",
        other: "Other"
      },
      entitiesTable: {
        title: "Detected Entities",
        value: "Value",
        type: "Type",
        confidence: "Confidence"
      }
    }
  }
}

const piiTypes = [
  { type: "person", label: "Personne", color: "bg-muted text-foreground border-border" },
  { type: "email", label: "Email", color: "bg-muted text-foreground border-border" },
  { type: "phone", label: "Tel", color: "bg-muted text-foreground border-border" },
  { type: "address", label: "Adresse", color: "bg-muted text-foreground border-border" },
  { type: "iban", label: "IBAN", color: "bg-muted text-foreground border-border" },
  { type: "ssn", label: "Secu", color: "bg-muted text-foreground border-border" },
]

const stats = []

const recentActivity = [
  { type: "api", message: "Nouvelle cle API creee", time: "Il y a 2 min" },
  { type: "detection", message: "1,234 entites anonymisees", time: "Il y a 15 min" },
  { type: "chatbot", message: "Session chatbot terminee", time: "Il y a 1 heure" },
  { type: "api", message: "Limite API augmentee", time: "Il y a 3 heures" },
]

const exampleMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Bonjour ! Je suis votre assistant IA securise. Vos donnees personnelles sont automatiquement anonymisees. Comment puis-je vous aider ?",
    timestamp: new Date(),
    piis: [],
    showPiiValues: false,
  }
]

// --- Helper Functions ---
const getPiiColor = (type: string) => {
  const typeLower = type.toLowerCase().replace(/ /g, '_')
  // Chercher dans les catégories
  for (const [category, labels] of Object.entries(labels_dict)) {
    if (labels.some(l => l.toLowerCase().replace(/ /g, '_') === typeLower)) {
      switch (category) {
        case 'personal_identity': return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
        case 'contact_information': return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        case 'financial_information': return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
        case 'health_information': return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
        case 'sensitive_personal_information': return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
        case 'professional_information': return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
        case 'vehicle_and_travel': return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30"
        case 'technical_and_digital': return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30"
        case 'date_and_time': return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
        default: return "bg-muted text-foreground border-border"
      }
    }
  }
  return "bg-muted text-foreground border-border"
}
const getPiiLabel = (type: string) => {
  if (type.startsWith('user_')) {
    // Transformer "user_string_pii_1" -> "user_string"
    return type.split('_pii_')[0].replace(/_/g, ' ')
  }
  return type
}
const getInitials = (name: string) => {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// --- Main Page Component ---
export default function DashboardPage() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") as "overview" | "chatbot" | "api-keys" | "entity-detection" | "api-docs" | "desktop" | null

  const [activeTab, setActiveTab] = React.useState<"overview" | "chatbot" | "api-keys" | "entity-detection" | "api-docs" | "profile" | "desktop">(
    initialTab || "overview"
  )

  // Update URL when tab changes
  React.useEffect(() => {
    const currentTab = searchParams.get("tab")
    if (activeTab !== currentTab) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", activeTab)
      router.push(`/dashboard?${params.toString()}`, { scroll: false })
    }
  }, [activeTab, router, searchParams])

  // Sync state if URL changes (e.g. back button)
  React.useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as any
    if (tabFromUrl && tabFromUrl !== activeTab && ["overview", "chatbot", "api-keys", "entity-detection", "api-docs", "profile", "desktop"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const [isDark, setIsDark] = React.useState(false)
  const [lang, setLang] = React.useState<'fr' | 'en'>('fr')
  const [modelSelectorOpen, setModelSelectorOpen] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [isAuthenticating, setIsAuthenticating] = React.useState(true)
  const [apiKeys, setApiKeys] = React.useState<any[]>([])
  const [selectedApiKey, setSelectedApiKey] = React.useState<string>("YOUR_API_KEY")
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = React.useState(false)
  const [createdKey, setCreatedKey] = React.useState<string | null>(null)
  const [newKeyData, setNewKeyData] = React.useState<{ name: string, type: string, expires_at: string | null, request_limit: number | null }>({
    name: "",
    type: "dev",
    expires_at: null,
    request_limit: null
  })
  const [isCreatingKey, setIsCreatingKey] = React.useState(false)
  const [aiProviders, setAiProviders] = React.useState<AIProvider[]>(DEFAULT_AI_PROVIDERS)

  // Fetch AI Providers on mount
  React.useEffect(() => {
    const loadProviders = async () => {
      const providers = await fetchAIProviders()
      setAiProviders(providers)
    }
    loadProviders()
  }, [])

  // API Documentation Test State
  const [testResult, setTestResult] = React.useState<any>(null)
  const [isTestingApi, setIsTestingApi] = React.useState(false)
  const [selectedTestLang, setSelectedTestLang] = React.useState<'python' | 'javascript' | 'curl' | 'php'>('python')
  const [isTestSnippetCopied, setIsTestSnippetCopied] = React.useState(false)
  const [testPayload, setTestPayload] = React.useState<string>(JSON.stringify({
    "text": "Bonjour, je m'appelle Jean Dupont et mon email est jean@exemple.com",
    "labels": [],
    "confidence_threshold": 0.3,
  }, null, 2))

  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDetecting, setIsDetecting] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([])
  const [piiSearch, setPiiSearch] = React.useState("")
  const [piiOpen, setPiiOpen] = React.useState(false)
  const [abortController, setAbortController] = React.useState<AbortController | null>(null)
  const currentContentRef = React.useRef("")

  // Chat History & Sessions
  const [sessions, setSessions] = React.useState<any[]>([])
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(null)
  const [sessionSearch, setSessionSearch] = React.useState("")
  const [historyOpen, setHistoryOpen] = React.useState(true)
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = React.useState(false)
  const [aiConfig, setAiConfig] = React.useState({ provider: "openai", model: "gpt-4o", api_key: "" })
  const [isSavingAiConfig, setIsSavingAiConfig] = React.useState(false)
  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const [editedUser, setEditedUser] = React.useState({ full_name: "", company: "" })
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [passwordData, setPasswordData] = React.useState({ old_password: "", new_password: "", confirm_password: "" })
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)
  const [showOldPassword, setShowOldPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false)
  const [isUpgradingPlan, setIsUpgradingPlan] = React.useState(false)
  // No longer needed due to shadcn sidebar

  // Gérer l'exclusivité entre l'historique et le panneau PII
  React.useEffect(() => {
    if (piiOpen && historyOpen) {
      setHistoryOpen(false)
    }
  }, [piiOpen])

  React.useEffect(() => {
    if (historyOpen && piiOpen) {
      setPiiOpen(false)
    }
  }, [historyOpen])

  // Entity Detection State
  const [detectionInput, setDetectionInput] = React.useState("")
  const [detectionResult, setDetectionResult] = React.useState("")

  // Initialiser la clé API sélectionnée avec la première clé disponible
  React.useEffect(() => {
    if (apiKeys.length > 0 && selectedApiKey === "YOUR_API_KEY") {
      setSelectedApiKey(apiKeys[0].key)
    }
  }, [apiKeys])
  const [originalDetectionResult, setOriginalDetectionResult] = React.useState("")
  const [isCopied, setIsCopied] = React.useState(false)
  const [detectedEntities, setDetectedEntities] = React.useState<any[]>([])
  const [detectionDuration, setDetectionDuration] = React.useState<number | null>(null)
  const [detectionThreshold, setDetectionThreshold] = React.useState<number>(0.1)
  const [selectedLabels, setSelectedLabels] = React.useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([])
  const [detectionStats, setDetectionStats] = React.useState({
    total: 0,
    change: 0,
    requests: 0,
    requestsChange: 0,
    currentMonthRequests: 0,
    daily_usage: [] as { date: string, requests: number }[]
  })
  const [userConsumption, setUserConsumption] = React.useState<any>(null)

  const [entitySidebarOpen, setEntitySidebarOpen] = React.useState(true)

  React.useEffect(() => {
    if (isMobile) setEntitySidebarOpen(false)
  }, [isMobile])

  const t = translations[lang]

  const recentActivity = [
    { type: "api", message: lang === 'fr' ? "Requête d'extraction effectuée" : "Extraction request performed", time: lang === 'fr' ? "À l'instant" : "Just now" },
    { type: "detection", message: `${detectionStats.total.toLocaleString()} ${lang === 'fr' ? 'entités anonymisées' : 'entities anonymized'}`, time: lang === 'fr' ? "À l'instant" : "Just now" },
    { type: "chatbot", message: "Session chatbot terminee", time: "Il y a 1 heure" },
    { type: "api", message: "Limite API augmentee", time: "Il y a 3 heures" },
  ]

  const isTokenBased = userConsumption?.type === 'token';
  const usageValue = isTokenBased ? userConsumption?.usage : apiKeys.reduce((acc, k) => acc + k.request_count, 0);
  const usageLimit = isTokenBased ? userConsumption?.limit : (user?.user_plan?.request_limit || 50);
  const usageLabel = isTokenBased ? (lang === 'fr' ? 'Tokens' : 'Tokens') : t.overview.apiUsage.requests;
  const usagePercent = Math.min(100, Math.max(0, (usageValue / (usageLimit || 1)) * 100));

  const stats = [
    { title: t.overview.stats.apiRequests, value: detectionStats.requests.toLocaleString(), change: `${detectionStats.requestsChange >= 0 ? '+' : ''}${detectionStats.requestsChange}%`, trend: detectionStats.requestsChange >= 0 ? "up" : "down", icon: Activity, color: "text-foreground", bg: "bg-muted" },
    { title: t.overview.stats.detectedEntities, value: detectionStats.total.toLocaleString(), change: `${detectionStats.change >= 0 ? '+' : ''}${detectionStats.change}%`, trend: detectionStats.change >= 0 ? "up" : "down", icon: Tags, color: "text-foreground", bg: "bg-muted" },
    { title: isTokenBased ? (lang === 'fr' ? "Consommation" : "Consumption") : (lang === 'fr' ? "Requêtes" : "Requests"), value: usageValue?.toLocaleString() || "0", change: `/ ${usageLimit?.toLocaleString() || "∞"}`, trend: "up", icon: Zap, color: "text-foreground", bg: "bg-muted" },
    { title: t.overview.stats.plan, value: user?.user_plan?.name?.toUpperCase() || "FREE", change: "Active", trend: "up", icon: Rocket, color: "text-foreground", bg: "bg-muted" },
  ]

  const [isTestingConfig, setIsTestingConfig] = React.useState(false)
  const [showApiKey, setShowApiKey] = React.useState(false)

  /* New independent state for the provider dialog */
  const [providerDialogConfig, setProviderDialogConfig] = React.useState({ provider: "openai", model: "", api_key: "" })

  const handleTestAiConfig = async () => {
    setIsTestingConfig(true)
    try {
      toast.info(lang === 'fr' ? "Test de connexion..." : "Testing connection...")

      // Determine the model to test with: use the first model of the selected provider
      const selectedProvider = aiProviders.find(p => p.id === providerDialogConfig.provider)
      const testModel = selectedProvider?.models[0]?.id || providerDialogConfig.model || "gpt-3.5-turbo"

      // Use the config from the dialog with the explicit model
      const configToTest = {
        ...providerDialogConfig,
        model: testModel
      }

      const response = await api.post('/chatbot-config/test-connection', configToTest)

      if (response.data.status === "success") {
        toast.success(response.data.message || (lang === 'fr' ? "Connexion réussie !" : "Connection successful!"))
      } else {
        toast.error(response.data.message || (lang === 'fr' ? "Échec du test" : "Test failed"))
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || (lang === 'fr' ? "Erreur : Clé invalide ou problème réseau" : "Error: Invalid key or network issue")
      toast.error(errorMsg)
    } finally {
      setIsTestingConfig(false)
    }
  }

  const handleTestApi = async (endpoint: string) => {
    setIsTestingApi(true)
    setTestResult(null)
    try {
      let payload;
      try {
        let cleanPayload = testPayload.trim();
        if (!cleanPayload.startsWith('{')) {
          cleanPayload = `{${cleanPayload}}`;
        }
        payload = JSON.parse(cleanPayload)
      } catch (e) {
        toast.error(lang === 'fr' ? "Format JSON invalide" : "Invalid JSON format")
        setIsTestingApi(false)
        return
      }
      const response = await api.post(endpoint, payload, {
        headers: {
          'X-API-Key': selectedApiKey
        }
      })
      setTestResult(response.data)
      toast.success(lang === 'fr' ? "Requête réussie !" : "Request successful!")
    } catch (err: any) {
      console.error("API Test Error:", err)
      setTestResult({
        ...err.response?.data,
        status: err.response?.status || 500,
        isError: true
      })
      toast.error(lang === 'fr' ? "Erreur lors de la requête" : "Request failed")
    } finally {
      setIsTestingApi(false)
    }
  }

  const dashboardStats = [
    t.overview.stats.apiRequests,
    t.overview.stats.detectedEntities,
    t.overview.stats.monthlyLimit,
    t.overview.stats.plan
  ]

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isProcessingFiles, setIsProcessingFiles] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Memoized PIIs
  const [activeSelection, setActiveSelection] = React.useState<{
    text: string;
    rect: DOMRect | null;
    msgId: string | null;
  } | null>(null);

  const allPiis = React.useMemo(() => {
    const piiMap = new Map<string, PII>()
    messages.forEach(msg => msg.piis.forEach(pii => piiMap.set(pii.value, pii)))
    return Array.from(piiMap.values()).sort((a, b) => {
      const aIsUser = a.type.startsWith('user_')
      const bIsUser = b.type.startsWith('user_')
      if (aIsUser && !bIsUser) return -1
      if (!aIsUser && bIsUser) return 1
      // Secondary sort: alphabetical or length? Let's stay with user first
      return a.value.localeCompare(b.value)
    })
  }, [messages])

  const filteredPiis = React.useMemo(() => {
    if (!piiSearch) return allPiis
    return allPiis.filter(pii =>
      pii.value.toLowerCase().includes(piiSearch.toLowerCase()) ||
      getPiiLabel(pii.type).toLowerCase().includes(piiSearch.toLowerCase())
    )
  }, [allPiis, piiSearch])

  // Fetch user data
  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/pii/stats')
      setDetectionStats({
        total: statsRes.data.total_entities,
        change: statsRes.data.entities_change_percentage,
        requests: statsRes.data.total_requests,
        requestsChange: statsRes.data.requests_change_percentage,
        currentMonthRequests: statsRes.data.current_month_requests,
        daily_usage: statsRes.data.daily_usage || []
      })
    } catch (err) {
      console.error("Failed to fetch stats", err)
    }
  }




  const [savedCredentials, setSavedCredentials] = React.useState<Record<string, string>>({})
  const [showAddProvider, setShowAddProvider] = React.useState(false)
  const [editingProvider, setEditingProvider] = React.useState<string | null>(null)

  const fetchSavedCredentials = async () => {
    try {
      const res = await api.get('/chatbot-config/credentials')
      setSavedCredentials(res.data)
    } catch (err) {
      console.error("Failed to fetch credentials", err)
    }
  }

  const fetchSessions = async (search?: string) => {
    try {
      const res = await api.get('/chatbot/sessions', { params: { search } })
      setSessions(res.data)
    } catch (err) {
      console.error("Failed to fetch sessions", err)
    }
  }

  const fetchAiConfig = async () => {
    try {
      const res = await api.get('/chatbot-config/')
      if (res.data) {
        setAiConfig({
          provider: res.data.provider,
          model: res.data.model,
          api_key: res.data.api_key
        })
        // Fetch saved credentials to have the complete map
        fetchSavedCredentials();
        return res.data
      } else {
        // Default to default free model (Gemini 2.0 Flash) if no config
        setAiConfig({ provider: 'google-free', model: 'gemini-2.0-flash', api_key: '' })
      }
    } catch (err) {
      console.error("Failed to fetch AI config", err)
    }
    return null
  }

  const handleSaveProviderConfig = async () => {
    if (!providerDialogConfig.api_key && providerDialogConfig.provider !== 'google-free') {
      toast.error(lang === 'fr' ? "La clé API est requise" : "API key is required")
      return
    }
    setIsSavingAiConfig(true)
    try {
      // Save ONLY the credential, do not switch the active config
      await api.post('/chatbot-config/credentials', {
        provider: providerDialogConfig.provider,
        api_key: providerDialogConfig.api_key
      })

      toast.success(lang === 'fr' ? "Configuration enregistrée" : "Configuration saved")

      // Update local credentials map
      setSavedCredentials(prev => ({ ...prev, [providerDialogConfig.provider]: providerDialogConfig.api_key }))

      // Refresh providers list (in case backend exposes new models based on creds, or just to sync)
      // Also ensures the UI reflects the available models for the new provider
      await fetchSavedCredentials()

      setShowAddProvider(false)
      setEditingProvider(null)
      // Only close if it was the initial setup or explicit close request
      if (!isAiConfigModalOpen) setIsAiConfigModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error(lang === 'fr' ? "Erreur lors de l'enregistrement" : "Error saving configuration")
    } finally {
      setIsSavingAiConfig(false)
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (providerId === 'google-free') return; // Cannot delete free provider
    try {
      await api.delete(`/chatbot-config/credentials/${providerId}`)
      setSavedCredentials(prev => {
        const newCreds = { ...prev }
        delete newCreds[providerId]
        return newCreds
      })
      toast.success(lang === 'fr' ? "Fournisseur supprimé" : "Provider deleted")
    } catch (err) {
      toast.error(lang === 'fr' ? "Erreur lors de la suppression" : "Error deleting provider")
    }
  }

  const handleUpdateProfile = async () => {
    if (!editedUser.full_name.trim()) {
      toast.error(lang === 'fr' ? "Le nom complet est requis" : "Full name is required")
      return
    }
    setIsUpdatingProfile(true)
    try {
      const res = await api.put('/auth/me', editedUser)
      setUser(res.data)
      setIsEditingProfile(false)
      toast.success(t.profile.updateSuccess)
    } catch (err) {
      toast.error(t.profile.updateError)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error(lang === 'fr' ? "Veuillez remplir tous les champs" : "Please fill in all fields")
      return
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error(t.profile.passwordMismatch)
      return
    }
    if (passwordData.new_password.length < 8) {
      toast.error(lang === 'fr' ? "Le mot de passe doit contenir au moins 8 caractères" : "Password must be at least 8 characters long")
      return
    }

    setIsUpdatingPassword(true)
    try {
      await api.put('/auth/me/password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      })
      toast.success(t.profile.passwordSuccess)
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" })
      setIsChangingPassword(false)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || t.profile.passwordError
      toast.error(errorMsg)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleUpgradePlan = async (planName: string) => {
    setIsUpgradingPlan(true)
    try {
      const res = await api.post('/auth/me/upgrade-plan', { plan_name: planName })
      setUser(res.data)
      setIsUpgradeModalOpen(false)
      toast.success(t.profile.upgradeSuccess)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || t.profile.upgradeError
      toast.error(errorMsg)
    } finally {
      setIsUpgradingPlan(false)
    }
  }

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await api.get(`/chatbot/sessions/${sessionId}/messages`)
      setMessages(res.data.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
        showPiiValues: false
      })))
    } catch (err) {
      console.error("Failed to fetch messages", err)
    }
  }

  const createSession = async (title: string = "Nouveau Chat") => {
    try {
      // Async wakeup request
      api.post('/pii/wakeup').catch(e => console.error("Wakeup failed", e));

      const res = await api.post('/chatbot/sessions', { title })
      setSessions(prev => [res.data, ...prev])
      setActiveSessionId(res.data.id)
      setMessages([])
      return res.data
    } catch (err) {
      console.error("Failed to create session", err)
    }
  }

  const deleteSession = async (sessionId: number) => {
    try {
      await api.delete(`/chatbot/sessions/${sessionId}`)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setMessages(exampleMessages)
      }
      toast.success(lang === 'fr' ? "Conversation supprimée" : "Conversation deleted")
    } catch (err) {
      console.error("Failed to delete session", err)
    }
  }



  // ...

  React.useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      try {
        const [userRes, apiKeysRes, detectionRes, statsRes, sessionsRes, aiConfigRes, consumptionRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/api-keys/'),
          api.get('/pii/'),
          api.get('/pii/stats'),
          api.get('/chatbot/sessions'),
          api.get('/chatbot-config/'),
          api.get('/auth/me/consumption')
        ])
        setUser(userRes.data)
        setUserConsumption(consumptionRes.data)
        setApiKeys(apiKeysRes.data)
        setSelectedLabels(detectionRes.data.selected_labels || [])
        setDetectionStats({
          total: statsRes.data.total_entities,
          change: statsRes.data.entities_change_percentage,
          requests: statsRes.data.total_requests,
          requestsChange: statsRes.data.requests_change_percentage,
          currentMonthRequests: statsRes.data.current_month_requests,
          daily_usage: statsRes.data.daily_usage || []
        })
        setSessions(sessionsRes.data)
        if (aiConfigRes.data && aiConfigRes.data.api_key) {
          setAiConfig({
            provider: aiConfigRes.data.provider,
            model: aiConfigRes.data.model,
            api_key: aiConfigRes.data.api_key
          })
        } else if (activeTab === 'chatbot') {
          // Si aucune config n'est trouvée au chargement initial et qu'on est sur le chatbot, on force l'ouverture du modal
          // setIsAiConfigModalOpen(true)
        }
        setIsAuthenticating(false)
      } catch (err) {
        // L'intercepteur dans lib/api.ts gérera le 401 et la redirection
        console.error("Data fetching failed", err)
      }
    }
    fetchData()
  }, [])

  // Rafraîchir les stats quand on passe sur l'onglet "Vue d'ensemble"
  React.useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats()
    }
  }, [activeTab])

  React.useEffect(() => {
    if (activeTab === 'chatbot') {
      api.post('/pii/wakeup').catch(e => console.error("Tab change wakeup failed", e));
    }
  }, [activeTab]);

  React.useEffect(() => {
    const checkAiConfigAndOpenModal = async () => {
      if (activeTab === 'chatbot') {
        fetchSessions(sessionSearch)
        const config = await fetchAiConfig()
        // Si aucune clé API n'est configurée lors du passage à l'onglet chatbot, ouvrir le modal
        // if (!isAuthenticating && (!config || (!config.api_key && config.provider !== 'google-free'))) {
        //   setIsAiConfigModalOpen(true)
        // }
      }
    }
    checkAiConfigAndOpenModal()
  }, [activeTab, sessionSearch, isAuthenticating])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error("Logout failed", err)
    } finally {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
  }

  const handleDeleteApiKey = async (id: number) => {
    try {
      await api.delete(`/api-keys/${id}`)
      setApiKeys(prev => prev.filter(k => k.id !== id))
      toast.success(lang === 'fr' ? "Clé supprimée" : "Key deleted")
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || (lang === 'fr' ? "Erreur lors de la suppression" : "Error deleting key")
      toast.error(errorMsg)
    }
  }

  const handleCopyApiKey = (keyValue: string) => {
    navigator.clipboard.writeText(keyValue)
    toast.success(lang === 'fr' ? "Clé copiée !" : "Key copied!")
  }

  const handleCreateApiKey = async () => {
    if (!newKeyData.name.trim()) {
      toast.error(lang === 'fr' ? "Veuillez entrer un nom" : "Please enter a name")
      return
    }
    setIsCreatingKey(true)
    try {
      const response = await api.post('/api-keys/', newKeyData)
      setApiKeys(prev => [response.data, ...prev])
      setCreatedKey(response.data.key)
      setNewKeyData({ name: "", type: "dev", expires_at: null, request_limit: null })
      toast.success(lang === 'fr' ? "Clé API créée" : "API Key created")
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || (lang === 'fr' ? "Erreur lors de la création" : "Error creating key")
      toast.error(errorMsg)
    } finally {
      setIsCreatingKey(false)
    }
  }
  const [apiUrl, setApiUrl] = React.useState('/api/v1')
  React.useEffect(() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    setApiUrl('/api/v1');
    if (hostname.includes('localhost') || isIpAddress) {
      setApiUrl(`${protocol}//${hostname}:8000/api/v1`);
    }
    else if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      setApiUrl(process.env.NEXT_PUBLIC_API_URL);
    }

  });


  const handleCopyTestSnippet = () => {
    let snippet = "";

    if (selectedTestLang === 'python') {
      snippet = `import requests

url = "${apiUrl}/public/extract"
headers = {"X-API-Key": "${selectedApiKey}"}
data = ${testPayload}

response = requests.post(url, json=data, headers=headers)
print(response.json())`;
    } else if (selectedTestLang === 'javascript') {
      snippet = `const url = "${apiUrl}/public/extract";
const headers = {
  "X-API-Key": "${selectedApiKey}"
};
const data = ${testPayload};

const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
console.log(await res.json());`;
    } else if (selectedTestLang === 'curl') {
      snippet = `curl -X POST "${apiUrl}/public/extract" \\
  -H "X-API-Key: ${selectedApiKey}" \\
  -d '${testPayload}'`;
    } else if (selectedTestLang === 'php') {
      const phpData = testPayload.replace(/"([^"]+)":/g, "'$1' =>");
      snippet = `<?php

$url = "${apiUrl}/public/extract";
$headers = [
  "X-API-Key: ${selectedApiKey}"
];

$data = ${phpData};

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;`;
    }

    navigator.clipboard.writeText(snippet);
    setIsTestSnippetCopied(true);
    toast.success(lang === 'fr' ? "Copié dans le presse-papier" : "Copied to clipboard");
    setTimeout(() => setIsTestSnippetCopied(false), 2000);
  };

  const categoryIcons: Record<string, any> = {
    personal_identity: User,
    contact_information: Smartphone,
    financial_information: Key,
    health_information: Activity,
    sensitive_personal_information: Shield,
    professional_information: Box,
    vehicle_and_travel: Monitor,
    technical_and_digital: Cpu,
    date_and_time: Bell,
    other: Tags
  }

  const handleClearInput = () => {
    setDetectionInput("")
    setDetectionResult("")
    setOriginalDetectionResult("")
    setDetectedEntities([])
    setDetectionDuration(null)
  }

  const handleDetection = async () => {
    if (!detectionInput.trim()) return

    // Si aucun label n'est sélectionné, on renvoie simplement le texte original
    if (selectedLabels.length === 0) {
      setDetectionResult(detectionInput)
      setOriginalDetectionResult(detectionInput)
      setDetectedEntities([])
      setDetectionDuration(null)
      return
    }

    setIsDetecting(true)
    setDetectionDuration(null)


    try {
      const response = await api.post('/pii/extract', {
        text: detectionInput,
        labels: selectedLabels,
        threshold: detectionThreshold
      })

      const entities = response.data.entities
      const duration = response.data.duration
      setDetectedEntities(entities)
      setDetectionDuration(duration)
      let result = detectionInput
      let originalResult = detectionInput

      // Trier les entités par longueur de texte décroissante pour éviter de remplacer des sous-parties
      const sortedEntities = [...entities].sort((a: any, b: any) => b.value.length - a.value.length)

      // Map pour suivre le nombre d'occurrences par type d'entité
      const entityCounts: Record<string, number> = {}

      sortedEntities.forEach((ent: any) => {
        const typeKey = ent.entity.toUpperCase().replace(/[ -]/g, '_')
        if (!entityCounts[typeKey]) entityCounts[typeKey] = 1

        const count = entityCounts[typeKey]
        const placeholder = `[${typeKey}_${count}]`
        const coloredPlaceholder = `__COLOR_PII_${typeKey}_${count}__`

        // Remplacement insensible à la casse
        const regex = new RegExp(ent.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        // On ne remplace que si on n'a pas déjà remplacé cette occurrence précise 
        // ou si elle n'est pas déjà dans un placeholder
        if (regex.test(result)) {
          // Utiliser une fonction de remplacement pour gérer les compteurs si plusieurs occurrences
          result = result.replace(regex, coloredPlaceholder);
          originalResult = originalResult.replace(regex, placeholder);
          entityCounts[typeKey]++;
        }
      })

      setDetectionResult(result)
      setOriginalDetectionResult(originalResult)
      toast.success(lang === 'fr' ? "Détection terminée" : "Detection completed")

      // Rafraîchir les stats après une détection réussie
      fetchStats()
    } catch (err: any) {
      console.error("Detection failed", err)
      const errorMsg = err.response?.data?.detail || (lang === 'fr' ? "Erreur lors de la détection" : "Detection error")
      toast.error(errorMsg)
    } finally {
      setIsDetecting(false)
    }
  }

  const handleCopyResult = () => {
    if (!originalDetectionResult) return
    navigator.clipboard.writeText(originalDetectionResult)
    setIsCopied(true)
    toast.success(t.entityDetection.copied)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const renderDetectionResult = () => {
    if (!detectionResult) return <div className="text-muted-foreground/20 p-6 italic">{t.entityDetection.resultPlaceholder}</div>

    // Si aucune entité n'est détectée, on affiche le texte brut
    if (detectedEntities.length === 0) return <div className="p-6 whitespace-pre-wrap text-sm font-medium leading-[1.5]">{detectionResult}</div>

    let content = detectionResult
    const parts: React.ReactNode[] = []
    let lastIdx = 0

    // On veut trouver tous les placeholders de type __COLOR_PII_TYPE_N__
    const placeholderRegex = /__COLOR_PII_([A-Z0-9_]+)_(\d+)__/g
    let match

    while ((match = placeholderRegex.exec(content)) !== null) {
      const fullMatch = match[0]
      const typeKey = match[1] // ex: FIRST_NAME
      const index = match.index

      // Ajouter le texte avant le badge
      if (index > lastIdx) {
        parts.push(<span key={`text-${lastIdx}`}>{content.slice(lastIdx, index)}</span>)
      }

      // Trouver le type original pour la couleur (FIRST_NAME -> first_name ou first name)
      let originalType = typeKey.toLowerCase().replace(/_/g, ' ')

      // Essayer de trouver le label exact dans labels_dict
      Object.values(labels_dict).flat().forEach(lbl => {
        if (lbl.toUpperCase().replace(/[ -]/g, '_') === typeKey) {
          originalType = lbl
        }
      })

      const isPiiLocked = (type: string, val: string) => {
        // Chercher si cette entité est verrouillée dans les entités détectées
        return detectedEntities.some(e => e.value === val && (e.entity === type || e.entity.toUpperCase().replace(/[ -]/g, '_') === type) && e.locked)
      }

      parts.push(
        <DropdownMenu key={`badge-${index}`}>
          <DropdownMenuTrigger asChild>
            <span
              className={cn(
                "mx-1 cursor-help transition-all duration-300 font-bold",
                getPiiColor(originalType).replace(/bg-[^ ]+/g, '').replace(/border-[^ ]+/g, '')
              )}
            >
              {isPiiLocked(originalType, detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.value || "")
                ? detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.value
                : `[${typeKey}_${match[2]}]`}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="text-xs font-bold p-2 min-w-[120px]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-muted-foreground uppercase tracking-widest">
                <span>{originalType}</span>
              </div>
              {detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey) && (
                <div className="flex flex-col gap-1.5 mt-1 border-t border-border pt-1">
                  <div className="flex items-center justify-between">
                    <span>Confiance</span>
                    <span className={cn(
                      "font-black tracking-tighter",
                      (detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.confidence || 0) > 0.8 ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {((detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-500"
                      style={{ width: `${(detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.confidence || 0) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1 border-t border-border pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground uppercase tracking-widest text-[8px]">{t.entityDetection.entitiesTable.value}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-md hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const val = detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.value;
                          if (val) togglePiiLock(val);
                        }}
                      >
                        {detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.locked ? <Unlock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-muted-foreground/40" />}
                      </Button>
                    </div>
                    <span className="text-foreground break-all">{detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey)?.value}</span>
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      lastIdx = index + fullMatch.length
    }

    // Ajouter le reste du texte
    if (lastIdx < content.length) {
      parts.push(<span key="text-end">{content.slice(lastIdx)}</span>)
    }

    return <div className="p-6 whitespace-pre-wrap text-sm font-medium text-foreground leading-relaxed animate-in fade-in duration-500">{parts}</div>
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleLabel = async (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label]

    setSelectedLabels(newLabels)
    try {
      await api.post('/pii/', { selected_labels: newLabels })
    } catch (err) {
      console.error("Failed to save settings", err)
    }
  }

  const toggleAllInCategory = async (category: string) => {
    const labels = labels_dict[category]
    const allSelected = labels.every(l => selectedLabels.includes(l))

    let newLabels: string[]
    if (allSelected) {
      newLabels = selectedLabels.filter(l => !labels.includes(l))
    } else {
      newLabels = [...new Set([...selectedLabels, ...labels])]
    }

    setSelectedLabels(newLabels)
    try {
      await api.post('/pii/', { selected_labels: newLabels })
    } catch (err) {
      console.error("Failed to save settings", err)
    }
  }

  const handleClearAllLabels = async () => {
    setSelectedLabels([])
    try {
      await api.post('/pii/', { selected_labels: [] })
    } catch (err) {
      console.error("Failed to save settings", err)
    }
  }

  if (isAuthenticating) {
    return <PageLoader />
  }

  // Chat Logic
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(lang === 'fr' ? "Copié dans le presse-papier" : "Copied to clipboard")
  }

  const handleStopStreaming = async () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsStreaming(false)
      setIsLoading(false)

      // Update assistant message locally immediately (stop thinking indicator)
      setMessages(prev => prev.map(m => {
        if (String(m.id).startsWith("assistant-") && (m as any).isLoading) {
          return { ...m, isLoading: false }
        }
        return m
      }))

      toast.info(lang === 'fr' ? "Génération arrêtée" : "Generation stopped")

      // Save partial content to DB if it's not empty
      if (currentContentRef.current && activeSessionId) {
        try {
          await api.post(`/chatbot/sessions/${activeSessionId}/messages`, {
            role: "assistant",
            content: currentContentRef.current,
            piis: [],
            raw_content: ""
          })
        } catch (e) {
          console.error("Failed to save partial message", e)
        }
      }

      fetchSessions(sessionSearch)
    }
  }

  const handleRetry = async (msgId: string) => {
    // Find the message to retry
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex === -1) return

    const msg = messages[msgIndex]

    // Remove all messages after this one (optional, but cleaner)
    const newMessages = messages.slice(0, msgIndex)
    setMessages(newMessages)

    // Setup input and send again
    setInput(msg.content)
    // We need to trigger handleSend, but we can't easily do it with the current input state
    // So we'll just manully call a modified send or just let useClick simulate it
    // For now, let's just set input and the user can click send, or we call handleSend directly
    // Actually, let's just call handleSend directly if we can
    setTimeout(() => handleSend(), 0)
  }

  const handleSend = async () => {
    if (!aiConfig.api_key && aiConfig.provider !== 'google-free') {
      setIsAiConfigModalOpen(true)
      toast.error(lang === 'fr' ? "Veuillez configurer votre clé API" : "Please configure your API key")
      return
    }
    if (!input.trim() && !attachedFiles.length) return

    let sessionId = activeSessionId
    if (!sessionId) {
      const newSession = await createSession(input.substring(0, 30) + (input.length > 30 ? "..." : ""))
      if (!newSession) return
      sessionId = newSession.id
    }

    setIsLoading(true)
    setIsDetecting(true)

    // Add user message immediately to the UI
    const userMsg: Message = {
      id: "temp-" + Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      piis: [],
      showPiiValues: false,
    }
    setMessages(prev => [...prev, userMsg])

    // Capture input and clear
    const currentInput = input
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    const currentAttachedFiles = [...attachedFiles]
    setAttachedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // 1. Détection PII réelle
    let processedInput = currentInput
    const detectedPiis: PII[] = []
    const globalValToPlaceholder: Record<string, string> = {}
    let globalCount = 0

    // 1. Populate mapping from ALL historical messages FIRST
    messages.forEach(m => {
      if (m.piis && m.piis.length > 0) {
        m.piis.forEach(pii => {
          const val = pii.value
          if (val && pii.placeholder && !globalValToPlaceholder[val]) {
            globalValToPlaceholder[val] = pii.placeholder
            // Keep track of the highest count seen to avoid collisions with new tokens
            const match = pii.placeholder.match(/_(\d+)\]$/)
            if (match) {
              const num = parseInt(match[1])
              if (!isNaN(num) && num > globalCount) globalCount = num
            }
          }
        })
      }
    })

    try {
      const settingsRes = await api.get('/pii/')
      const labels = settingsRes.data.selected_labels

      // BEFORE AI DETECTION: Check for existing manual PIIs in this session
      const userPiis = allPiis.filter(p => p.type.startsWith('user_'))
      userPiis.forEach(up => {
        const regex = new RegExp(up.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        if (regex.test(processedInput)) {
          // Add to detected list if not already there
          if (!detectedPiis.some(p => p.value.toLowerCase() === up.value.toLowerCase())) {
            // Respect previous lock status
            const isPublic = up.locked
            if (!isPublic) {
              const placeholder = up.placeholder || globalValToPlaceholder[up.value] || `[${up.type}]`
              processedInput = processedInput.replace(regex, placeholder)
              if (!globalValToPlaceholder[up.value]) globalValToPlaceholder[up.value] = placeholder
            }
            detectedPiis.push({ ...up, id: `pii-reuse-${Date.now()}-${up.id}` })
          }
        }
      })

      if (labels && labels.length > 0) {
        const detectionRes = await api.post('/pii/extract', {
          text: currentInput,
          labels: [],
        })

        const entities = detectionRes.data.entities
        if (entities && entities.length > 0) {
          const sortedEntities = [...entities].sort((a: any, b: any) => b.value.length - a.value.length)
          const lockedStatus = new Map<string, boolean>()
          allPiis.forEach(p => lockedStatus.set(p.value, p.locked))

          sortedEntities.forEach((ent: any, idx: number) => {
            const isPublic = lockedStatus.get(ent.value) === true
            const typeKey = ent.entity.toLowerCase().replace(/[ -]/g, '_')

            let placeholder = globalValToPlaceholder[ent.value]
            if (!placeholder) {
              globalCount++
              // Use decimal IDs (1, 2, 3...) to match user expectation and prompts
              placeholder = `[${typeKey}_${globalCount}]`
              globalValToPlaceholder[ent.value] = placeholder
            }

            const regex = new RegExp(ent.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            if (regex.test(processedInput)) {
              if (!isPublic) {
                processedInput = processedInput.replace(regex, placeholder);
              }
              detectedPiis.push({
                id: `pii-${Date.now()}-${idx}`,
                value: ent.value,
                type: ent.entity,
                placeholder: placeholder, // Store it!
                locked: isPublic
              })
            }
          })
        }
      }
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, piis: detectedPiis, raw_content: currentInput } : m))
    } catch (err) {
      console.error("PII detection failed, sending raw text", err)
    } finally {
      setIsDetecting(false)
    }

    // Build a reverse map for de-anonymizing the assistant response
    // We scan EVERYTHING: current detection, all historical messages (text piis & file mappings)
    const reverseMap: Record<string, string> = {}

    // 1. Current text detections
    Object.entries(globalValToPlaceholder).forEach(([realVal, placeholder]) => {
      reverseMap[placeholder] = realVal
    })

    // 2. All historical messages
    messages.forEach(m => {
      // Text PIIs
      if (m.piis && m.piis.length > 0) {
        m.piis.forEach(p => {
          if (p.placeholder && p.value) {
            reverseMap[p.placeholder] = p.value
          }
        })
      }
      // File PIIs
      if (m.filePiiMappings) {
        Object.entries(m.filePiiMappings).forEach(([realVal, placeholder]) => {
          reverseMap[placeholder as string] = realVal
        })
      }
    })

    // 2. File Processing (if any) & Chat Generation
    // 2. File Processing (if any) & Chat Generation
    try {
      let processedFilesForAi: { mime_type: string, data: string }[] = []
      const completedPiiMappings: Record<string, string> = {}

      let fileStatuses: FileProcessingStatus[] | undefined = undefined

      if (currentAttachedFiles.length > 0) {
        setIsProcessingFiles(true)

        const processingMsgId = "processing-" + Date.now().toString()
        const initialFileStatuses: FileProcessingStatus[] = currentAttachedFiles.map(f => ({
          id: f.name,
          filename: f.name,
          status: "pending"
        }))

        fileStatuses = initialFileStatuses
        // Add "Loader Assistant" message
        setMessages(prev => [...prev, {
          id: processingMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          piis: [],
          showPiiValues: false,
          isProcessingFiles: true,
          fileProcessingStatus: initialFileStatuses,
          isLoading: true
        } as any])

        const formData = new FormData()
        currentAttachedFiles.forEach(f => formData.append('files', f))

        const token = localStorage.getItem('token')
        const baseUrl = api.defaults.baseURL // Note: api instance might have baseURL set
        // Fallback if needed, typically api.defaults.baseURL is set or relative
        const urlObj = new URL(`${baseUrl || ''}/chatbot/sessions/${sessionId}/files`, window.location.origin);

        const fileResponse = await fetch(urlObj.toString(), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!fileResponse.ok) throw new Error('File processing failed')

        const reader = fileResponse.body?.getReader()
        if (!reader) throw new Error('No reader available for files')

        const decoder = new TextDecoder()
        let partialData = ""

        // Track completed files to send to AI
        const completedFilesMap: Record<string, { mime_type: string, data: string }> = {}

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = (partialData + chunk).split('\n')
          partialData = lines.pop() || ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            try {
              // Try to parse line as JSON directly
              let data;
              try {
                data = JSON.parse(trimmed)
              } catch (e) {
                // Fallback for SSE "data: " prefix if needed
                if (trimmed.startsWith("data: ")) {
                  data = JSON.parse(trimmed.slice(6))
                } else {
                  throw e
                }
              }


              if (data.type === 'init') {
                fileStatuses = data.files as FileProcessingStatus[]
                setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, fileProcessingStatus: fileStatuses } : m))
              } else if (data.type === 'update') {
                if (fileStatuses) {
                  fileStatuses = fileStatuses.map(f => f.id === data.file.id ? { ...f, ...(data.file as FileProcessingStatus) } : f)
                }
                setMessages(prev => prev.map(m => m.id === processingMsgId ? {
                  ...m,
                  fileProcessingStatus: fileStatuses
                } : m))

                if (data.file.status === 'finished') {
                  if (data.file.output_base64) {
                    completedFilesMap[data.file.id] = {
                      mime_type: data.file.mime_type || "application/pdf",
                      data: data.file.output_base64,
                      anonymized_markdown: data.file.anonymized_markdown
                    } as any
                  }
                  if (data.file.pii_map) {
                    Object.assign(completedPiiMappings, data.file.pii_map)
                  }
                }
              } else if (data.type === 'complete') {
                console.log("File processing completed")
              }
            } catch (e) {
              console.error("Error parsing stream JSON", e, trimmed)
            }
          }
        }
        processedFilesForAi = Object.values(completedFilesMap)
        setIsProcessingFiles(false)
      }

      // 3. Start Chat Generation
      setIsStreaming(true)
      currentContentRef.current = ""

      let assistantMsgId: string;
      if (currentAttachedFiles.length > 0) {
        // Find the processing message and reuse its ID for the streaming response
        // It was named "processing-" + Date.now().toString()
        const expectedProcessingId = messages.find(m => m.isProcessingFiles)?.id || ("processing-" + Date.now().toString());
        // Since we are creating a new block below if needed, let's actually just create a new one securely.
        // Wait, the user asked to convert processing to assistant.
        // The easiest way to convert it is to just re-use its ID.
        // Let's find the last processing message ID. We can grab it from `fileStatuses` context if we stored it, but we can also just find it in the state.

      }

      assistantMsgId = "assistant-" + Date.now().toString()

      setMessages(prev => {
        // If we want to replace the processing message, we could map it.
        // But the previous implementation appended a NEW assistant message.
        // The user said: "convert processing to assistant".
        // Let's modify the last processing message to BE the assistant message.
        const lastProcessingIdx = prev.findIndex(m => m.isProcessingFiles)
        if (lastProcessingIdx !== -1 && currentAttachedFiles.length > 0) {
          assistantMsgId = prev[lastProcessingIdx].id
          return prev.map((m, i) => i === lastProcessingIdx ? {
            ...m,
            isProcessingFiles: false, // Turn off processing loader visually if needed, or keep it to show files alongside chat
            isLoading: true,
            filePiiMappings: Object.keys(completedPiiMappings).length > 0 ? completedPiiMappings : undefined,
          } : m)
        } else {
          return [...prev, {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            piis: [],
            showPiiValues: false,
            isLoading: true,
            filePiiMappings: Object.keys(completedPiiMappings).length > 0 ? completedPiiMappings : undefined,
            fileProcessingStatus: fileStatuses || undefined
          } as any]
        }
      })

      const controller = new AbortController()
      setAbortController(controller)

      // Helper: reverse current detectable PIIs for immediate streaming de-anonymization
      const currentStreamMappings: Record<string, string> = {}
      Object.entries(globalValToPlaceholder).forEach(([realVal, placeholder]) => {
        currentStreamMappings[placeholder] = realVal
      })
      if (completedPiiMappings) {
        Object.entries(completedPiiMappings).forEach(([realVal, placeholder]) => {
          currentStreamMappings[placeholder as string] = realVal
        })
      }

      // Merge Document PIIs with Text PIIs to send to backend
      const finalPiis = [...detectedPiis]
      if (completedPiiMappings && Object.keys(completedPiiMappings).length > 0) {
        Object.entries(completedPiiMappings).forEach(([original, placeholder], idx) => {
          const placeholderStr = placeholder as string;
          const cleanPlaceholder = placeholderStr.replace(/^\[|\]$/g, '');
          const match = cleanPlaceholder.match(/^(.*)_([a-zA-Z0-9]+)$/);
          const type = match ? match[1] : "UNKNOWN";
          const exists = finalPiis.some(p => p.value === original && p.type.toLowerCase() === type.toLowerCase());
          if (!exists) {
            finalPiis.push({
              id: `doc-pii-${Date.now()}-${idx}`,
              value: original,
              type: type,
              placeholder: placeholderStr,
              locked: false,
            })
          }
        })
      }

      const token = localStorage.getItem('token')

      const baseUrl = api.defaults.baseURL
      const fetchResponse = await fetch(`${baseUrl}/chatbot/sessions/${sessionId}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: "user",
          content: processedInput,
          piis: finalPiis,
          raw_content: currentInput,
          files: processedFilesForAi // Pass encoded files
        }),
        signal: controller.signal
      })

      if (!fetchResponse.ok) throw new Error('Streaming failed')

      const reader = fetchResponse.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let accumulatedContent = ""
      let partialLine = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = (partialLine + chunk).split('\n')
        partialLine = lines.pop() || ""

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6)
            if (dataStr === '[DONE]') continue
            try {
              const data = JSON.parse(dataStr)
              if (data.error) {
                toast.error(data.error)
              } else if (data.content) {
                setIsLoading(false)
                accumulatedContent += data.content
                currentContentRef.current = accumulatedContent
                const displayContent = getDeAnonymizedContent(accumulatedContent, messages, currentStreamMappings)
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: displayContent, isLoading: false, fileProcessingStatus: m.fileProcessingStatus } : m))
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e)
            }
          }
        }
      }

      fetchMessages(sessionId!).then(() => {
        // After fetching, ensure the current assistant message still has its file status
        if (fileStatuses && fileStatuses.length > 0) {
          setMessages(prev => {
            const lastAssistantIdx = [...prev].reverse().findIndex(m => m.role === 'assistant');
            if (lastAssistantIdx !== -1) {
              const actualIdx = prev.length - 1 - lastAssistantIdx;
              return prev.map((m, i) => i === actualIdx ? { ...m, fileProcessingStatus: fileStatuses } : m);
            }
            return prev;
          });
        }
      })
      fetchSessions(sessionSearch)
      setIsStreaming(false)
      setIsLoading(false)

      const [consumptionRes] = await Promise.all([api.get('/auth/me/consumption')])
      setUserConsumption(consumptionRes.data)

      if (detectedPiis.length > 0) {
        toast.info(lang === 'fr' ? "PII Détectées" : "PII Detected", {
          description: lang === 'fr' ? "Données sensibles identifiées dans votre message" : "Sensitive data identified in your message",
          icon: <Shield className="h-4 w-4 text-emerald-500" />,
        })
        setHistoryOpen(false)
        setPiiOpen(true)
      }

      setAbortController(null)
      currentContentRef.current = ""

    } catch (err: any) {
      // Check for abort error
      if (err.name === 'AbortError') {
        console.log("Fetch aborted")
        setAbortController(null)
        setIsStreaming(false)
        setIsLoading(false)
        return
      }

      console.error("Chat streaming failed", err)
      toast.error(lang === 'fr' ? "Erreur lors du chat" : "Chat error: " + err.message)

      setMessages(prev => {
        const lastUserIdx = [...prev].reverse().findIndex(m => m.role === "user")
        if (lastUserIdx !== -1) {
          const actualIdx = prev.length - 1 - lastUserIdx
          return prev.map((m, i) => i === actualIdx ? { ...m, error: true } : m)
        }
        return prev
      })
      setMessages(prev => prev.filter(m => !(String(m.id).startsWith("assistant-") && (m as any).isLoading)))

      setIsStreaming(false)
      setIsLoading(false)
      setAbortController(null)
    }
  }


  const getDeAnonymizedContent = (content: string, allMessages: Message[], extraMappings?: Record<string, string>) => {
    if (!content) return content

    const reverseMap: Record<string, string> = {}

    // 1. Current "on-the-fly" mappings (from stream or current message)
    if (extraMappings) {
      Object.entries(extraMappings).forEach(([placeholder, realVal]) => {
        reverseMap[placeholder] = realVal
      })
    }

    // Aggregate ALL PIIs from ALL sources (text detections and file mappings)
    allMessages.forEach(m => {
      if (m.piis && m.piis.length > 0) {
        m.piis.forEach(p => {
          if (p.placeholder && p.value) {
            reverseMap[p.placeholder] = p.value
          }
        })
      }
      if (m.filePiiMappings) {
        Object.entries(m.filePiiMappings).forEach(([realVal, placeholder]) => {
          reverseMap[placeholder as string] = realVal
        })
      }
    })

    let result = content
    let previousResult = ""
    let pass = 0
    // Multi-pass de-anonymization (handles nested tokens like [city_[numerical_4]])
    while (result !== previousResult && pass < 3) {
      previousResult = result
      pass++
      const sortedEntries = Object.entries(reverseMap).sort((a, b) => b[0].length - a[0].length)
      if (sortedEntries.length === 0) break

      sortedEntries.forEach(([placeholder, realVal]) => {
        // Strip any existing brackets from the real value (e.g. from OCR or detection)
        const cleanRealVal = realVal.replace(/^\[+|\]+$/g, '')
        const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        // Handle optional wrapping brackets from LLM (e.g. [[city_1]] -> ALSDORF)
        // \[? matches the potential leading bracket, escaped matches the token, \]? matches the potential trailing bracket
        result = result.replace(new RegExp('\\[?' + escaped + '\\]?', 'gi'), cleanRealVal)
      })
    }
    return result
  }

  const handleDeletePii = async (piiValue: string) => {
    // 1. Update frontend state immediately for responsiveness
    setMessages(prev => prev.map(msg => ({
      ...msg,
      piis: msg.piis.filter(p => p.value !== piiValue)
    })))

    // 2. Persist in backend if session is active
    if (activeSessionId) {
      try {
        await api.delete(`/chatbot/sessions/${activeSessionId}/piis`, {
          params: { pii_value: piiValue }
        })
      } catch (err) {
        console.error("Failed to delete PII in backend", err)
      }
    }

    toast.success(lang === 'fr' ? "Anonymisation supprimée" : "Anonymization deleted")
  }

  const handleSelection = (msgId: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().trim() === "") {
      setActiveSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const container = range.startContainer;
    const fullText = container.textContent || "";

    let start = range.startOffset;
    let end = range.endOffset;

    // Expansion logic: expand to the nearest whitespace boundaries
    while (start > 0 && !/\s/.test(fullText[start - 1])) start--;
    while (end < fullText.length && !/\s/.test(fullText[end])) end++;

    const expandedText = fullText.substring(start, end).trim();
    if (!expandedText || expandedText === "") return;

    // UPDATE THE SELECTION IN BROWSER
    try {
      const newRange = document.createRange();
      newRange.setStart(container, start);
      newRange.setEnd(container, end);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch (e) { }

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setActiveSelection({
      text: expandedText,
      rect: rect,
      msgId: msgId
    });
  };

  const handleManualAnonymize = (msgId: string, customText?: string) => {
    const textToAnonymize = customText || activeSelection?.text;
    if (!textToAnonymize) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        // Check if the exact text or any overlapping part is already in msg.piis
        const isAlreadyIn = msg.piis.some(pii => pii.value === textToAnonymize);
        if (isAlreadyIn) {
          toast.info(lang === 'fr' ? "Cette partie est déjà anonymisée" : "This part is already anonymized");
          return msg;
        }

        const isNumeric = /^[0-9., ]+$/.test(textToAnonymize);
        let currentIdVal = allPiis.length + 1;
        let idHex = currentIdVal.toString(16);
        let type = isNumeric ? "user_numerical_pii_" + idHex : "user_string_pii_" + idHex;

        // Collision handling: ensure the generated type doesn't already exist
        while (allPiis.some(p => p.type === type)) {
          currentIdVal++;
          idHex = currentIdVal.toString(16);
          type = isNumeric ? "user_numerical_pii_" + idHex : "user_string_pii_" + idHex;
        }

        const newPii: PII = {
          id: type,
          value: textToAnonymize,
          type: type,
          locked: false
        };

        // IF THIS IS AN ACTIVE SESSION, PERSIST THE NEW PII
        if (activeSessionId) {
          api.post(`/chatbot/sessions/${activeSessionId}/piis`, newPii).catch(e => {
            console.error("Failed to persist manual PII", e)
          })
        }

        toast.success(lang === 'fr' ? "Texte anonymisé localement" : "Text anonymized locally");
        return { ...msg, piis: [...msg.piis, newPii] };
      }
      return msg;
    }));

    setActiveSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const renderMessage = (msg: Message, displayMessageContent: boolean = true) => {
    // File Processing Display
    if (msg.fileProcessingStatus && msg.fileProcessingStatus.length > 0 && !displayMessageContent) {
      const allFinished = msg.fileProcessingStatus.every(f => f.status === 'finished')
      const hasError = msg.fileProcessingStatus.some(f => f.status === 'error')
      const isProcessing = !allFinished && !hasError

      return (
        <div className="flex flex-col gap-3 w-full min-w-[280px] p-1">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger><div className="flex items-center gap-2.5 font-bold text-sm">
                {allFinished ? (
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                ) : hasError ? (
                  <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-rose-500" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    {allFinished ? (lang === 'fr' ? "Fichiers traités" : "Files processed") :
                      hasError ? (lang === 'fr' ? "Erreur de traitement" : "Processing Error") :
                        (lang === 'fr' ? "Anonymisation des documents en cours..." : "Anonymizing files...")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {msg.fileProcessingStatus.filter(f => f.status === 'finished').length}/{msg.fileProcessingStatus.length} {lang === 'fr' ? "terminés" : "done"}
                  </span>
                </div>
              </div></AccordionTrigger>
              <AccordionContent className="gap-2">

                {msg.fileProcessingStatus.map(file => (
                  <div className="flex flex-col gap-2 mt-1 bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5">
                    <div key={file.id} className="flex items-center justify-between text-xs group">
                      <div className="flex items-center gap-2 overflow-hidden text-muted-foreground group-hover:text-foreground transition-colors">
                        <FileIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[160px] font-medium">{file.filename}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {['pending', 'loader', 'anonymisation'].includes(file.status) && (
                          <span className="text-primary flex items-center gap-1.5 text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            {file.status === 'loader' ? 'OCR' : file.status === 'pending' ? 'Pending' : 'Anonymizing'}
                          </span>
                        )}
                        {file.status === 'finished' && (
                          <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <Check className="h-2.5 w-2.5" />
                            Done
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-rose-500 flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
                            <XCircle className="h-2.5 w-2.5" />
                            Error
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )
    }




    let displayContent = msg.role === "user" ? ((msg as any).raw_content || msg.content) : msg.content

    // De-anonymize assistant content using the centralized helper
    if (msg.role === "assistant") {
      displayContent = getDeAnonymizedContent(displayContent, messages)
    }

    if (msg.role === "assistant") return (
      <div className="break-words text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            a: ({ node, ...props }) => <a className="text-primary hover:underline underline-offset-4" target="_blank" rel="noreferrer" {...props} />,
            code: ({ node, inline, className, children, ...props }: any) => {
              return inline ? (
                <code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono text-xs border border-border/50" {...props}>{children}</code>
              ) : (
                <div className="relative my-3">
                  <pre className="bg-muted/50 p-4 rounded-xl overflow-x-auto border border-border/50 shadow-sm"><code className="font-mono text-xs" {...props}>{children}</code></pre>
                </div>
              )
            },
            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/20 pl-4 py-1 my-2 italic text-muted-foreground" {...props} />,
            hr: ({ node, ...props }) => <hr className="my-4 border-border/50" {...props} />,
            table: ({ node, ...props }) => <div className="my-4 w-full overflow-y-auto"><table className="w-full text-sm border-collapse" {...props} /></div>,
            th: ({ node, ...props }) => <th className="border border-border/50 px-3 py-2 bg-muted/30 font-semibold text-left" {...props} />,
            td: ({ node, ...props }) => <td className="border border-border/50 px-3 py-2" {...props} />,
          }}
        >
          {displayContent}
        </ReactMarkdown>
      </div>
    )


    // Find all PIIs that appear in this message from the session-wide pool
    const activePiisInMsg = allPiis.filter(pii =>
      displayContent.toLowerCase().includes(pii.value.toLowerCase())
    ).sort((a, b) => b.value.length - a.value.length)

    // Pour l'utilisateur, si on n'a pas de PII détectée dans CE contenu, on affiche juste le texte
    if (activePiisInMsg.length === 0) return (
      <div
        className="whitespace-pre-wrap break-words"
        onMouseUp={() => handleSelection(msg.id)}
      >
        {displayContent}
      </div>
    )

    // Approche par labels temporaires pour éviter les collisions
    let renderedContent = displayContent
    const placeholderMap: Record<string, PII> = {}

    activePiisInMsg.forEach((pii, idx) => {
      const placeholder = `__MESSAGE_PII_${idx}__`
      placeholderMap[placeholder] = pii
      const regex = new RegExp(pii.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      renderedContent = renderedContent.replace(regex, placeholder)
    })

    const segments = renderedContent.split(/(__MESSAGE_PII_\d+__)/g)

    return (
      <div
        className="whitespace-pre-wrap break-words"
        onMouseUp={() => handleSelection(msg.id)}
      >
        {segments.map((seg: string, i: number) => {
          if (placeholderMap[seg]) {
            const pii = placeholderMap[seg]
            return (
              <span
                key={i}
                className={cn(
                  "transition-all duration-300",
                  msg.showPiiValues ? "text-primary font-bold" : (pii.locked ? "" : "blur-[4px] hover:blur-none cursor-help")
                )}
              >
                {pii.value}
              </span>
            )
          }
          return <span key={i}>{seg}</span>
        })}
      </div>
    )
  }

  const togglePiiVisibility = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showPiiValues: !m.showPiiValues } : m))
  }

  const togglePiiLock = async (value: string) => {
    // On met à jour toutes les occurrences de cette valeur dans les messages
    // pour que l'interface reste cohérente (historique des verrous)
    setMessages(prev => prev.map(msg => ({
      ...msg,
      piis: msg.piis.map(p => p.value === value ? { ...p, locked: !p.locked } : p)
    })))

    // Mettre aussi à jour les entités détectées dans la page de détection
    setDetectedEntities(prev => prev.map(ent =>
      ent.value === value ? { ...ent, locked: !ent.locked } : ent
    ))

    // Sauvegarder le changement en base de données si on est dans une session
    if (activeSessionId) {
      try {
        await api.patch(`/chatbot/sessions/${activeSessionId}/piis`, null, {
          params: { pii_value: value }
        })
      } catch (err) {
        console.error("Failed to sync PII lock status with backend", err)
        toast.error(lang === 'fr' ? "Erreur de synchronisation" : "Sync error")
      }
    }
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <Shield className="w-16 h-16 text-muted-foreground/20" />
            <X className="w-8 h-8 text-destructive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">404 - Accès Non Autorisé</h1>
            <p className="text-muted-foreground max-w-[250px]">
              Nous n'avons pas pu charger votre profil. Veuillez vous reconnecter.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/login'}>
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className={cn("flex h-screen w-full overflow-hidden bg-background text-foreground", isDark && "dark")}>
        <AppSidebar
          t={t}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
        />
        {/* --- Main Content Area --- */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background lg:m-2 lg:rounded-2xl lg:border lg:shadow-sm overflow-hidden relative ">

          {/* Navbar */}
          <header className="h-16 border-b bg-background backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1 lg:hidden" />

              <div className="relative hidden md:block group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={t.navbar.search}
                  className="w-64 h-9 pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all focus:w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-xl border border-border/50 bg-muted/30">
                    <span className="text-xs font-bold">{lang.toUpperCase()}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 mt-2 rounded-xl bg-background backdrop-blur-md border-border shadow-xl animate-reveal">
                  <DropdownMenuItem className="gap-3 px-4 py-2 focus:bg-muted cursor-pointer transition-colors rounded-lg mx-1" onClick={() => setLang('fr')}>
                    <span className={cn("text-xs font-bold", lang === 'fr' ? "text-primary" : "text-muted-foreground")}>Français</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3 px-4 py-2 focus:bg-muted cursor-pointer transition-colors rounded-lg mx-1" onClick={() => setLang('en')}>
                    <span className={cn("text-xs font-bold", lang === 'en' ? "text-primary" : "text-muted-foreground")}>English</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Help className="h-5 w-5" />
              </Button>

              <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <Avatar className="h-9 w-9 hover:ring-2 ring-primary/20 transition-all border border-border/50 shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">{getInitials(user?.full_name)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black dark:bg-white border-2 border-background rounded-full" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl bg-background backdrop-blur-md border-border shadow-xl animate-reveal">
                  <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground px-4 py-3">{t.navbar.monCompte}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-3 px-4 py-3 focus:bg-muted cursor-pointer transition-colors rounded-lg mx-1" onClick={() => { setActiveTab("profile"); }}>
                    <User className="h-4 w-4" />
                    <span className="font-medium">{t.navbar.profil}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="w-full">
                    <DropdownMenuItem className="gap-3 px-4 py-3 focus:bg-rose-500/10 focus:text-rose-500 text-rose-500 cursor-pointer transition-colors rounded-lg mx-1" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">{t.navbar.logout}</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* VIEW: PROFILE */}
          {activeTab === "profile" && (
            <ScrollArea className="flex-1 p-4 lg:p-8">
              <div className="w-full space-y-8 animate-reveal">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.profile.title}</h1>
                  <p className="text-muted-foreground text-sm font-medium">{t.profile.subtitle}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Personal Information */}
                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {t.profile.personalInfo}
                      </CardTitle>
                      {!isEditingProfile ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2 text-xs font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                          onClick={() => {
                            setEditedUser({ full_name: user?.full_name || "", company: user?.company || "" })
                            setIsEditingProfile(true)
                          }}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          {t.profile.edit}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-bold rounded-lg hover:bg-muted"
                            onClick={() => setIsEditingProfile(false)}
                            disabled={isUpdatingProfile}
                          >
                            {t.profile.cancel}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs font-bold rounded-lg bg-primary text-primary-foreground"
                            onClick={handleUpdateProfile}
                            disabled={isUpdatingProfile}
                          >
                            {isUpdatingProfile ? (
                              <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5 mr-1" />
                            )}
                            {t.profile.save}
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-black uppercase">
                            {getInitials(user?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{user?.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.profile.fullName}</label>
                          {isEditingProfile ? (
                            <Input
                              value={editedUser.full_name}
                              onChange={(e) => setEditedUser(prev => ({ ...prev, full_name: e.target.value }))}
                              className="h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/20 transition-all font-medium text-sm"
                              placeholder={t.profile.fullName}
                            />
                          ) : (
                            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 font-medium text-sm">
                              {user?.full_name}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.profile.email}</label>
                          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 font-medium text-sm text-muted-foreground flex items-center justify-between group">
                            {user?.email}
                            <Lock className="h-3 w-3 opacity-20 group-hover:opacity-50 transition-opacity" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.profile.company}</label>
                          {isEditingProfile ? (
                            <Input
                              value={editedUser.company}
                              onChange={(e) => setEditedUser(prev => ({ ...prev, company: e.target.value }))}
                              className="h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/20 transition-all font-medium text-sm"
                              placeholder={t.profile.company}
                            />
                          ) : (
                            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 font-medium text-sm">
                              {user?.company || "—"}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    {/* Plan Information */}
                    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Rocket className="h-5 w-5 text-primary" />
                          {t.profile.planInfo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                          <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{t.profile.currentPlan}</p>
                            <h3 className="text-2xl font-black tracking-tight">{user?.user_plan?.name?.toUpperCase() || "FREE"}</h3>
                          </div>
                          <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-lg">
                            {t.profile.active}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">{isTokenBased ? (lang === 'fr' ? 'Consommation' : 'Consumption') : t.apiKeys.stats.monthlyLimit}</span>
                            <span className="font-bold">{usageValue?.toLocaleString()} <span className="text-muted-foreground">/ {usageLimit?.toLocaleString() || "50"}</span> {usageLabel.toLowerCase()}</span>
                          </div>
                          <Progress
                            value={usagePercent}
                            className="h-2 bg-muted/50 overflow-hidden"
                            indicatorClassName="bg-primary"
                          />
                        </div>

                        <Button
                          onClick={() => setIsUpgradeModalOpen(true)}
                          className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-11 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Zap className="w-4 h-4 mr-2 fill-current" />
                          {t.profile.upgradePlan}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Lock className="h-5 w-5 text-primary" />
                          {t.profile.security}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isChangingPassword ? (
                          <Button
                            variant="outline"
                            onClick={() => setIsChangingPassword(true)}
                            className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-primary/5 hover:text-primary transition-all border-border/50"
                          >
                            <Unlock className="h-4 w-4" />
                            {t.profile.changePassword}
                          </Button>
                        ) : (
                          <div className="space-y-4 animate-reveal">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t.profile.oldPassword}</label>
                              <div className="relative">
                                <Input
                                  type={showOldPassword ? "text" : "password"}
                                  value={passwordData.old_password}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                                  className="rounded-xl pr-10"
                                  placeholder="••••••••"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                  onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t.profile.newPassword}</label>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  value={passwordData.new_password}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                  className="rounded-xl pr-10"
                                  placeholder="••••••••"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t.profile.confirmPassword}</label>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={passwordData.confirm_password}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                  className="rounded-xl pr-10"
                                  placeholder="••••••••"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                onClick={handleUpdatePassword}
                                disabled={isUpdatingPassword}
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-xl h-10 font-bold"
                              >
                                {isUpdatingPassword ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{t.profile.save}...</span>
                                  </div>
                                ) : t.profile.save}
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setIsChangingPassword(false)
                                  setPasswordData({ old_password: "", new_password: "", confirm_password: "" })
                                }}
                                disabled={isUpdatingPassword}
                                className="rounded-xl h-10 font-bold"
                              >
                                {t.profile.cancel}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* VIEW: API KEYS */}
          {activeTab === "api-keys" && (
            <ScrollArea className="flex-1 p-4">
              <div className="w-full space-y-8 p-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-reveal">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.apiKeys.title}</h1>
                    <p className="text-muted-foreground text-sm font-medium">{t.apiKeys.subtitle}</p>
                  </div>
                  <Button className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 gap-2 min rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 px-8!" onClick={() => setIsNewKeyModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    {t.apiKeys.newKey}
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 animate-reveal" style={{ animationDelay: '100ms' }}>
                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.activeKeys}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length} / 10</div>
                      <p className="text-[10px] text-muted-foreground mt-1">{t.apiKeys.stats.accordingToPlan}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.totalRequests}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{detectionStats.currentMonthRequests.toLocaleString()}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">{t.apiKeys.stats.thisMonth}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{isTokenBased ? (lang === 'fr' ? 'Limite (Tokens)' : 'Limit (Tokens)') : t.apiKeys.stats.monthlyLimit}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{usageLimit?.toLocaleString() || "50"}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">{isTokenBased ? (lang === 'fr' ? 'Restants' : 'Remaining') : t.apiKeys.stats.remaining}: {((usageLimit || 50) - (usageValue || 0)).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '200ms' }}>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{t.apiKeys.table.title}</CardTitle>
                    {/* <CardDescription>{t.apiKeys.table.description}</CardDescription> */}
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      {apiKeys.length == 0 ?
                        <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 gap-2 min rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 px-8!" onClick={() => setIsNewKeyModalOpen(true)}>
                          <Plus className="w-4 h-4" />
                          {t.apiKeys.newKey}
                        </Button>
                        :
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left border-b border-border/50 pb-4">
                              <th className="font-bold py-3 px-2">{t.apiKeys.table.name}</th>
                              {!isMobile && <th className="font-bold py-3 px-2">{t.apiKeys.table.key}</th>}
                              {!isMobile && <th className="font-bold py-3 px-2">{t.apiKeys.table.created}</th>}
                              {!isMobile && <th className="font-bold py-3 px-2">{t.apiKeys.table.lastUsed}</th>}
                              <th className="font-bold py-3 px-2 text-center">{t.apiKeys.table.status}</th>
                              {!isMobile && <th className="font-bold py-3 px-2 text-right">{t.apiKeys.table.requests}</th>}
                              <th className="font-bold py-3 px-2 text-right">{t.apiKeys.table.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {apiKeys.map((key, i) => (
                              <tr key={key.id} className="group hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-2 font-bold">{key.name} <Badge variant="outline" className="ml-2 text-[8px] uppercase">{key.type}</Badge></td>
                                {!isMobile && <td
                                  className="py-4 px-2 font-mono text-[10px] text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => {
                                    navigator.clipboard.writeText(key.key)
                                    toast.success(lang === 'fr' ? "Clé copiée !" : "Key copied!")
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {key.key.replace(/(.{8}).+/, '$1...')}
                                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </td>}
                                {!isMobile && <td className="py-4 px-2 text-xs">{new Date(key.created_at).toLocaleDateString()}</td>}
                                {!isMobile && <td className="py-4 px-2 text-xs">{lang === 'fr' ? "Récemment" : "Recently"}</td>}
                                <td className="py-4 px-2 text-center">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-bold px-2.5 py-0.5 rounded-full transition-all",
                                      key.is_active
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                                        : "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]"
                                    )}
                                  >
                                    {key.is_active ? (lang === 'fr' ? "Active" : "Active") : (lang === 'fr' ? "Inactive" : "Inactive")}
                                  </Badge>
                                </td>
                                {!isMobile && <td className="py-4 px-2 text-right font-bold text-xs">{key.request_count}</td>}
                                <td className="py-4 px-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-background" onClick={() => handleCopyApiKey(key.key)}>
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                                      onClick={() => handleDeleteApiKey(key.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>}
                    </div>
                  </CardContent>
                </Card>

                {/* Modal for new API Key */}
                <Dialog
                  open={isNewKeyModalOpen}
                  onOpenChange={(open) => {
                    setIsNewKeyModalOpen(open);
                    if (!open) setCreatedKey(null);
                  }}
                >
                  <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>{t.apiKeys.modal.title}</DialogTitle>
                      <DialogDescription>
                        {createdKey
                          ? (lang === 'fr'
                            ? "Votre nouvelle clé API a été générée. Veuillez la copier maintenant, vous ne pourrez plus la voir ensuite."
                            : "Your new API key has been generated. Please copy it now, you won't be able to see it again.")
                          : t.apiKeys.subtitle}
                      </DialogDescription>
                    </DialogHeader>

                    {createdKey ? (
                      <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted rounded-xl border border-dashed border-primary/50 flex items-center justify-between gap-3">
                          <code className="text-xs font-mono break-all">{createdKey}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              navigator.clipboard.writeText(createdKey)
                              toast.success(lang === 'fr' ? "Copié !" : "Copied!")
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider text-center">
                          {lang === 'fr'
                            ? "Attention : Cette clé ne sera plus jamais affichée"
                            : "Warning: This key will never be shown again"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold">{t.apiKeys.modal.nameLabel}</label>
                          <Input
                            placeholder={t.apiKeys.modal.namePlaceholder}
                            value={newKeyData.name}
                            onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold">{t.apiKeys.modal.typeLabel}</label>
                          <Select
                            value={newKeyData.type}
                            onValueChange={(val) => setNewKeyData(prev => ({ ...prev, type: val }))}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dev">Development</SelectItem>
                              <SelectItem value="test">Test</SelectItem>
                              <SelectItem value="prod">Production</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold">{t.apiKeys.modal.expirationLabel}</label>
                            <Input
                              type="date"
                              className="rounded-xl"
                              onChange={(e) => setNewKeyData(prev => ({ ...prev, expires_at: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold">{t.apiKeys.modal.limitLabel}</label>
                            <Input
                              type="number"
                              placeholder={t.apiKeys.modal.unlimited}
                              className="rounded-xl"
                              onChange={(e) => setNewKeyData(prev => ({ ...prev, request_limit: parseInt(e.target.value) || null }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <DialogFooter className="gap-2">
                      {createdKey ? (
                        <Button
                          onClick={() => {
                            setIsNewKeyModalOpen(false)
                            setCreatedKey(null)
                          }}
                          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-xl"
                        >
                          {lang === 'fr' ? "Terminer" : "Done"}
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => setIsNewKeyModalOpen(false)} className="rounded-xl">
                            {t.apiKeys.modal.cancel}
                          </Button>
                          <Button
                            onClick={handleCreateApiKey}
                            disabled={isCreatingKey}
                            className="bg-black dark:bg-white text-white dark:text-black rounded-xl"
                          >
                            {isCreatingKey ? t.apiKeys.modal.creating : t.apiKeys.modal.create}
                          </Button>
                        </>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </ScrollArea>
          )}

          {/* VIEW: OVERVIEW */}
          {activeTab === "overview" && (
            <ScrollArea className="flex-1 p-4">
              <div className="w-full space-y-6 p-4 sm:p-8">
                <div className="flex flex-col gap-2 animate-reveal">
                  <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.overview.title}</h1>
                  <p className="text-muted-foreground text-sm font-medium">{t.overview.subtitle}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, i) => {
                    const statTitle = dashboardStats[i]
                    return (
                      <Card key={stat.title} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-card/50 backdrop-blur-sm relative overflow-hidden ring-1 ring-border/50 animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", stat.bg.replace('/10', ''))} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{statTitle}</CardTitle>
                          <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md", stat.bg)}>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-black tracking-tighter mb-1 transition-all group-hover:scale-[1.02] origin-left">
                            {stat.value}
                          </div>
                          <div className="flex items-center my-2 justify-between">
                            {/* <div className="flex items-center gap-1.5 mt-2">
                              <div className={cn("flex  gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-transform hover:scale-110",
                                stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              )}>
                                {stat.trend === "up" ? <TrendingUp className="h-2.5 w-2.5" /> : <Activity className="h-2.5 w-2.5" />}
                                {stat.change} {stat.title === t.overview.stats.plan ? "" : (lang === 'fr' ? "ce mois" : "this month")}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">{lang === 'fr' ? "ce mois-ci" : "this month"}</span>
                            </div> */}
                            {stat.title === t.overview.stats.plan && <Button className="rounded-xl w-full" onClick={() => setIsUpgradeModalOpen(true)}>Changer de plan</Button>}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '400ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold">{t.overview.apiUsage.title}</CardTitle>
                        <CardDescription>{t.overview.apiUsage.subtitle}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-foreground" />
                            <span className="font-semibold">{usageLabel}</span>
                          </div>
                          <span className="font-bold">
                            {usageValue?.toLocaleString()}{" "}
                            <span className="text-muted-foreground font-medium">/ {usageLimit?.toLocaleString() || "∞"}</span>
                          </span>
                        </div>
                        <Progress
                          value={usagePercent}
                          className="h-2 bg-muted/50 overflow-hidden"
                          indicatorClassName="bg-black dark:bg-white"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-foreground" />
                            <span className="font-semibold">{t.overview.apiUsage.activeKeys}</span>
                          </div>
                          <span className="font-bold">{apiKeys.filter(k => k.is_active).length} <span className="text-muted-foreground font-medium">/ 10</span></span>
                        </div>
                        <Progress value={apiKeys.filter(k => k.is_active).length * 10} className="h-2 bg-muted/50 overflow-hidden" indicatorClassName="bg-black dark:bg-white" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '500ms' }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-primary">{t.overview.quickActions.title}</CardTitle>
                      <CardDescription>{t.overview.quickActions.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.05] active:scale-[0.95] border-dashed shadow-sm group"
                          onClick={() => setActiveTab("overview")}
                        >
                          <LayoutDashboard className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-bold">{t.sidebar.overview}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.05] active:scale-[0.95] border-dashed shadow-sm group"
                          onClick={() => setActiveTab("api-keys")}
                        >
                          <Key className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-bold">{t.overview.quickActions.manageApiKeys}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.05] active:scale-[0.95] border-dashed shadow-sm group"
                          onClick={() => setActiveTab("entity-detection")}
                        >
                          <Tags className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-bold">{t.overview.quickActions.detectEntities}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.05] active:scale-[0.95] border-dashed shadow-sm group"
                          onClick={() => setActiveTab("chatbot")}
                        >
                          <MessageSquare className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-bold">{t.overview.quickActions.openChatbot}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.05] active:scale-[0.95] border-dashed shadow-sm group"
                          onClick={() => setActiveTab("api-docs")}
                        >
                          <FileText className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-bold">{t.sidebar.documentation}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2 items-center text-center transition-all border-dashed shadow-sm col-span-1 group relative cursor-not-allowed opacity-60 hover:bg-transparent"
                          disabled
                        >
                          <div className="p-2 rounded-full bg-muted/50 transition-all group-hover:bg-amber-500/10">
                            <Box className="h-4 w-4 text-muted-foreground/50 group-hover:text-amber-600 transition-colors" />
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground">{t.overview.quickActions.deployDocker}</span>
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="text-[7px] px-1.5 h-3.5 bg-muted/30 text-muted-foreground/40 border-border/30 font-black uppercase tracking-tighter transition-all group-hover:bg-amber-500/10 group-hover:text-amber-600 group-hover:border-amber-500/20">{t.sidebar.comingSoon}</Badge>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '600ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg font-bold">{t.overview.recentActivity.title}</CardTitle>
                        <CardDescription>{t.overview.recentActivity.subtitle}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-primary font-bold">{t.overview.recentActivity.viewAll}</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => {
                          const activityMsg = lang === 'fr' ? activity.message : (
                            activity.message === "Nouvelle cle API creee" ? "New API key created" :
                              activity.message === "Requête d'extraction effectuée" ? "Extraction request performed" :
                                activity.message.includes("entites anonymisees") ? `${detectionStats.total.toLocaleString()} entities anonymized` :
                                  activity.message === "Session chatbot terminee" ? "Chatbot session ended" :
                                    activity.message === "Limite API augmentee" ? "API limit increased" : activity.message
                          )
                          const activityTime = lang === 'fr' ? activity.time : (
                            activity.time === "Il y a 2 min" ? "2 min ago" :
                              activity.time === "À l'instant" ? "Just now" :
                                activity.time === "Il y a 15 min" ? "15 min ago" :
                                  activity.time === "Il y a 1 heure" ? "1 hour ago" :
                                    activity.time === "Il y a 3 heures" ? "3 hours ago" : activity.time
                          )
                          return (
                            <div key={index} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-border/50" onClick={() => activity.type === "api" ? setActiveTab("api-keys") : activity.type === "chatbot" ? setActiveTab("chatbot") : null}>
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50 shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                {activity.type === "api" && <Key className="h-5 w-5" />}
                                {activity.type === "detection" && <Tags className="h-5 w-5" />}
                                {activity.type === "chatbot" && <MessageSquare className="h-5 w-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activityMsg}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                    <Activity className="h-2.5 w-2.5" /> {activityTime}
                                  </span>
                                </div>
                              </div>
                              <div className="h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-foreground/10 transition-all duration-300">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '600ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          {lang === 'fr' ? "Activité du compte" : "Account Activity"}
                        </CardTitle>
                        <CardDescription>{lang === 'fr' ? "Volume de requêtes des 7 derniers jours" : "Request volume for the last 7 days"}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px] w-full mt-4">
                        {detectionStats.daily_usage && detectionStats.daily_usage.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={detectionStats.daily_usage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
                                }}
                                dy={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const date = new Date(label);
                                    return (
                                      <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                          {date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' })}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-primary" />
                                          <span className="text-sm font-black">{payload[0].value} {lang === 'fr' ? 'requêtes' : 'requests'}</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#areaGradient)"
                                animationDuration={1500}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-4 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5 transition-all hover:bg-muted/10">
                            <div className="p-4 rounded-full bg-background shadow-sm ring-1 ring-border/50">
                              <BarChart3 className="h-8 w-8 text-muted-foreground/30 animate-pulse" />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-sm font-bold text-foreground">{lang === 'fr' ? "En attente de données" : "Waiting for data"}</p>
                              <p className="text-[11px] font-medium max-w-[200px]">{lang === 'fr' ? "Commencez à utiliser l'API pour voir votre activité s'afficher ici." : "Start using the API to see your activity displayed here."}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Modal for Plan Upgrade */}
          <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
            <DialogContent className="w-[95vw] max-w-[800px] sm:max-w-[600px] rounded-[1.5rem] sm:rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-linear-to-br from-card to-background">
                <DialogHeader className="space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-current" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                      {t.profile.upgradePlan}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base font-medium">
                      {t.profile.choosePlan}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Pro Plan */}
                  <Card className={cn(
                    "relative overflow-hidden border-2 transition-all cursor-not-allowed group",
                    user?.user_plan?.name === 'pro' ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                  )}
                  >
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2 bg-primary/10 text-primary border-none font-bold">PRO</Badge>
                          <CardTitle className="text-xl sm:text-2xl font-black">29€<span className="text-xs sm:text-sm font-medium text-muted-foreground">/mois</span></CardTitle>
                        </div>
                        {user?.user_plan?.name === 'pro' && (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                          10,000 requêtes / mois
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                          Support prioritaire
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                          Tous les modèles LLM
                        </li>
                      </ul>
                      <Button
                        className="w-full rounded-xl font-bold mt-2 sm:mt-4 p-2 sm:h-11 text-xs sm:text-sm"
                        variant={user?.user_plan?.name === 'pro' ? "secondary" : "default"}
                      // disabled={true}
                      >
                        {isUpgradingPlan ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : (user?.user_plan?.name === 'pro' ? t.profile.active : t.profile.choosePlan)}
                        {user?.user_plan?.name !== 'pro' && <ArrowRight size={32} color="#fffffe" strokeWidth={3} />}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Enterprise Plan */}
                  <Card className="relative overflow-hidden border-2 border-border/50 transition-all cursor-not-allowed group">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="mb-2 font-bold uppercase tracking-[0.1em] text-[10px] sm:text-xs">Enterprise</Badge>
                          <CardTitle className="text-xl sm:text-2xl font-black">Sur mesure</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                          Requêtes illimitées
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                          Déploiement On-Premise
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                          SLA Garanti
                        </li>
                      </ul>
                      <Button variant="outline" disabled className="w-full rounded-xl font-bold mt-2 sm:mt-4 h-9 sm:h-11 text-xs sm:text-sm border-border/50">
                        {t.profile.enterpriseContact}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-2 sm:pt-4">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm" onClick={() => setIsUpgradeModalOpen(false)}>
                    {t.profile.cancel}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* VIEW: API DOCUMENTATION */}
          {activeTab === "api-docs" && (
            <ScrollArea className="flex-1 p-4">
              <div className="w-full space-y-6 p-8">
                {/* Header */}
                <div className="flex flex-col gap-2 animate-reveal">
                  <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t.apiDocs.title}
                  </h1>
                  {/* <p className="text-muted-foreground text-sm font-medium">
                    {t.apiDocs.subtitle}
                  </p> */}
                  <p className="text-muted-foreground text-sm font-medium">
                    {t.apiDocs.introParagraph}
                  </p>
                </div>
              </div>
              <div className="w-full p-8 space-y-12 pb-20 animate-reveal">

                {/* Header */}
                {/* <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-slate-950 via-slate-900 to-black dark:from-white dark:via-slate-50 dark:to-slate-100 p-8 lg:p-12 text-white dark:text-black shadow-2xl ring-1 ring-white/10 dark:ring-black/5">
                  <div className="relative z-10 space-y-6 max-w-3xl">
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary dark:border-primary/20 dark:text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">Documentation API</Badge>
                    <div className="space-y-4">
                      <h1 className="text-3xl lg:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 dark:from-black dark:to-black/60">
                        {t.apiDocs.title}
                      </h1>
                      <p className="text-lg lg:text-xl text-white/80 dark:text-black/80 font-medium leading-tight">
                        {t.apiDocs.subtitle}
                      </p>
                    </div>
                    <p className="text-white/60 dark:text-black/60 text-sm lg:text-base leading-relaxed font-medium">
                      {t.apiDocs.introParagraph}
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
                  <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px]" />
                </div> */}

                {/* Developer Journey / Steps */}
                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Terminal className="w-6 h-6 text-primary" />
                      {t.apiDocs.developerSteps.title}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                      {lang === 'fr' ? 'Suivez ces étapes pour intégrer Data Private en quelques minutes.' : 'Follow these steps to integrate Data Private in minutes.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Connection lines for desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-1/2 z-0" />

                    {[
                      {
                        step: "01",
                        data: t.apiDocs.developerSteps.step1,
                        icon: Key,
                        color: "text-amber-500",
                        bg: "bg-amber-500/10",
                        action: {
                          label: lang === 'fr' ? 'Gérer les clés' : 'Manage keys',
                          onClick: () => setActiveTab("api-keys")
                        }
                      },
                      {
                        step: "02",
                        data: t.apiDocs.developerSteps.step2,
                        icon: Lock,
                        color: "text-blue-500",
                        bg: "bg-blue-500/10"
                      },
                      {
                        step: "03",
                        data: t.apiDocs.developerSteps.step3,
                        icon: Rocket,
                        color: "text-emerald-500",
                        bg: "bg-emerald-500/10"
                      }
                    ].map((item, i) => (
                      <Card key={i} className="relative z-10 border border-border/40 shadow-sm bg-card/50 backdrop-blur-xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
                        <CardContent className="p-6 space-y-6">
                          <div className="flex items-start justify-between">
                            <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110", item.bg)}>
                              <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <span className="text-4xl font-black text-muted-foreground/[0.07] group-hover:text-primary/[0.1] transition-colors tabular-nums">{item.step}</span>
                          </div>
                          <div className="space-y-3">
                            <h3 className="font-bold text-lg tracking-tight">{item.data.title}</h3>
                            <p className="text-sm font-bold text-primary/80 leading-relaxed">
                              {item.data.description}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.data.paragraph}
                            </p>
                          </div>
                          {item.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-4 bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 gap-2 font-bold"
                              onClick={item.action.onClick}
                            >
                              {item.action.label}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />
                          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="space-y-12">

                    {/* Authentication Details */}
                    <section className="space-y-4">
                      <div className={cn("flex ", isMobile ? "flex-col justify-start gap-4" : "items-center justify-between flex-row")}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-inner">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight">{t.apiDocs.authentication.title}</h2>
                            <div className="h-0.5 w-8 bg-amber-500/40 rounded-full" />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 gap-2 transition-all rounded-lg", isMobile ? "border border-amber-500/20" : "")}
                          onClick={() => setActiveTab("api-keys")}
                        >
                          <Key className="w-3.5 h-3.5" />
                          {lang === 'fr' ? 'Gérer les clés' : 'Manage keys'}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="grid lg:grid-cols-5 gap-6 ">
                        <div className="lg:col-span-2 space-y-4">
                          <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl h-full hover:border-amber-500/20 transition-all duration-300">
                            <CardContent className="p-6 space-y-6">
                              <div className="space-y-2">
                                <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 text-[10px]">1</span>
                                  {lang === 'fr' ? 'Sélectionner une clé' : 'Select a key'}
                                </h3>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                  {lang === 'fr'
                                    ? "Choisissez une clé API existante pour personnaliser vos exemples de code."
                                    : "Choose an existing API key to customize your code examples."}
                                </p>
                              </div>

                              <Select
                                value={selectedApiKey}
                                onValueChange={(value) => {
                                  if (value === "create_new") {
                                    setActiveTab("api-keys");
                                    setIsNewKeyModalOpen(true);
                                  } else {
                                    setSelectedApiKey(value);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full bg-background/50 border-border/40 h-11 rounded-xl shadow-sm transition-all hover:border-amber-500/30">
                                  <div className="flex items-center gap-2">
                                    <Key className="w-3.5 h-3.5 text-amber-500" />
                                    <SelectValue placeholder={lang === 'fr' ? "Sélectionner une clé API" : "Select an API key"} />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40 shadow-2xl">
                                  {apiKeys.filter(k => k.is_active).length > 0 ? (
                                    apiKeys.filter(k => k.is_active).map((key) => (
                                      <SelectItem key={key.id} value={key.key} className="py-2.5 rounded-lg focus:bg-amber-500/5 focus:text-amber-900 dark:focus:text-amber-100">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-bold text-xs">{key.name}</span>
                                          <span className="text-[10px] text-muted-foreground font-mono">{key.key.replace(/(.{4}).+(.{4})/, '$1...$2')}</span>
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="px-2 py-3 text-center space-y-2">
                                      <p className="text-[10px] text-muted-foreground font-medium italic">{lang === 'fr' ? "Aucune clé active trouvée" : "No active keys found"}</p>
                                    </div>
                                  )}
                                  <div className="p-1 border-t border-border/40 mt-1">
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start gap-2 h-9 text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 rounded-lg"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab("api-keys");
                                        setIsNewKeyModalOpen(true);
                                      }}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      {lang === 'fr' ? 'Créer une nouvelle clé' : 'Create a new key'}
                                    </Button>
                                  </div>
                                </SelectContent>
                              </Select>

                              <div className="pt-2">
                                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 flex gap-3">
                                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-medium">
                                    {lang === 'fr'
                                      ? "Toutes les requêtes doivent être authentifiées via le header X-API-Key."
                                      : "All requests must be authenticated via the X-API-Key header."}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="lg:col-span-3 space-y-4 ">
                          <Card className="border border-border/40 shadow-sm bg-[#0f111a] dark:bg-slate-900 overflow-hidden h-full group">
                            <CardContent className="p-0 flex flex-col h-full bg-[#0f111a]">
                              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                                  </div>
                                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest ml-2">Header HTTP</span>
                                </div>
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Required</Badge>
                              </div>

                              <div className="p-6 flex-1 flex flex-col justify-center font-mono">
                                <div className="relative group/code">
                                  <div className="absolute -inset-4 bg-amber-500/10 rounded-xl blur-xl opacity-0 group-hover/code:opacity-100 transition-opacity duration-500" />
                                  <div className="relative space-y-1">
                                    <span className="text-emerald-400 text-xs">X-API-Key</span>
                                    <span className="text-slate-500 mx-2">:</span>
                                    <span className="text-amber-400 text-sm font-bold break-all drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                                      {selectedApiKey}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 border-t border-white/5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all gap-2 text-[10px] font-bold uppercase tracking-wider"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`X-API-Key: ${selectedApiKey}`)
                                    toast.success(t.apiDocs.examples.copied)
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  {lang === 'fr' ? 'Copier le header' : 'Copy header'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </section>

                    {/* Endpoint Details */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-xl font-bold tracking-tight">{t.apiDocs.endpoints.title}</h2>
                          <div className="h-0.5 w-8 bg-blue-500/40 rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1 font-black text-xs shadow-md shadow-emerald-500/30 uppercase tracking-[0.2em] rounded-full">POST</Badge>
                            <div className="bg-card/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-border/40 shadow-sm flex items-center gap-2 ring-1 ring-white/5">
                              <code className="text-sm font-bold tracking-tight text-primary">/api/v1/public/extract</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 rounded-lg transition-colors" onClick={() => { navigator.clipboard.writeText("/api/v1/public/extract"); toast.success(t.apiDocs.examples.copied) }}>
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                            {t.apiDocs.endpoints.extract.description}
                          </p>

                          {/* Supported Labels Section */}
                          <div className="pt-2 space-y-4">
                            <div className="flex flex-col gap-2">
                              <h3 className="text-sm font-bold flex items-center gap-2">
                                <Tags className="w-4 h-4 text-primary" />
                                {t.apiDocs.supportedLabels.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {t.apiDocs.supportedLabels.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-x-2 gap-y-3">
                              {t.apiDocs.supportedLabels.list.map((label: string) => (
                                <Badge key={label} variant="outline" className="text-xs font-mono bg-primary/5 border-primary/10 hover:border-primary/30 transition-colors px-2.5 py-0.5">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Card className="border border-border/40 shadow-xl bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-white/5">
                            <CardHeader className="border-b border-border/40 bg-muted/20 py-4 px-6">
                              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Box className="w-3.5 h-3.5 text-primary" />
                                {t.apiDocs.parameters.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-border/40 bg-muted/5">
                                    <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.name}</th>
                                    <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.type}</th>
                                    <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.required}</th>
                                    <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.description}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                  <tr className="group hover:bg-primary/[0.02] transition-colors">
                                    <td className="p-4"><code className="px-2 py-1 rounded-md bg-primary/5 text-primary font-bold">text</code></td>
                                    <td className="p-4 text-muted-foreground"><Badge variant="outline" className="font-mono text-[10px] bg-slate-500/5 px-1.5 h-5">string</Badge></td>
                                    <td className="p-4"><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full">{lang === 'fr' ? 'Oui' : 'Yes'}</Badge></td>
                                    <td className="p-4 text-muted-foreground font-medium leading-relaxed">{t.apiDocs.parameters.fields.text}</td>
                                  </tr>
                                  <tr className="group hover:bg-primary/[0.02] transition-colors">
                                    <td className="p-4"><code className="px-2 py-1 rounded-md bg-primary/5 text-primary font-bold">labels</code></td>
                                    <td className="p-4 text-muted-foreground"><Badge variant="outline" className="font-mono text-[10px] bg-slate-500/5 px-1.5 h-5">string[]</Badge></td>
                                    <td className="p-4"><Badge variant="outline" className="text-muted-foreground/40 border-border/40 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full">{lang === 'fr' ? 'Non' : 'No'}</Badge></td>
                                    <td className="p-4 text-muted-foreground font-medium leading-relaxed">{t.apiDocs.parameters.fields.labels}</td>
                                  </tr>
                                  <tr className="group hover:bg-primary/[0.02] transition-colors">
                                    <td className="p-4"><code className="px-2 py-1 rounded-md bg-primary/5 text-primary font-bold">confidence_threshold</code></td>
                                    <td className="p-4 text-muted-foreground"><Badge variant="outline" className="font-mono text-[10px] bg-slate-500/5 px-1.5 h-5">float</Badge></td>
                                    <td className="p-4"><Badge variant="outline" className="text-muted-foreground/40 border-border/40 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full">{lang === 'fr' ? 'Non' : 'No'}</Badge></td>
                                    <td className="p-4 text-muted-foreground font-medium leading-relaxed">{t.apiDocs.parameters.fields.threshold}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </CardContent>
                          </Card>

                          {/* Integrated Test Section */}
                          <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between px-2">
                              <h3 className="text-sm font-bold flex items-center gap-2">
                                <Play className="w-4 h-4 text-primary" />
                                {t.apiDocs.examples.test}
                              </h3>
                              <div className="flex items-center gap-2">
                                {testResult && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                    onClick={() => setTestResult(null)}
                                  >
                                    {lang === 'fr' ? 'Effacer' : 'Clear'}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-lg h-8 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                  onClick={() => handleTestApi('/public/extract')}
                                  disabled={isTestingApi}
                                >
                                  {isTestingApi ? (
                                    <>
                                      <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      {t.apiDocs.examples.testing}
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3 h-3 fill-current" />
                                      {t.apiDocs.examples.test}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 items-stretch">
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground min-h-6">
                                    {lang === 'fr' ? 'Configuration du Test' : 'Test Configuration'}
                                  </label>
                                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                                    {[
                                      { id: 'python', label: 'Python' },
                                      { id: 'javascript', label: 'Node.js' },
                                      { id: 'curl', label: 'cURL' },
                                      { id: 'php', label: 'PHP' },
                                    ].map((l) => (
                                      <button
                                        key={l.id}
                                        onClick={() => setSelectedTestLang(l.id as any)}
                                        className={cn(
                                          "px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all",
                                          selectedTestLang === l.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                        )}
                                      >
                                        {l.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="relative group flex-1">
                                  <div className="absolute -inset-0.5 bg-[#0f111a] rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                  <div className="relative flex flex-col h-full bg-[#0f111a] rounded-xl overflow-hidden border border-white/5 shadow-2xl min-h-6">
                                    <div className="px-4 py-2 bg-[#0f111a] border-b border-white/5 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                          <div className="w-2 h-2 rounded-full bg-rose-500/40" />
                                          <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                                        </div>
                                        <div className="h-3 w-[1px] bg-white/10 mx-1" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                          {selectedTestLang === 'python' && 'test_api.py'}
                                          {selectedTestLang === 'javascript' && 'test_api.js'}
                                          {selectedTestLang === 'curl' && 'terminal'}
                                          {selectedTestLang === 'php' && 'test_api.php'}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-5 px-1.5 ml-1 text-slate-500 hover:text-white transition-colors"
                                          onClick={handleCopyTestSnippet}
                                        >
                                          {isTestSnippetCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all rounded-md"
                                        onClick={() => handleTestApi('/public/extract')}
                                        disabled={isTestingApi}
                                      >
                                        {isTestingApi ? (
                                          <div className="h-2.5 w-2.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                        ) : (
                                          <Play className="w-2.5 h-2.5 fill-current" />
                                        )}
                                        {isTestingApi ? (lang === 'fr' ? 'Running...' : 'Running...') : (lang === 'fr' ? 'Exécuter' : 'Run')}
                                      </Button>
                                    </div>
                                    <div className="p-4 bg-[#0f111a] font-mono text-sm leading-[1.8] custom-scrollbar overflow-auto h-[400px]">
                                      <div className="text-slate-400">
                                        {selectedTestLang === 'python' && (
                                          <>
                                            <span className="text-purple-400">import</span> requests<br /><br />
                                            url = <span className="text-emerald-400">"{process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/public/extract"</span><br />

                                            <div className="flex items-center flex-wrap gap-x-1 mt-1">
                                              <span>headers = {"{"}</span>
                                              <span className="text-emerald-400">"X-API-Key"</span>
                                              <span>:</span>
                                              <span className="text-emerald-400">"</span>
                                              <input
                                                className="bg-transparent border-none text-emerald-400 outline-none w-[280px] transition-all text-sm font-mono p-0 h-auto inline-block"
                                                value={selectedApiKey}
                                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                                placeholder="your_api_key_here"
                                              />
                                              <span className="text-emerald-400">"</span>
                                              <span>{"}"}</span>
                                            </div>

                                            <div className="mt-2">
                                              <span className="text-purple-400">data</span> = {"{"}
                                              <div className="pl-4">
                                                <textarea
                                                  className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                                  value={testPayload.replace(/^{/, '').replace(/}$/, '')}
                                                  onChange={(e) => {
                                                    const content = e.target.value;
                                                    let fullJson = content;
                                                    if (!content.trim().startsWith('{')) {
                                                      fullJson = `{${content}}`;
                                                    }
                                                    setTestPayload(fullJson);
                                                  }}
                                                  spellCheck={false}
                                                />
                                              </div>
                                              <span>{"}"}</span>
                                            </div>

                                            <div className="mt-2 text-slate-500">
                                              response = requests.post(url, json=data, headers=headers)<br />
                                              <span className="text-purple-400">print</span>(response.json())
                                            </div>
                                          </>
                                        )}

                                        {selectedTestLang === 'javascript' && (
                                          <>
                                            <span className="text-purple-400">const</span> url = <span className="text-emerald-400">"{process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/public/extract"</span>;<br />
                                            <div className="flex items-center flex-wrap gap-x-1 mt-1">
                                              <span className="text-purple-400">const</span> headers = {"{"}<br />
                                              {"  "}<span className="text-emerald-400">"X-API-Key"</span>: <span className="text-emerald-400">"</span>
                                              <input
                                                className="bg-transparent border-none text-emerald-400 outline-none w-[280px] transition-all text-sm font-mono p-0 h-auto inline-block"
                                                value={selectedApiKey}
                                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                                placeholder="your_api_key_here"
                                              />
                                              <span className="text-emerald-400">"</span><br />
                                              {"}"};
                                            </div>

                                            <div className="mt-2">
                                              <span className="text-purple-400">const</span> data = {"{"}
                                              <div className="pl-4">
                                                <textarea
                                                  className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                                  value={testPayload.replace(/^{/, '').replace(/}$/, '')}
                                                  onChange={(e) => {
                                                    const content = e.target.value;
                                                    let fullJson = content;
                                                    if (!content.trim().startsWith('{')) {
                                                      fullJson = `{${content}}`;
                                                    }
                                                    setTestPayload(fullJson);
                                                  }}
                                                  spellCheck={false}
                                                />
                                              </div>
                                              <span>{"}"};</span>
                                            </div>

                                            <div className="mt-2 text-slate-500">
                                              <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> fetch(url, {"{"} method: <span className="text-emerald-400">'POST'</span>, headers, body: JSON.stringify(data) {"}"});<br />
                                              <span className="text-purple-400">console.log</span>(<span className="text-purple-400">await</span> res.json());
                                            </div>
                                          </>
                                        )}

                                        {selectedTestLang === 'curl' && (
                                          <div className="flex flex-col gap-2">
                                            <div>
                                              curl -X POST <span className="text-emerald-400">"{process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/public/extract"</span> \
                                            </div>
                                            <div className="flex items-center flex-wrap gap-x-1">
                                              {"  "}-H <span className="text-emerald-400">"X-API-Key: </span>
                                              <input
                                                className="bg-transparent border-none text-emerald-400 outline-none w-[280px] transition-all text-sm font-mono p-0 h-auto inline-block"
                                                value={selectedApiKey}
                                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                                placeholder="your_api_key_here"
                                              />
                                              <span className="text-emerald-400">"</span> \
                                            </div>
                                            <div className="flex gap-1">
                                              {"  "}-d <span className="text-emerald-400">'</span>
                                              <div className="flex-1">
                                                <textarea
                                                  className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                                  value={testPayload}
                                                  onChange={(e) => setTestPayload(e.target.value)}
                                                  spellCheck={false}
                                                />
                                              </div>
                                              <span className="text-emerald-400">'</span>
                                            </div>
                                          </div>
                                        )}

                                        {selectedTestLang === 'php' && (
                                          <>
                                            <span className="text-purple-400">&lt;?php</span><br /><br />
                                            $url = <span className="text-emerald-400">"{process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/public/extract"</span>;<br />
                                            $headers = [<br />
                                            <div className="flex items-center flex-wrap gap-x-1">
                                              {"  "}<span className="text-emerald-400">"X-API-Key: </span>
                                              <input
                                                className="bg-transparent border-none text-emerald-400 outline-none w-[280px] transition-all text-sm font-mono p-0 h-auto inline-block"
                                                value={selectedApiKey}
                                                onChange={(e) => setSelectedApiKey(e.target.value)}
                                                placeholder="your_api_key_here"
                                              />
                                              <span className="text-emerald-400">"</span><br />
                                            </div>
                                            ];<br />

                                            <div className="mt-2">
                                              $data = [
                                              <div className="pl-4">
                                                <textarea
                                                  className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                                  value={testPayload.replace(/^{/, '').replace(/}$/, '').replace(/"([^"]+)":/g, "'$1' =>")}
                                                  onChange={(e) => {
                                                    // This is tricky because we want to store JSON but show PHP array syntax
                                                    // For simplicity in this demo, we'll just allow direct JSON edit if they want
                                                    // or keep it simple.
                                                    const content = e.target.value;
                                                    let fullJson = content;
                                                    // Crude conversion back to JSON if they edited it
                                                    fullJson = content.replace(/' =>/g, '":').replace(/'/g, '"');
                                                    if (!fullJson.trim().startsWith('{')) {
                                                      fullJson = `{${fullJson}}`;
                                                    }
                                                    setTestPayload(fullJson);
                                                  }}
                                                  spellCheck={false}
                                                />
                                              </div>
                                              ];
                                            </div>

                                            <div className="mt-2 text-slate-500">
                                              $ch = curl_init($url);<br />
                                              curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);<br />
                                              curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));<br />
                                              $res = curl_exec($ch);<br />
                                              <span className="text-purple-400">echo</span> $res;
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 min-h-6">{lang === 'fr' ? 'Résultat de l\'exécution' : 'Execution Result'}</label>
                                </div>

                                <div className="relative flex-1">
                                  <div className="absolute inset-0 bg-[#0f111a] rounded-xl border border-white/5 shadow-inner overflow-hidden flex flex-col h-full">
                                    <div className="px-4 py-2 bg-[#0f111a] border-b border-white/5 flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-h-6">
                                        <Terminal className="w-3 h-3 text-slate-500" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">stdout</span>
                                      </div>
                                      {testResult && (
                                        <Badge
                                          variant="outline"
                                          className={`text-[7px] font-mono uppercase px-1.5 h-4 ${testResult.isError
                                            ? 'text-rose-500 border-rose-500/20'
                                            : 'text-emerald-500 border-emerald-500/20'
                                            }`}
                                        >
                                          {testResult.isError ? `Error ${testResult.status}` : 'Success'}
                                        </Badge>
                                      )}
                                    </div>
                                    {testResult ? (
                                      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                                        <pre className={`font-mono text-sm leading-[1.8] ${testResult.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                                          {JSON.stringify(testResult, null, 2)}
                                        </pre>
                                      </div>
                                    ) : (
                                      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3 p-6 text-center">
                                        <Terminal className="w-8 h-8 opacity-20" />
                                        <p className="text-xs font-medium leading-relaxed italic max-w-[150px]">
                                          {t.apiDocs.examples.noResponse}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Response Section */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500/20 to-purple-600/5 flex items-center justify-center text-purple-600 border border-purple-500/20 shadow-inner">
                          <Terminal className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-xl font-bold tracking-tight">{t.apiDocs.response.title}</h2>
                          <div className="h-0.5 w-8 bg-purple-500/40 rounded-full" />
                        </div>
                      </div>
                      <Card className="border border-border/40 shadow-xl bg-[#0f111a] text-slate-300 overflow-hidden rounded-2xl ring-1 ring-white/10">
                        <div className="px-6 py-4 bg-[#0f111a] border-b border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-[#0f111a]">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500/40" />
                              <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                              <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                            </div>
                            <div className="h-3 w-[1px] bg-white/10 mx-2" />
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">200 OK</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono text-white/30 border-white/10 uppercase tracking-widest px-2 py-0.5">application/json</Badge>
                        </div>
                        <CardContent className="p-0">
                          <div className="grid md:grid-cols-2 divide-x divide-white/5">
                            <div className="p-6 font-mono text-xs overflow-x-auto bg-[#0a0c14]">
                              <pre className="text-slate-100 leading-relaxed">
                                <span className="text-slate-500">{"{"}</span>
                                <br />
                                {"  "}<span className="text-purple-400">"text"</span>: <span className="text-emerald-400">"Hello [FIRST_NAME_1]..."</span>,
                                <br />
                                {"  "}<span className="text-purple-400">"entities"</span>: <span className="text-slate-500">[</span>
                                <br />
                                {"    "}<span className="text-slate-500">{"{"}</span>
                                <br />
                                {"      "}<span className="text-purple-400">"value"</span>: <span className="text-emerald-400">"Jean"</span>,
                                <br />
                                {"      "}<span className="text-purple-400">"type"</span>: <span className="text-emerald-400">"first_name"</span>,
                                <br />
                                {"      "}<span className="text-purple-400">"score"</span>: <span className="text-amber-400">0.98</span>,
                                <br />
                                {"      "}<span className="text-purple-400">"start"</span>: <span className="text-amber-400">6</span>,
                                <br />
                                {"      "}<span className="text-purple-400">"end"</span>: <span className="text-amber-400">10</span>
                                <br />
                                {"    "}<span className="text-slate-500">{"}"}</span>
                                <br />
                                {"  "}<span className="text-slate-500">]</span>,
                                <br />
                                {"  "}<span className="text-purple-400">"duration"</span>: <span className="text-amber-400">124.5</span>
                                <br />
                                <span className="text-slate-500">{"}"}</span>
                              </pre>
                            </div>
                            <div className="p-6 space-y-6 bg-white/[0.01]">
                              <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Field Definitions</div>
                              {[
                                { field: "text", desc: t.apiDocs.response.fields.text, type: "string" },
                                { field: "entities", desc: t.apiDocs.response.fields.entities, type: "array" },
                                { field: "duration", desc: t.apiDocs.response.fields.duration, type: "float" }
                              ].map((f, i) => (
                                <div key={i} className="space-y-1.5 group">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <code className="text-emerald-400 font-bold text-xs bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">{f.field}</code>
                                      <span className="text-[8px] text-slate-600 font-mono italic">{f.type}</span>
                                    </div>
                                    <Badge className="bg-white/5 text-white/40 border-white/5 text-[10px] font-black uppercase tracking-tighter px-1.5 h-4">Required</Badge>
                                  </div>
                                  <p className="text-[10px] leading-relaxed text-slate-400 font-medium group-hover:text-slate-300 transition-colors">{f.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  </div>

                  {/* Help Card */}
                  <div className="space-y-8">
                    <div className="sticky top-8 space-y-8">
                      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 text-primary overflow-hidden ">
                        <CardContent className="p-8 relative">
                          <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                              <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">{t.apiDocs.help.title}</h3>
                            <p className="text-primary/80 text-sm leading-relaxed font-medium">
                              {t.apiDocs.help.description}
                            </p>
                            <Button variant="default" className="w-full text-secondary hover:bg-white/90 rounded-xl font-bold">
                              Contact Support
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* VIEW: CHATBOT */}
          {activeTab === "chatbot" && (
            <div className="flex flex-1 overflow-hidden bg-background">

              {/* Chat Sidebar (History) */}
              {historyOpen && (
                <div className="fixed inset-0 z-50 bg-background flex flex-col md:relative md:w-64 md:inset-auto md:z-10 md:border-r animate-in slide-in-from-left duration-300 border-r">
                  <div className="flex items-center gap-2 p-4 border-b">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryOpen(false)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h3 className="font-bold">{lang === 'fr' ? 'Historique' : 'History'}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <Button
                      className="w-full justify-start gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-sm h-9 text-xs font-bold rounded-xl"
                      onClick={() => {
                        setActiveSessionId(null)
                        setMessages(exampleMessages)
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t.sidebar.newChat}
                    </Button>
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder={t.chatbot.piiPanel.search}
                        className="h-9 pl-9 text-sm rounded-xl bg-background border-border/50 focus:border-primary/20 transition-all"
                        value={sessionSearch}
                        onChange={(e) => setSessionSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <ScrollArea className="flex-1 ">
                    <div className="p-2 space-y-1 border-t border-border/50">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
                            activeSessionId === session.id ? "bg-muted/80 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                          onClick={() => {
                            setActiveSessionId(session.id)
                            fetchMessages(session.id)
                            // Close history on mobile after selection
                            if (window.innerWidth < 768) setHistoryOpen(false)
                          }}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-semibold truncate tracking-tight">{session.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Chat Header */}
                <div className="h-16 border-b bg-background backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
                  <div className="flex items-center gap-3">
                    {!historyOpen && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg flex" onClick={() => setHistoryOpen(!historyOpen)}>
                      <Menu className="h-4 w-4" />
                    </Button>}
                    {isMobile ?
                      (aiConfig?.provider == 'google-free' && <div className="flex items-center gap-2"><span className="text-[0.75rem] text-muted-foreground font-bold tabular-nums">Usage {userConsumption?.usage | 0}/{userConsumption?.limit}</span></div>)
                      : (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold tracking-tight">
                              {t.chatbot.title}
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {t.chatbot.subtitle}
                            </p>
                          </div>
                        </>
                      )
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsAiConfigModalOpen(true)}>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {!piiOpen && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPiiOpen(!piiOpen)}>
                      <Shield className={cn("h-4 w-4 transition-colors", piiOpen ? "text-primary" : "text-muted-foreground")} />
                    </Button>}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={() => setMessages(exampleMessages)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea ref={scrollRef} className="flex-1 p-4 lg:p-6">
                  <div className={cn("max-w-4xl mx-auto space-y-8 pb-12", messages.length > 1 ? "" : "h-full flex items-center justify-center")}>
                    {messages.length > 1 ?
                      (messages
                        .filter(msg => msg.role !== "system")
                        .map((msg, idx) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500",
                              msg.role === "user" ? "items-end" : "items-start"
                            )}
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <div className="w-1/2">
                              {msg.fileProcessingStatus && msg.fileProcessingStatus.length > 0 && (
                                renderMessage(msg, false)
                              )}
                            </div>
                            <div className={cn(
                              "flex gap-3 max-w-[85%]",
                              msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}>

                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform hover:scale-110",
                                msg.role === "user" ? "bg-muted/80 text-foreground border-border/50" : "bg-card text-muted-foreground border-border/50"
                              )}>
                                {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className={cn(
                                  "px-5 py-3.5 rounded-3xl text-[15px] font-medium leading-relaxed shadow-sm transition-all whitespace-pre-wrap break-words",
                                  msg.role === "user"
                                    ? "bg-muted/80 border border-border/50 rounded-tr-none shadow-none"
                                    : "bg-muted/80 border border-border/50 rounded-tl-none shadow-none"
                                )}>
                                  {(msg as any).isLoading ? (
                                    <div className="flex flex-col gap-2 min-w-[150px]">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">
                                        <Shield className="h-3 w-3" />
                                        {isDetecting ? (lang === 'fr' ? 'Anonymisation...' : 'Anonymizing...') : t.chatbot.thinking}
                                      </div>
                                      <div className="flex gap-1.5 px-1 py-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                                      </div>
                                    </div>
                                  ) : renderMessage(msg)}
                                </div>


                                {/* Message Actions */}
                                <div className={cn(
                                  "flex items-center gap-3 px-1",
                                  msg.role === "user" ? "justify-end" : "justify-start"
                                )}>
                                  {msg.piis && msg.piis.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => togglePiiVisibility(msg.id)}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md"
                                      >
                                        {msg.showPiiValues ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        {msg.showPiiValues ? t.chatbot.piiPanel.hidePii : t.chatbot.piiPanel.revealPii}
                                      </button>
                                    </>
                                  )}

                                  {/* Copy Button */}
                                  <button
                                    onClick={() => handleCopy(msg.role === "user" ? ((msg as any).raw_content || msg.content) : getDeAnonymizedContent(msg.content, messages))}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md"
                                  >
                                    <Copy className="h-3 w-3" />
                                    {lang === 'fr' ? 'Copier' : 'Copy'}
                                  </button>

                                  {(msg as any).error && (
                                    <button
                                      onClick={() => handleRetry(msg.id)}
                                      className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                      {lang === 'fr' ? 'Réessayer' : 'Retry'}
                                    </button>
                                  )}

                                  {msg.piis && msg.piis.length > 0 && (
                                    <>
                                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest bg-muted/20 px-2 py-1 rounded-md">
                                        {msg.piis.length} {t.chatbot.piiPanel.detected}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        ))) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-20 gap-4">
                          <h1 className="text-3xl sm:text-lg md:text-5xl lg:text-5xl font-extrabold mb-2 tracking-tight text-[var(--accent-primary)] animate-fade-in">
                            {t.chatbot.welcome}, <span className="lg:blur-md lg:border-none blur-none rounded-full border-black/10 border px-2 rounded-sm font-bold select-none hover:blur-none transition-all duration-500 cursor-help">{user?.full_name.toUpperCase()}</span>
                          </h1>
                          <p className="text-[var(--accent-primary)] sm:text-sm md:text-2xl lg:text-xl animate-slide-up">
                            {t.chatbot.iam} <span className="lg:blur-md lg:border-none blur-none rounded-full border-black/10 border px-2 rounded-sm font-bold select-none hover:blur-none transition-all duration-500 cursor-help">Data Private</span>. {t.chatbot.principle}: <span className="lg:blur-md lg:border-none blur-none rounded-full border-black/10 border px-2 rounded-sm font-bold select-none hover:blur-none transition-all duration-500 cursor-help">{t.chatbot.joke}</span>
                            <br />
                          </p>
                          <p className="text-[var(--accent-primary)] text-[1.1rem] max-w-[500px] animate-slide-up">
                            {t.chatbot.privacy_active_desc}
                          </p>
                          <div className="h-1/2">
                          </div>
                        </div>
                      )}

                  </div>
                </ScrollArea>

                <div className="p-4 lg:p-6 bg-gradient-to-t from-background via-background/80 to-transparent shrink-0">
                  <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-border/40 to-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700" />

                    <div className="relative bg-background/50 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden focus-within:border-primary/50 transition-all duration-500 group-focus-within:bg-background/80">
                      {false && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-300">
                          <div className="flex flex-col items-center text-center p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <p className="text-sm font-bold tracking-tight">{t.chatbot.noApiKey.title}</p>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium mb-3 max-w-[280px]">
                              {t.chatbot.noApiKey.description}
                            </p>
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs px-4"
                              onClick={() => setIsAiConfigModalOpen(true)}
                            >
                              <Settings className="w-3.5 h-3.5 mr-2" />
                              {t.chatbot.noApiKey.action}
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="p-4 px-5 flex items-start gap-3">
                        <textarea
                          ref={textareaRef}
                          className="flex-1 min-h-[24px] max-h-[200px] text-[15px] leading-relaxed p-0 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/30 scrollbar-hide"
                          placeholder={t.chatbot.placeholder}
                          rows={1}
                          disabled={false}
                          value={input}
                          onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              if (input.trim()) {
                                e.preventDefault();
                                handleSend();
                              } else {
                                e.preventDefault();
                              }
                            }
                          }}
                        />
                        <button
                          onClick={isStreaming ? handleStopStreaming : handleSend}
                          disabled={(isLoading && !isStreaming) || (!isStreaming && !input.trim() && !attachedFiles.length)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end transition-all shadow-md",
                            (isStreaming || input.trim() || attachedFiles.length || isDetecting)
                              ? "bg-primary text-primary-foreground hover:scale-110 active:scale-95 shadow-primary/20"
                              : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isStreaming ? (
                            <Square size={16} />
                          ) : isLoading || isDetecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>

                      {/* Attachments Display inside the box if any */}
                      {attachedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-5 pb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {attachedFiles.map((file, i) => (
                            <div key={i} className="group/file relative flex items-center gap-2.5 pl-2.5 pr-1.5 h-8 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 hover:border-primary/20 transition-all">
                              <FileText className="h-3.5 w-3.5 text-primary/70" />
                              <div className="flex flex-col -space-y-0.5">
                                <span className="text-[9px] font-bold text-foreground max-w-[100px] truncate">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 ml-1 rounded-lg opacity-0 group-hover/file:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-3 px-5 border-t border-border/20 flex items-center justify-between bg-muted/20 transition-colors">
                        <div className="flex gap-4 text-muted-foreground">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={false}
                            className={cn(
                              "flex items-center gap-2 text-[0.85rem] font-medium hover:text-primary transition-colors",
                              false && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Paperclip size={18} />
                            <span className="hidden sm:block md:block lg:block xl:block">{lang === 'fr' ? 'Joindre' : 'Attach'}</span>
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.docx"
                            onChange={(e) => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files)
                                const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/csv', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                                const validFiles = filesArray.filter(file => validTypes.includes(file.type))
                                const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type))

                                if (invalidFiles.length > 0) {
                                  toast.error(lang === 'fr'
                                    ? `Format non supporté pour: ${invalidFiles.map(f => f.name).join(', ')}. Veuillez utiliser PDF, PNG, JPG, CSV, TXT ou DOCX.`
                                    : `Unsupported format for: ${invalidFiles.map(f => f.name).join(', ')}. Please use PDF, PNG, JPG, CSV, TXT or DOCX.`)
                                }

                                if (validFiles.length > 0) {
                                  setAttachedFiles(prev => [...prev, ...validFiles])
                                }
                              }
                            }}
                          />
                          <button className="flex items-center gap-2 text-[0.85rem] font-medium hover:text-primary transition-colors opacity-50 cursor-not-allowed">
                            <Bot size={18} /><span className="hidden sm:block md:block lg:block xl:block"> {lang === 'fr' ? 'Assistant' : 'Assistant'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <Menubar className="border-none bg-transparent shadow-none p-0 h-auto">
                            <MenubarMenu>
                              <MenubarTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50 border border-border/50 text-[0.85rem] font-bold hover:text-primary hover:border-primary/30 transition-all shadow-sm cursor-pointer data-[state=open]:bg-background/80 focus:bg-background/80">
                                <Sparkles size={14} className="text-primary" />
                                <span className="uppercase tracking-tight">{aiConfig.model}</span>
                                <ChevronDown size={14} className="text-muted-foreground opacity-50" />
                              </MenubarTrigger>
                              <MenubarContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl">
                                <MenubarLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">{lang === 'fr' ? 'Fournisseurs & Modèles' : 'Providers & Models'}</MenubarLabel>
                                <MenubarSeparator className="mb-4" />
                                {aiProviders.filter(p => savedCredentials[p.id] || p.id === "google-free").map((provider) => (
                                  <MenubarSub key={provider.id}>
                                    <MenubarSubTrigger className="rounded-xl cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">{provider.name}</span>
                                        {provider.id === "google-free" &&
                                          <Badge variant="outline" className="text-[9px] h-4 border-green-500/30 text-green-500">Free</Badge>
                                        }
                                      </div>
                                    </MenubarSubTrigger>
                                    <MenubarPortal>
                                      <MenubarSubContent>
                                        {provider.id === "google-free" ? (
                                          provider.models.map(model => (
                                            <MenubarItem
                                              key={model.id}
                                              className={cn(
                                                "flex items-center justify-between rounded-xl px-2 py-2 cursor-pointer transition-colors",
                                                aiConfig.model === model.id ? "bg-primary/5 text-primary" : "hover:bg-background/80"
                                              )}
                                              onClick={async () => {
                                                const newConfig = { ...aiConfig, model: model.id, provider: provider.id, api_key: "" }; // Empty key for free tier
                                                setAiConfig(newConfig);
                                                // Sauvegarder immédiatement le changement de modèle
                                                try {
                                                  await api.post('/chatbot-config/', newConfig);
                                                  toast.success(lang === 'fr' ? `Modèle changé pour ${model.name}` : `Model changed to ${model.name}`);
                                                } catch (err: any) {
                                                  console.error("Failed to save model change", err);
                                                  toast.error(lang === 'fr' ? "Erreur lors de la sauvegarde du modèle" : "Error saving model change");
                                                }
                                              }}
                                            >
                                              <span className="text-xs font-bold">{model.name}</span>
                                              {aiConfig.model === model.id && <Check className="h-3 w-3 ml-2" />}
                                            </MenubarItem>
                                          ))
                                        ) : (
                                          provider.models.map(model => (
                                            <MenubarItem
                                              key={model.id}
                                              className={cn(
                                                "flex items-center justify-between rounded-xl px-2 py-2 cursor-pointer transition-colors",
                                                aiConfig.model === model.id ? "bg-primary/5 text-primary" : "hover:bg-background/80"
                                              )}
                                              onClick={async () => {
                                                const newConfig = { ...aiConfig, model: model.id, provider: provider.id, api_key: savedCredentials[provider.id] };
                                                setAiConfig(newConfig);
                                                // Sauvegarder immédiatement le changement de modèle
                                                try {
                                                  await api.post('/chatbot-config/', newConfig);
                                                  toast.success(lang === 'fr' ? `Modèle changé pour ${model.name}` : `Model changed to ${model.name}`);
                                                } catch (err: any) {
                                                  console.error("Failed to save model change", err);
                                                  toast.error(lang === 'fr' ? "Erreur lors de la sauvegarde du modèle" : "Error saving model change");
                                                }
                                              }}
                                            >
                                              <span className="text-xs font-bold">{model.name}</span>
                                              {aiConfig.model === model.id && <Check className="h-3 w-3 ml-2" />}
                                            </MenubarItem>
                                          ))
                                        )}
                                      </MenubarSubContent>
                                    </MenubarPortal>
                                  </MenubarSub>
                                ))}
                                {Object.keys(savedCredentials).length === 0 && (
                                  <div className="p-2 text-xs text-muted-foreground text-center">
                                    {/* Optional empty state hint if desired, though free tier usually shows up */}
                                  </div>
                                )}
                                <MenubarSeparator />
                                <MenubarItem className="rounded-xl cursor-pointer justify-center text-xs font-bold text-muted-foreground" onClick={() => { setIsAiConfigModalOpen(true); }}>
                                  {lang === 'fr' ? 'Gérer les fournisseurs...' : 'Manage Providers...'}
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                          {aiConfig?.provider == 'google-free' && <span className="hidden sm:block md:block lg:block xl:block text-[0.75rem] text-muted-foreground font-medium tabular-nums">{userConsumption?.usage}/{userConsumption?.limit}</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-[0.75rem] text-muted-foreground mt-3">
                      {lang === 'fr'
                        ? "Data Private protège vos PII en utilisant l'extraction locale avant de communiquer avec l'IA."
                        : "Data Private protects your PII using local extraction before communicating with the AI."}
                    </p>
                  </div>
                </div>
              </div>

              {/* PII Side Panel (Right) */}
              {piiOpen && (
                <div className="fixed inset-0 z-50 bg-background flex flex-col xl:relative xl:w-72 xl:inset-auto xl:z-10 xl:border-l animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {t.chatbot.piiPanel.title}
                    </h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPiiOpen(false)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 border-b space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground font-medium opacity-80 leading-tight">
                        {t.chatbot.piiPanel.subtitle}
                      </p>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-xs h-6">{allPiis.length}</Badge>
                    </div>
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder={t.chatbot.piiPanel.search}
                        className="h-8 pl-8 text-[11px] rounded-lg bg-background border-border/50 focus:border-primary/20 transition-all"
                        value={piiSearch}
                        onChange={(e) => setPiiSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                      {filteredPiis.length > 0 ? (
                        filteredPiis.map((pii) => (
                          <div key={pii.id} className="p-3.5 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all group">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <Badge className={cn("text-xs font-black h-5 px-2 border-none", getPiiColor(pii.type))}>
                                {getPiiLabel(pii.type).toUpperCase()}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-md hover:bg-muted"
                                onClick={() => togglePiiLock(pii.value)}
                                title={pii.locked ? (lang === 'fr' ? "Rendre privé (anonymiser)" : "Make private (anonymize)") : (lang === 'fr' ? "Rendre public (ne pas anonymiser)" : "Make public (do not anonymize)")}
                              >
                                {pii.locked ? <Unlock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-muted-foreground/40" />}
                              </Button>
                              {pii.type.startsWith('user_') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-md hover:bg-rose-500/10 hover:text-rose-500"
                                  onClick={() => handleDeletePii(pii.value)}
                                  title={lang === 'fr' ? "Supprimer l'entité" : "Delete entity"}
                                >
                                  <Trash2 className="h-3 w-3 text-rose-500" />
                                </Button>
                              )}
                            </div>
                            <p className="text-[11px] font-bold break-all leading-tight group-hover:text-primary transition-colors">{pii.value}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Status</span>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter",
                                pii.locked ? "text-emerald-500" : "text-amber-500"
                              )}>
                                {pii.locked ? (lang === 'fr' ? "Public" : "Public") : (lang === 'fr' ? "Privé" : "Private")}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-40 grayscale">
                          <Shield className="h-8 w-8 mb-3 text-muted-foreground" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">{t.chatbot.piiPanel.noEntities}</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* VIEW: DESKTOP */}
          {activeTab === "desktop" && (
            <ScrollArea className="flex-1 p-4">
              <div className="w-full space-y-6 p-8">
                {/* Header */}
                <div className="flex flex-col gap-2 animate-reveal">
                  {/* <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Monitor className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="px-3 py-0.5 border-primary/20 text-primary font-bold tracking-wider">
                      NATIVE
                    </Badge>
                  </div> */}
                  <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t.desktop.title}
                  </h1>
                  <p className="text-muted-foreground text-sm font-medium">
                    {t.desktop.subtitle}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-reveal" style={{ animationDelay: '100ms' }}>
                  {t.desktop.features.map((feature: any, idx: number) => {
                    const icons = [ShieldCheck, Cpu, Zap];
                    const Icon = icons[idx] || ShieldCheck;
                    return (
                      <Card key={idx} className="border-none bg-card/50 backdrop-blur-sm ring-1 ring-border/50 hover:shadow-lg transition-all">
                        <CardContent className="pt-6">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-bold mb-1">{feature.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Platforms */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-reveal mt-12" style={{ animationDelay: '200ms' }}>
                  {[
                    {
                      id: 'mac',
                      name: 'macOS',
                      icon: Apple,
                      version: 'v1.2.0',
                      requirements: lang === 'fr' ? 'macOS 12.0 ou ultérieur' : 'macOS 12.0 or later',
                      downloads: [
                        { label: 'Apple Silicon (M1/M2/M3)', link: '#' },
                        { label: 'Intel Chip', link: '#' }
                      ]
                    },
                    {
                      id: 'windows',
                      name: 'Windows',
                      icon: Wind,
                      version: 'v1.2.0',
                      requirements: lang === 'fr' ? 'Windows 10/11 (64-bit)' : 'Windows 10/11 (64-bit)',
                      downloads: [
                        { label: lang === 'fr' ? 'Installer (.exe)' : 'Installer (.exe)', link: '#' },
                        { label: lang === 'fr' ? 'Portable (.zip)' : 'Portable (.zip)', link: '#' }
                      ]
                    },
                    {
                      id: 'linux',
                      name: 'Linux',
                      icon: Terminal,
                      version: 'v1.1.5',
                      requirements: lang === 'fr' ? 'Ubuntu 20.04+, Fedora 35+' : 'Ubuntu 20.04+, Fedora 35+',
                      downloads: [
                        { label: 'AppImage', link: '#' },
                        { label: 'Debian (.deb)', link: '#' }
                      ]
                    }
                  ].map((platform) => (
                    <Card key={platform.id} className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center shadow-inner">
                            <platform.icon className="w-6 h-6" />
                          </div>
                          <Badge variant="secondary" className="font-bold text-[10px]">{platform.version}</Badge>
                        </div>
                        <CardTitle className="text-xl font-bold">{platform.name}</CardTitle>
                        <CardDescription className="text-xs font-medium">{platform.requirements}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 mt-auto">
                        {platform.downloads.map((dl, dlIdx) => (
                          <Button
                            key={dlIdx}
                            variant={dlIdx === 0 ? "default" : "outline"}
                            className={cn(
                              "w-full h-11 rounded-xl font-bold flex items-center justify-between px-4 transition-all active:scale-[0.98]",
                              dlIdx === 0 ? "bg-black dark:bg-white text-white dark:text-black" : "border-dashed"
                            )}
                          >
                            <span className="text-xs">{dl.label}</span>
                            <Download className="w-4 h-4 opacity-50" />
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Why Desktop Card */}
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 rounded-2xl  mt-12 overflow-hidden relative animate-reveal" style={{ animationDelay: '300ms' }}>
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Shield className="w-48 h-48 text-primary" />
                  </div>
                  <CardContent className="p-8 md:p-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h2 className="text-2xl font-black text-primary tracking-tighter mb-6">
                          {t.desktop.securityTitle}
                        </h2>
                        <div className="space-y-4">
                          {t.desktop.securityPoints.map((point: string, idx: number) => (
                            <div key={idx} className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-primary" />
                              </div>
                              <p className="text-sm font-medium text-primary leading-relaxed">
                                {point}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="hidden md:flex justify-center">
                        <div className="relative">
                          <div className="w-48 h-48 rounded-full bg-background/10 animate-pulse flex items-center justify-center">
                            <Monitor className="w-24 h-24 opacity-20 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

          {/* VIEW: ENTITY DETECTION */}
          {activeTab === "entity-detection" && (
            <div className="flex flex-1 overflow-hidden bg-background">
              {/* Main Detection Area */}
              <div className="flex-1 flex flex-col p-4 lg:p-12 space-y-6 overflow-y-auto">
                {!entitySidebarOpen && (
                  <div className="lg:hidden flex justify-end absolute right-4 bottom-4 z-100">
                    <Button variant="default" size="icon" className="h-10 w-10 rounded-full bg-primary transition-colors" onClick={() => setEntitySidebarOpen(true)}>
                      <Settings className="h-5 w-5 text-secondary" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-row items-center gap-4 animate-reveal mb-2">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.entityDetection.title}</h1>
                    <p className="text-muted-foreground text-sm font-medium">{t.entityDetection.subtitle}</p>
                  </div>
                </div>

                <div className={cn(" animate-reveal", isMobile ? "flex flex-col gap-2" : "flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 items-stretch")} style={{ animationDelay: '100ms' }}>
                  {/* Input Text Area */}
                  <div className={cn("flex flex-col border border-border bg-card/30 overflow-hidden rounded-xl transition-all hover:border-primary/30", isMobile ? "w-full h-[400px]" : "h-[400px] lg:h-[550px] ")}>
                    <div className="py-3 px-5 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{t.entityDetection.originalText}</span>
                        {detectionInput && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
                            onClick={handleClearInput}
                            title={lang === 'fr' ? "Effacer" : "Clear"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold uppercase border-muted-foreground/10 text-muted-foreground/40 h-6">Input</Badge>
                    </div>
                    <div className="flex-1 overflow-hidden h-full group/input">
                      <textarea
                        className="w-full h-full p-6 bg-transparent border-none focus:ring-0 resize-none text-[15px] font-medium leading-relaxed placeholder:text-muted-foreground/30 selection:bg-primary/10 transition-all focus:bg-primary/[0.01] focus:placeholder:text-muted-foreground/20 overflow-y-auto custom-scrollbar"
                        placeholder={t.entityDetection.inputPlaceholder}
                        value={detectionInput}
                        onChange={(e) => setDetectionInput(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Central Button */}
                  <div className={cn("flex flex-col items-center justify-center py-2 lg:py-0 ", isMobile ? "w-full" : "h-[400px] lg:h-[550px]")}>
                    <Button
                      size="icon"
                      className={cn(
                        " rounded-full shadow-sm transition-all group z-10",
                        isDetecting ? "bg-muted text-muted-foreground animate-pulse" : "bg-primary text-primary-foreground hover:scale-105 active:scale-95",
                        isMobile ? "w-[80%] " : "h-10 w-10 lg:h-12 lg:w-12"
                      )}
                      onClick={handleDetection}
                      disabled={isDetecting}
                    >
                      {isDetecting ? (
                        <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        isMobile ? <>Detecter Entités</> : <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300" />
                      )}
                    </Button>
                  </div>

                  {/* Result Text Area */}
                  <div className={cn(
                    "h-[400px] lg:h-[550px] flex flex-col border border-border bg-card/30 overflow-hidden rounded-xl transition-all hover:border-primary/30 relative",
                    isDetecting && "opacity-60"
                  )}>
                    <div className="py-3 px-5 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{t.entityDetection.detectionResult}</span>
                        {detectionResult && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-primary/5 hover:text-primary transition-all active:scale-90"
                            onClick={handleCopyResult}
                            title={t.entityDetection.copy}
                          >
                            {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs font-semibold uppercase border-primary/10 text-primary bg-primary/5 h-6 shrink-0">Anonymized</Badge>
                        {detectionDuration !== null && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 animate-in fade-in zoom-in duration-300">
                            <Zap className="w-2.5 h-2.5 text-amber-500" />
                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 tabular-nums">
                              {Math.round(detectionDuration)}ms
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 relative overflow-y-auto custom-scrollbar">
                      {isDetecting && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px] gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 animate-pulse">
                            {lang === 'fr' ? 'Anonymisation...' : 'Anonymizing...'}
                          </span>
                        </div>
                      )}
                      {renderDetectionResult()}
                    </div>
                  </div>
                </div>
              </div>

              {!isMobile && (
                <div className={cn(
                  "fixed inset-0 z-50 bg-background flex flex-col lg:relative lg:w-72 lg:inset-auto lg:z-10 lg:border-l animate-in duration-300",
                  isMobile ? "slide-in-from-left" : "slide-in-from-right"
                )}>
                  {/* Header (Visible on mobile mostly, but good for consistency) */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-sm flex items-center gap-2.5 tracking-tight">
                      <div className="p-1 rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold tracking-tight">{t.entityDetection.sidebarTitle || "Configuration"}</span>
                    </h3>
                    {isMobile && (<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50 rounded-lg" onClick={() => setEntitySidebarOpen(false)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>)}
                  </div>

                  <div className="p-6 border-b space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2.5 tracking-tight">
                      {lang === 'fr' ? 'Seuils & Paramètres' : 'Thresholds & Settings'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t.entityDetection.confidenceThreshold}</label>
                        <span className="text-xs font-black tracking-tighter text-primary">{Math.round(detectionThreshold * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={detectionThreshold}
                        onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground/40 uppercase">
                        <span>Flexible (0%)</span>
                        <span>Précis (100%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b space-y-1.5 bg-muted/5">
                    <h3 className="font-bold text-sm flex items-center gap-2.5 tracking-tight">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Tags className="h-4 w-4" />
                      </div>
                      {t.entityDetection.labelsTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground pl-8 font-medium opacity-80">{t.entityDetection.labelsSubtitle}</p>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                      {Object.entries(labels_dict).map(([category, labels], i) => {
                        const isExpanded = expandedCategories.includes(category);
                        const categoryLabel = t.entityDetection.categories[category] || category;
                        const selectedCount = labels.filter(l => selectedLabels.includes(l)).length;
                        const allSelected = labels.every(l => selectedLabels.includes(l));
                        const Icon = categoryIcons[category] || Tags;

                        return (
                          <div key={category} className="animate-reveal" style={{ animationDelay: `${(i + 3) * 30}ms` }}>
                            <div
                              className={`flex items-center gap-3 p-1 rounded-xl cursor-pointer transition-all group border ${isExpanded ? "border-border border-1" : "hover:bg-muted/40"
                                }`}
                            >

                              <Button
                                className={cn(
                                  "h-8 w-8 rounded-lg transition-all duration-300",
                                  selectedCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary"
                                )}
                                onClick={() => toggleAllInCategory(category)}>
                                <Icon className="h-4 w-4" />
                              </Button>

                              <div
                                className="flex-1 flex flex-row items-center justify-between overflow-hidden justify-between px-2"
                                onClick={() => toggleCategory(category)}
                              >
                                <div className="flex flex-col overflow-hidden">
                                  <span className={cn("text-xs font-semibold truncate transition-colors", selectedCount > 0 ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{categoryLabel}</span>
                                </div>
                                <div className="flex items-center gap-2 pl-2">
                                  {selectedCount > 0 && (
                                    <span className="text-[10px] font-bold text-primary">{selectedCount}</span>
                                  )}
                                  <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-300 text-muted-foreground/40", isExpanded ? "rotate-0" : "-rotate-90")} />
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="ml-5 pl-4 border-l border-border flex flex-col gap-1 py-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div
                                  className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-all group/all"
                                  onClick={() => toggleAllInCategory(category)}
                                >
                                  <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={() => toggleAllInCategory(category)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-3.5 w-3.5 rounded"
                                  />
                                  <span className="text-[10px] font-semibold text-muted-foreground group-hover/all:text-primary transition-colors uppercase tracking-wider">
                                    {lang === 'fr' ? "Tout sélectionner" : "Select all"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 gap-0.5">
                                  {labels.map(label => (
                                    <div
                                      key={label}
                                      className={cn(
                                        "flex items-center gap-2.5 p-2 px-3 rounded-lg cursor-pointer transition-all group/label",
                                        selectedLabels.includes(label)
                                          ? "text-primary bg-primary/5"
                                          : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/30"
                                      )}
                                      onClick={() => toggleLabel(label)}
                                    >
                                      <Checkbox
                                        checked={selectedLabels.includes(label)}
                                        onCheckedChange={() => toggleLabel(label)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-3.5 w-3.5 rounded"
                                      />
                                      <span className="text-[12px] font-medium capitalize leading-none tracking-tight">{label.replace(/_/g, ' ')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t bg-muted/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-9 text-[10px] font-bold rounded-lg border border-border hover:bg-muted transition-all uppercase tracking-wider"
                      onClick={handleClearAllLabels}
                    >
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SidebarInset>

        {/* Modal for AI Configuration */}
        <Dialog
          open={isAiConfigModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setShowAddProvider(false);
              setEditingProvider(null);
            }
            setIsAiConfigModalOpen(open);
          }}
        >
          <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
            {!showAddProvider ? (
              // LIST VIEW
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>{t.chatbot.config.title}</DialogTitle>
                  <DialogDescription>{t.chatbot.config.subtitle}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  {Array.from(new Set([...Object.keys(savedCredentials), 'google-free'])).map(providerId => {
                    const providerInfo = aiProviders.find(p => p.id === providerId)
                    // Skip if provider info not found (e.g. old ID)
                    if (!providerInfo && providerId !== 'google-free') return null;
                    // Mock provider info for google-free if needed (though it should be in AI_PROVIDERS now)

                    return (
                      <Card key={providerId} className="flex items-center justify-between p-4 bg-muted/30 border shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border font-bold text-xs">
                            {providerInfo?.name.substring(0, 2).toUpperCase() || "??"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">{providerInfo?.name || providerId}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{providerId}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8"
                            disabled={providerId === 'google-free'}
                            onClick={() => {
                              // Initialize dialog config, not aiConfig
                              setProviderDialogConfig({
                                provider: providerId,
                                model: "",
                                api_key: savedCredentials[providerId] || ""
                              })
                              setEditingProvider(providerId)
                              setShowAddProvider(true)
                            }}
                          >
                            {lang === 'fr' ? 'Modifier' : 'Edit'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={providerId === 'google-free'}
                            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent"
                            onClick={() => handleDeleteProvider(providerId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  })}

                  {Object.keys(savedCredentials).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                      {lang === 'fr' ? "Aucun founisseur configuré" : "No provider configured"}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full h-12 rounded-xl text-base font-bold shadow-lg"
                  onClick={() => {
                    setEditingProvider(null)
                    // Default to OpenAI or first available non-free provider, NOT google-free
                    setProviderDialogConfig({ provider: "openai", model: "", api_key: "" })
                    setShowAddProvider(true)
                  }}
                >
                  {lang === 'fr' ? 'Ajouter un fournisseur' : 'Add Provider'}
                </Button>
              </div>
            ) : (
              // ADD/EDIT VIEW
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setShowAddProvider(false)}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <DialogTitle>{editingProvider ? (lang === 'fr' ? 'Modifier le fournisseur' : 'Edit Provider') : (lang === 'fr' ? 'Ajouter un fournisseur' : 'Add Provider')}</DialogTitle>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>{t.chatbot.config.provider}</Label>
                    <Select
                      value={providerDialogConfig.provider}
                      onValueChange={(val) => {
                        const savedKey = savedCredentials[val] || "";
                        setProviderDialogConfig(prev => ({ ...prev, provider: val, api_key: savedKey }))
                      }}
                      disabled={!!editingProvider}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aiProviders.filter(p => {
                          // Allow if it's the provider currently being edited
                          if (editingProvider && p.id === editingProvider) return true;
                          // Always exclude google-free 
                          if (p.id === 'google-free') return false;
                          // Exclude if already configured (in savedCredentials)
                          if (savedCredentials[p.id]) return false;
                          return true;
                        }).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.chatbot.config.apiKey}</Label>
                    {providerDialogConfig.provider === 'google-free' ? (
                      <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground border border-dashed flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        {lang === 'fr' ? 'Géré par le système (Plan Gratuit)' : 'Managed by System (Free Tier)'}
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={providerDialogConfig.api_key}
                          onChange={(e) => setProviderDialogConfig({ ...providerDialogConfig, api_key: e.target.value })}
                          placeholder={t.chatbot.config.apiKeyPlaceholder}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleTestAiConfig}
                    disabled={isTestingConfig || (!providerDialogConfig.api_key && providerDialogConfig.provider !== 'google-free')}
                  >
                    {isTestingConfig ? (
                      <>
                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      lang === 'fr' ? 'Tester la connexion' : 'Test Connection'
                    )}
                  </Button>

                  <Button
                    className="w-full"
                    onClick={handleSaveProviderConfig}
                    disabled={isSavingAiConfig || (!providerDialogConfig.api_key && providerDialogConfig.provider !== 'google-free')}
                  >
                    {isSavingAiConfig ? t.chatbot.config.saving : t.chatbot.config.save}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {activeSelection && activeSelection.rect && (
          <Popover open={!!activeSelection} onOpenChange={(open) => !open && setActiveSelection(null)}>
            <PopoverAnchor
              style={{
                position: 'fixed',
                left: activeSelection.rect.left,
                top: activeSelection.rect.top,
                width: activeSelection.rect.width,
                height: activeSelection.rect.height,
                pointerEvents: 'none',
                zIndex: 9999
              }}
            />
            <PopoverContent
              className="w-auto p-0 border-none shadow-2xl rounded-lg backdrop-blur-md anonymize-popover"
              side="top"
              align="center"
              sideOffset={8}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8  text-[10px] font-bold rounded-lg flex items-center gap-2 hover:shadow-lg"
                onClick={() => handleManualAnonymize(activeSelection.msgId!)}
              >
                <Shield className="h-3 w-3" />
                {lang === 'fr' ? 'Anonymiser' : 'Anonymize'}
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div >
    </SidebarProvider >
  )
}
