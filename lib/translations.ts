export const labels_dict: Record<string, string[]> = {
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

export const translations: any = {
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
      trial: "TRIAL",
      trialExpiresAt: "Fin du trial",
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
      joke: "Laissons ça privées",
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
        apiKeyPlaceholder: "Entrez votre clé API",
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
      trial: "TRIAL",
      trialExpiresAt: "Trial Ends",
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
      joke: "Let’s keep it private",
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
        apiKeyPlaceholder: "Enter your API key",
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
        sensitive_personal_information: "Sensitive Data",
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

export const getPiiColor = (type: string) => {
  const typeLower = type.toLowerCase().replace(/ /g, '_')
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

export const getPiiLabel = (type: string) => {
  if (type.startsWith('user_')) {
    return type.split('_pii_')[0].replace(/_/g, ' ')
  }
  return type
}

export const getInitials = (name: string) => {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
