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
    <section className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-widest">{t({ fr: "Pages du site", en: "Site pages" })}</h2>
        <p className="mt-1.5 text-xs text-slate-400 max-w-xl leading-relaxed">
          {t({
            fr: "Modifiez le titre et l'introduction de chaque page, ou ajoutez des blocs de contenu (texte, photos, vidéo, fichier).",
            en: "Edit each page title and intro, or add content blocks (text, photos, video, file).",
          })}
        </p>
      </div>

      <div className="space-y-6">
        {PAGE_KEYS.map((key) => {
          const hero = pageRows.find((r) => r.slug === key);
          const blocks = pageRows.filter((r) => r.slug.startsWith(`${key}/`));
          const nextBlockSlug = `${key}/bloc-${blocks.length + 1}-${Date.now().toString(36).slice(-4)}`;
          const href = key === "accueil" ? "/" : `/${key}`;
          return (
            <div key={key} className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs space-y-4">
              {/* Entête de la page */}
              <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-sans font-bold text-slate-800 text-sm flex flex-wrap items-center gap-2">
                    {t(PAGE_LABELS[key])}
                    <span className="text-[10px] font-bold bg-[#FAF7F2] text-slate-400 border border-[#EAE6DF] px-2 py-0.5 rounded-full">
                      {hero ? 1 : 0} {t({ fr: "intro", en: "intro" })} · {blocks.length} {t({ fr: "section(s)", en: "section(s)" })}
                    </span>
                  </h3>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-accent font-medium transition-colors"
                  >
                    {href === "/" ? t({ fr: "Page d'accueil (/) ", en: "Home page (/) " }) : href}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Section 1 : Introduction (En-tête de page) */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t({ fr: "1. Introduction / En-tête", en: "1. Introduction / Header" })}
                </h4>
                {hero ? (
                  <div 
                    onClick={() => onEdit(hero)}
                    className="group flex items-center justify-between rounded-xl border border-[#EAE6DF] bg-[#FAF7F2]/50 p-3 hover:border-accent/40 hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {hero.title_fr || t({ fr: "Titre d'introduction non renseigné", en: "Introduction title empty" })}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {hero.excerpt_fr || t({ fr: "Aucune introduction courte", en: "No short description" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                        hero.published
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200/20"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}>
                        {hero.published ? t({ fr: "Publié", en: "Published" }) : t({ fr: "Brouillon", en: "Draft" })}
                      </span>
                      <span className="size-7 rounded-lg border border-[#EAE6DF] group-hover:border-accent group-hover:text-accent bg-[#FFFDF9] flex items-center justify-center text-slate-400 transition-colors">
                        <Pencil className="size-3" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onCreate(key)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#EAE6DF] hover:border-accent hover:text-accent bg-[#FFFDF9] py-3 text-xs font-bold text-slate-400 hover:bg-accent/5 transition-all cursor-pointer"
                  >
                    <Plus className="size-4" />
                    {t({ fr: "Rédiger l'en-tête d'introduction", en: "Write page introduction" })}
                  </button>
                )}
              </div>

              {/* Section 2 : Sections de contenu */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t({ fr: "2. Sections de la page", en: "2. Page sections" })}
                </h4>
                
                {blocks.length > 0 ? (
                  <div className="space-y-2">
                    {blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        onClick={() => onEdit(block)}
                        className="group flex items-center justify-between rounded-xl border border-[#EAE6DF] bg-white p-3 hover:border-accent/40 hover:bg-[#FAF7F2]/20 transition-all cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            <span className="text-[10px] text-slate-300 font-bold mr-1.5 font-mono">
                              #{idx + 1}
                            </span>
                            {block.title_fr || t({ fr: "Section sans titre", en: "Untitled section" })}
                          </p>
                          {block.excerpt_fr && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 ml-5">
                              {block.excerpt_fr}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                            block.published
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/20"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {block.published ? t({ fr: "Publié", en: "Published" }) : t({ fr: "Brouillon", en: "Draft" })}
                          </span>
                          <span className="size-7 rounded-lg border border-[#EAE6DF] group-hover:border-accent group-hover:text-accent bg-[#FFFDF9] flex items-center justify-center text-slate-400 transition-colors">
                            <Pencil className="size-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic bg-[#FAF7F2]/30 p-3 rounded-xl border border-[#FAF7F2] text-center">
                    {t({ fr: "Aucune section de contenu ajoutée.", en: "No content sections added yet." })}
                  </p>
                )}

                {/* Bouton pour ajouter un bloc */}
                <button
                  onClick={() => onCreate(nextBlockSlug)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#EAE6DF] hover:border-accent hover:text-accent bg-[#FFFDF9] py-3 text-xs font-bold text-slate-400 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <Plus className="size-4" />
                  {t({ fr: "Ajouter une section (Texte, images, fichiers...)", en: "Add section (Text, images, files...)" })}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
