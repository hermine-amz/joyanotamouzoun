import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "media";

/** Une valeur peut être une URL externe (https://…) ou un chemin dans le stockage. */
export function isExternalUrl(value?: string | null): boolean {
  return !!value && /^(https?:)?\/\//i.test(value.trim());
}

/** Téléverse un fichier dans le stockage et renvoie son chemin. */
export async function uploadMedia(file: File, folder = "divers"): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

/** Transforme un chemin de stockage en URL consultable (URL externe renvoyée telle quelle). */
export async function resolveMediaUrl(value: string): Promise<string> {
  const trimmed = value.trim();
  if (isExternalUrl(trimmed)) return trimmed;
  // Fichier servi directement par le site (dossier public/), ex. « /media/photo.jpg ».
  if (trimmed.startsWith("/")) return trimmed;
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(value.replace(/^\/+/, ""), 60 * 60 * 24 * 7);
  if (error) throw error;
  return data.signedUrl;
}

/** URL consultable pour l'affichage public. */
export function useMediaUrl(value?: string | null): string | null {
  const clean = value?.trim() || "";
  const { data } = useQuery({
    queryKey: ["media-url", clean],
    enabled: clean.length > 0,
    staleTime: 1000 * 60 * 60,
    queryFn: () => resolveMediaUrl(clean),
  });
  return clean ? (data ?? null) : null;
}

/** Identifiant d'une vidéo YouTube / Vimeo, pour l'affichage en lecteur intégré. */
export function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}
