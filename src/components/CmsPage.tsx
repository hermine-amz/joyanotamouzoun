import { useQuery } from "@tanstack/react-query";
import { PageHero, Section, SectionTitle } from "@/components/Page";
import { MediaDownload, MediaGallery, MediaImage, MediaVideo } from "@/components/Media";
import { useLang } from "@/lib/lang";
import { useMediaUrl } from "@/lib/media";
import { siteSettingsQuery } from "@/lib/site";
import { pageContentsQuery } from "@/lib/content";
import type { PageKey } from "@/lib/content";

/** Contenus « page » gérés depuis le tableau de bord pour une page donnée. */
function usePageContents(page: PageKey) {
  const { data = [] } = useQuery(pageContentsQuery(page));
  return {
    hero: data.find((row) => row.slug === page) ?? null,
    blocks: data.filter((row) => row.slug !== page),
  };
}

/**
 * En-tête de page : le titre et la description peuvent être remplacés
 * depuis le tableau de bord (contenu de type « page », slug = clé de la page).
 */
export function CmsPageHero({
  page,
  eyebrow,
  title,
  description,
}: {
  page: PageKey;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const { resolve } = useLang();
  const { hero } = usePageContents(page);
  const { data: settings } = useQuery(siteSettingsQuery);
  const image = useMediaUrl(settings?.[`image_hero_${page}`] ?? "");
  const cmsTitle = resolve(hero?.title_fr, hero?.title_en).value;
  const cmsDescription = resolve(hero?.excerpt_fr, hero?.excerpt_en).value;

  return (
    <PageHero
      eyebrow={eyebrow}
      title={cmsTitle || title}
      description={cmsDescription || description}
      image={image}
    />
  );
}

/** Blocs libres ajoutés à une page depuis le tableau de bord (slug « page/mon-bloc »). */
export function CmsBlocks({ page }: { page: PageKey }) {
  const { resolve } = useLang();
  const { blocks } = usePageContents(page);

  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => {
        const title = resolve(block.title_fr, block.title_en).value;
        const excerpt = resolve(block.excerpt_fr, block.excerpt_en).value;
        const body = resolve(block.body_fr, block.body_en).value;
        return (
          <Section key={block.id}>
            <SectionTitle title={title} />
            {excerpt && <p className="mt-6 max-w-3xl text-base text-muted-foreground">{excerpt}</p>}
            {body && (
              <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
                {body}
              </p>
            )}
            <MediaImage
              value={block.image_url}
              alt={title}
              className="mt-8 w-full max-w-4xl object-cover"
            />
            <MediaGallery items={block.gallery} alt={title} />
            <MediaVideo value={block.video_url} title={title} />
            <div>
              <MediaDownload value={block.file_url} label={block.file_label} />
            </div>
          </Section>
        );
      })}
    </>
  );
}
