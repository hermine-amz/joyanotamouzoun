import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/site";
import { useMediaUrl } from "@/lib/media";

/**
 * Image du site pilotée depuis le tableau de bord.
 * Si aucune image n'a été choisie, l'image d'origine reste affichée.
 */
export function SiteImage({
  settingKey,
  fallback,
  alt,
  className,
  width,
  height,
  loading,
}: {
  settingKey: string;
  fallback: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}) {
  const { data: settings } = useQuery(siteSettingsQuery);
  const value = settings?.[settingKey]?.trim() || "";
  const url = useMediaUrl(value);

  return (
    <img
      src={url || fallback}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
    />
  );
}
