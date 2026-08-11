import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SocialLink = Tables<"social_links">;
export type SiteSetting = Tables<"site_settings">;

/** Plateformes proposées dans le tableau de bord. */
export const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "site", label: "Site web" },
] as const;

/** Réglages éditables depuis le tableau de bord (coordonnées, carte, newsletter). */
export const SETTING_KEYS = [
  {
    key: "contact_email",
    label: { fr: "Email de contact", en: "Contact email" },
    group: "contact",
  },
  { key: "contact_phone", label: { fr: "Téléphone", en: "Phone" }, group: "contact" },
  {
    key: "whatsapp_number",
    label: { fr: "Numéro WhatsApp (chiffres uniquement)", en: "WhatsApp number (digits only)" },
    group: "contact",
  },
  {
    key: "contact_address_fr",
    label: { fr: "Adresse (FR)", en: "Address (FR)" },
    group: "contact",
  },
  {
    key: "contact_address_en",
    label: { fr: "Adresse (EN)", en: "Address (EN)" },
    group: "contact",
  },
  {
    key: "contact_maps_query",
    label: { fr: "Lieu affiché sur la carte", en: "Location shown on the map" },
    group: "contact",
  },
  {
    key: "newsletter_intro_fr",
    label: { fr: "Texte d'introduction (FR)", en: "Intro text (FR)" },
    group: "newsletter",
    multiline: true,
  },
  {
    key: "newsletter_intro_en",
    label: { fr: "Texte d'introduction (EN)", en: "Intro text (EN)" },
    group: "newsletter",
    multiline: true,
  },
] as const;

export type SettingGroup = (typeof SETTING_KEYS)[number]["group"];

/** Images fixes du site, remplaçables ou supprimables depuis le tableau de bord. */
const PAGE_IMAGE_LABELS: { key: string; fr: string; en: string }[] = [
  { key: "a-propos", fr: "À propos", en: "About" },
  { key: "experiences", fr: "Expériences", en: "Experience" },
  { key: "organisations", fr: "Organisations", en: "Organisations" },
  { key: "livres", fr: "Livres et publications", en: "Books and publications" },
  { key: "formations", fr: "Formations", en: "Training" },
  { key: "realisations", fr: "Réalisations", en: "Projects" },
  { key: "actualites", fr: "Actualités", en: "News" },
  { key: "boutique", fr: "Boutique", en: "Shop" },
  { key: "contact", fr: "Contact", en: "Contact" },
];

export const SITE_IMAGE_KEYS: {
  key: string;
  label: { fr: string; en: string };
  hint: { fr: string; en: string };
}[] = [
  {
    key: "image_logo",
    label: { fr: "Logo du site", en: "Site logo" },
    hint: {
      fr: "Affiché dans l'en-tête. Vide = monogramme « JA ».",
      en: "Shown in the header. Empty = “JA” monogram.",
    },
  },
  {
    key: "image_home_portrait",
    label: { fr: "Accueil — portrait principal", en: "Home — main portrait" },
    hint: {
      fr: "Grande photo affichée en haut de la page d'accueil.",
      en: "Large photo at the top of the home page.",
    },
  },
  {
    key: "image_home_workshop",
    label: { fr: "Accueil — illustration atelier", en: "Home — workshop illustration" },
    hint: {
      fr: "Photo de la section « Savoir-faire ».",
      en: "Photo in the “Craftsmanship” section.",
    },
  },
  ...PAGE_IMAGE_LABELS.map((page) => ({
    key: `image_hero_${page.key}`,
    label: { fr: `${page.fr} — image d'en-tête`, en: `${page.en} — header image` },
    hint: {
      fr: "Photo de fond de l'en-tête. Vide = fond bleu marine d'origine.",
      en: "Header background photo. Empty = original navy background.",
    },
  })),
];

export const siteSettingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<Record<string, string>> => {
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },
});

/** Liens visibles publiquement (RLS filtre déjà les liens désactivés pour les visiteurs). */
export const socialLinksQuery = queryOptions({
  queryKey: ["social_links"],
  queryFn: async (): Promise<SocialLink[]> => {
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const newsletterSubscribersQuery = queryOptions({
  queryKey: ["newsletter_subscribers"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const contactMessagesQuery = queryOptions({
  queryKey: ["contact_messages"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
