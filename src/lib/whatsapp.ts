import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery, socialLinksQuery } from "@/lib/site";

/** Ne conserve que les chiffres d'un numéro ou d'un lien wa.me. */
export function normalizeWhatsApp(raw: string | null | undefined) {
  if (!raw) return "";
  const fromLink = raw.match(/wa\.me\/(\+?\d+)/i)?.[1] ?? raw;
  return fromLink.replace(/\D/g, "");
}

/**
 * Numéro WhatsApp utilisé par tout le site (bouton flottant, page Contact,
 * redirection du panier). Il est défini depuis le tableau de bord
 * (Contact & réseaux → Numéro WhatsApp) ; à défaut, le lien social WhatsApp
 * enregistré est utilisé. Aucune valeur n'est codée en dur.
 */
export function useWhatsAppNumber() {
  const { data: settings = {} } = useQuery(siteSettingsQuery);
  const { data: links = [] } = useQuery(socialLinksQuery);

  const fromSettings = normalizeWhatsApp(settings["whatsapp_number"]);
  if (fromSettings) return fromSettings;

  const social = links.find((l) => l.platform === "whatsapp" && l.enabled);
  return normalizeWhatsApp(social?.url);
}

/** Lien wa.me prêt à l'emploi, avec message pré-rempli optionnel. */
export function whatsappLink(number: string, text?: string) {
  if (!number) return "";
  return text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;
}
