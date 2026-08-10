import { ExternalLink, Pencil, Plus } from "lucide-react";
import { useLang } from "@/lib/lang";
import { PAGE_KEYS } from "@/lib/content";
import type { ContentRow, PageKey } from "@/lib/content";

const PAGE_LABELS: Record<PageKey, { fr: string; en: string }> = {
  accueil: { fr: "Accueil", en: "Home" },
  "a-propos": { fr: "À propos", en: "About" },
  experiences: { fr: "Expériences", en: "Experience" },
  organisations: { fr: "Organisations", en: "Organisations" },
  livres: { fr: "Livres et publications", en: "Books" },
  formations: { fr: "Formations", en: "Training" },
  realisations: { fr: "Réalisations", en: "Achievements" },
  actualites: { fr: "Actualités", en: "News" },
  boutique: { fr: "Boutique", en: "Shop" },
  contact: { fr: "Contact", en: "Contact" },
};

/**
 * Vue « Pages du site » : pour chaque page, l'en-tête éditable
 * et les blocs de contenu ajoutés (slug « page/mon-bloc »).
 */
export function PagesPanel({
  rows,
  onEdit,
  onCreate,
}: {
  rows: ContentRow[];
  onEdit: (row: ContentRow) => void;
  onCreate: (slug: string) => void;
}) {
  const { t } = useLang();
  const pageRows = rows.filter((r) => r.type === "page");

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{t({ fr: "Pages du site", en: "Site pages" })}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t({
          fr: "Modifiez le titre et l'introduction de chaque page, ou ajoutez des blocs de contenu (texte, photos, vidéo, fichier).",
          en: "Edit each page title and intro, or add content blocks (text, photos, video, file).",
        })}
      </p>

      <div className="mt-6 space-y-4">
        {PAGE_KEYS.map((key) => {
          const hero = pageRows.find((r) => r.slug === key);
          const blocks = pageRows.filter((r) => r.slug.startsWith(`${key}/`));
          const nextBlockSlug = `${key}/bloc-${blocks.length + 1}-${Date.now().toString(36).slice(-4)}`;
          const href = key === "accueil" ? "/" : `/${key}`;
          return (
            <div key={key} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t(PAGE_LABELS[key])}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
                  >
                    {href}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                {hero ? (
                  <button
                    onClick={() => onEdit(hero)}
                    className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-xs font-semibold hover:border-accent hover:text-accent"
                  >
                    <Pencil className="size-3.5" />
                    {t({ fr: "Modifier l'en-tête", en: "Edit header" })}
                  </button>
                ) : (
                  <button
                    onClick={() => onCreate(key)}
                    className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-xs font-semibold hover:border-accent hover:text-accent"
                  >
                    <Plus className="size-3.5" />
                    {t({ fr: "Créer l'en-tête", en: "Create header" })}
                  </button>
                )}
                <button
                  onClick={() => onCreate(nextBlockSlug)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Plus className="size-3.5" />
                  {t({ fr: "Ajouter un bloc", en: "Add block" })}
                </button>
              </div>


              {blocks.length > 0 && (
                <ul className="mt-3 divide-y divide-border border-t border-border">
                  {blocks.map((block) => (
                    <li key={block.id}>
                      <button
                        onClick={() => onEdit(block)}
                        className="flex w-full items-center gap-3 py-2.5 text-left text-sm hover:text-accent"
                      >
                        <span className="min-w-0 flex-1 truncate">{block.title_fr}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                            block.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {block.published ? t({ fr: "Publié", en: "Published" }) : t({ fr: "Brouillon", en: "Draft" })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
