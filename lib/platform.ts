// Détecte si le code tourne dans l'app desktop Tauri (vs navigateur web).
// Sûr côté SSR : renvoie false si window n'existe pas.
export function isTauriRuntime(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}
