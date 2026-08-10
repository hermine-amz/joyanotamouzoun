import { Pencil, Plus } from "lucide-react";
import { useLang } from "@/lib/lang";
import { ContactSettings, NewsletterSubscribers } from "@/components/admin/SettingsPanel";
import type { ContentRow } from "@/lib/content";

/**
 * Espace « Newsletter » : texte de présentation, numéros téléchargeables
 * et liste des personnes inscrites.
 */
export function NewsletterPanel({
  rows,
  onEdit,
  onCreate,
}: {
  rows: ContentRow[];
  onEdit: (row: ContentRow) => void;
  onCreate: (slug: string) => void;
}) {
  const { t } = useLang();
  const issues = rows.filter((r) => r.type === "newsletter");

  return (
    <div className="space-y-6">
      <ContactSettings group="newsletter" />

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {t({ fr: "Numéros de la newsletter", en: "Newsletter issues" })}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t({
                fr: "Chaque numéro publié apparaît sur la page Actualités avec son bouton de téléchargement (PDF ou fichier joint).",
                en: "Each published issue appears on the News page with its download button (PDF or attached file).",
              })}
            </p>
          </div>
          <button
            onClick={() => onCreate(`numero-${issues.length + 1}-${Date.now().toString(36).slice(-4)}`)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            {t({ fr: "Nouveau numéro", en: "New issue" })}
          </button>
        </div>

        {issues.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            {t({ fr: "Aucun numéro pour le moment.", en: "No issue yet." })}
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-border border-t border-border">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  onClick={() => onEdit(issue)}
                  className="flex w-full items-center gap-3 py-3 text-left text-sm hover:text-accent"
                >
                  <span className="min-w-0 flex-1 truncate">{issue.title_fr}</span>
                  {!issue.file_url && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t({ fr: "Sans fichier", en: "No file" })}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                      issue.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {issue.published ? t({ fr: "Publié", en: "Published" }) : t({ fr: "Brouillon", en: "Draft" })}
                  </span>
                  <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <NewsletterSubscribers />
    </div>
  );
}
