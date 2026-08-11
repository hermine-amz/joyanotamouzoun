import { Download, Play } from "lucide-react";
import { useLang } from "@/lib/lang";
import { embedUrl, useMediaUrl } from "@/lib/media";

/** Image issue du tableau de bord (stockage ou URL externe). */
export function MediaImage({
  value,
  alt,
  className,
}: {
  value?: string | null;
  alt: string;
  className?: string;
}) {
  const url = useMediaUrl(value);
  if (!url) return null;
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}

/** Galerie de photos ajoutées depuis le tableau de bord. */
export function MediaGallery({ items, alt }: { items?: string[] | null; alt: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <MediaImage
          key={item}
          value={item}
          alt={`${alt} — ${index + 1}`}
          className="aspect-4/3 w-full object-cover"
        />
      ))}
    </div>
  );
}

/** Lecteur vidéo : YouTube / Vimeo intégré, ou fichier vidéo hébergé. */
export function MediaVideo({ value, title }: { value?: string | null; title: string }) {
  const url = useMediaUrl(value);
  const { t } = useLang();
  if (!url) return null;
  const embed = embedUrl(url);

  return (
    <div className="mt-6">
      <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-accent">
        <Play className="size-3.5" />
        {t({ fr: "Vidéo", en: "Video" })}
      </p>
      {embed ? (
        <iframe
          src={embed}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full border border-border"
        />
      ) : (
        <video
          src={url}
          controls
          preload="metadata"
          className="aspect-video w-full border border-border bg-black"
        />
      )}
    </div>
  );
}

export function MediaDownload({ value, label }: { value?: string | null; label?: string | null }) {
  const { t } = useLang();
  if (!value) return null;

  let urls: string[] = [];
  try {
    if (value.startsWith("[") && value.endsWith("]")) {
      urls = JSON.parse(value);
    } else if (value.includes(",")) {
      urls = value.split(",").map((v) => v.trim()).filter(Boolean);
    } else {
      urls = [value];
    }
  } catch (e) {
    urls = [value];
  }

  // Filter out empty URLs
  urls = urls.filter(Boolean);

  if (urls.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {urls.map((urlVal, idx) => {
        const url = useMediaUrl(urlVal);
        if (!url) return null;

        const fileLabel =
          urls.length > 1
            ? `${label?.trim() || t({ fr: "Télécharger le fichier", en: "Download file" })} #${idx + 1}`
            : (label?.trim() || t({ fr: "Télécharger le fichier", en: "Download file" }));

        return (
          <a
            key={urlVal}
            href={url}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Download className="size-4" />
            {fileLabel}
          </a>
        );
      })}
    </div>
  );
}
