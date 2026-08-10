import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "fr" | "en";
export type LocalizedText = { fr: string; en: string };

/** Résultat d'une résolution de contenu bilingue avec repli. */
export type Resolved = {
  value: string;
  /** true quand la langue demandée n'a pas de traduction et qu'on affiche l'autre langue */
  isFallback: boolean;
  /** langue réellement affichée */
  shownLang: Lang;
};

/**
 * Résout un couple FR/EN : renvoie la langue demandée si elle est renseignée,
 * sinon l'autre langue (repli), sinon une chaîne vide.
 */
export function resolveBilingual(
  fr: string | null | undefined,
  en: string | null | undefined,
  lang: Lang,
): Resolved {
  const wanted = (lang === "fr" ? fr : en)?.trim();
  if (wanted) return { value: wanted, isFallback: false, shownLang: lang };

  const other = (lang === "fr" ? en : fr)?.trim();
  const otherLang: Lang = lang === "fr" ? "en" : "fr";
  if (other) return { value: other, isFallback: true, shownLang: otherLang };

  return { value: "", isFallback: false, shownLang: lang };
}

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (value: LocalizedText) => string;
  /** Texte avec repli automatique sur l'autre langue */
  tf: (fr: string | null | undefined, en: string | null | undefined) => string;
  /** Version détaillée : valeur + indicateur de repli */
  resolve: (fr: string | null | undefined, en: string | null | undefined) => Resolved;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "ja-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (text: LocalizedText) => text[lang],
      tf: (fr, en) => resolveBilingual(fr, en, lang).value,
      resolve: (fr, en) => resolveBilingual(fr, en, lang),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
