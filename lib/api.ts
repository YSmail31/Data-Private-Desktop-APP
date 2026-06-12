"use client"
import axios from 'axios';


let apiUrl = '/api/v1'

// Dans l'app desktop Tauri, le frontend est servi depuis un protocole local
// (tauri://localhost / http://tauri.localhost), il n'y a pas de backend local :
// on cible donc le backend distant. Détection au runtime => aucun impact sur le build web.
const isTauri = typeof window !== 'undefined' &&
  ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

if (isTauri) {
  // App desktop : on cible le backend distant par défaut.
  // Surchargeable via NEXT_PUBLIC_API_URL.
  apiUrl = 'https://private-data.ai/api/v1';
} else if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  if (hostname.includes('localhost') || isIpAddress) {
    apiUrl = `${protocol}//${hostname}:8000/api/v1`;
  } else if (process.env.NEXT_PUBLIC_API_URL) {
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
} else if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
  apiUrl = process.env.NEXT_PUBLIC_API_URL;
}


const API_URL = apiUrl;

export const API_BASE_URL = apiUrl;

const api = axios.create({
  baseURL: API_URL,
});


// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs de token expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne pas rediriger si c'est une requête avec une clé API (test API publique)
      // OU si c'est une requête vers le test de configuration chatbot
      const isApiKeyRequest = error.config?.headers?.['X-API-Key'];
      const isChatbotTestRequest = error.config?.url?.includes('/chatbot-config/test-connection');

      // Dans l'app desktop, on n'a pas de page /login : on ne redirige pas.
      if (typeof window !== 'undefined' && !isApiKeyRequest && !isChatbotTestRequest && !isTauri) {
        localStorage.removeItem('token');
        // Rediriger vers login si on n'est pas déjà sur une page publique
        const publicPages = ['/', '/login', '/signup'];
        if (!publicPages.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
