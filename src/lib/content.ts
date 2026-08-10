import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ContentRow = Tables<"contents">;
export type ContentType = ContentRow["type"];

export const CONTENT_TYPES: { value: ContentType; label: { fr: string; en: string } }[] = [
  { value: "page", label: { fr: "Pages du site", en: "Site pages" } },
  { value: "article", label: { fr: "Actualité", en: "News" } },
  { value: "livre", label: { fr: "Livre / publication", en: "Book" } },
  { value: "formation", label: { fr: "Formation", en: "Training" } },
  { value: "produit", label: { fr: "Produit boutique", en: "Shop item" } },
  { value: "realisation", label: { fr: "Réalisation", en: "Achievement" } },
  { value: "experience", label: { fr: "Expérience", en: "Experience" } },
  { value: "organisation", label: { fr: "Organisation", en: "Organisation" } },
  { value: "newsletter", label: { fr: "Newsletter", en: "Newsletter" } },
];


/** Clés des pages éditables depuis le tableau de bord (slug des contenus de type « page »). */
export const PAGE_KEYS = [
  "accueil",
  "a-propos",
  "experiences",
  "organisations",
  "livres",
  "formations",
  "realisations",
  "actualites",
  "boutique",
  "contact",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

/**
 * Contenus de type « page » liés à une page : l'entrée dont le slug vaut la clé
 * pilote l'en-tête, celles en `cle/xxx` sont des blocs libres ajoutés à la page.
 */
export function pageContentsQuery(page: PageKey) {
  return queryOptions({
    queryKey: ["contents", "page", page],
    queryFn: async (): Promise<ContentRow[]> => {
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .eq("type", "page")
        .eq("published", true)
        .or(`slug.eq.${page},slug.like.${page}/*`)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}


/** Contenus publiés, lisibles publiquement (RLS : published = true). */
export function publishedContentsQuery(type: ContentType) {
  return queryOptions({
    queryKey: ["contents", "published", type],
    queryFn: async (): Promise<ContentRow[]> => {
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .eq("type", type)
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Tous les contenus (dashboard) — RLS n'autorise que les admins/éditeurs. */
export const allContentsQuery = queryOptions({
  queryKey: ["contents", "all"],
  queryFn: async (): Promise<ContentRow[]> => {
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .order("type", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

/** Taux de complétude des traductions anglaises d'un contenu. */
export function missingTranslations(row: ContentRow): ("title" | "excerpt" | "body")[] {
  const missing: ("title" | "excerpt" | "body")[] = [];
  if (!row.title_en?.trim()) missing.push("title");
  if (row.excerpt_fr?.trim() && !row.excerpt_en?.trim()) missing.push("excerpt");
  if (row.body_fr?.trim() && !row.body_en?.trim()) missing.push("body");
  return missing;
}
