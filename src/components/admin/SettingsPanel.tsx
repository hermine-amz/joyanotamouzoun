import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/lang";
import {
  SETTING_KEYS,
  SOCIAL_PLATFORMS,
  newsletterSubscribersQuery,
  siteSettingsQuery,
  socialLinksQuery,
} from "@/lib/site";
import type { SocialLink } from "@/lib/site";
import { normalizeWhatsApp } from "@/lib/whatsapp";

const inputClass =
  "mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-accent";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";

/** Coordonnées du site (email, téléphone, WhatsApp, adresse) et texte de la newsletter. */
export function ContactSettings({ group = "contact" }: { group?: "contact" | "newsletter" }) {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(siteSettingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});
  const fields = SETTING_KEYS.filter((s) => s.group === group);

  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = fields.map((s) => ({ key: s.key, value: (values[s.key] ?? "").trim() }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success(t({ fr: "Modifications enregistrées", en: "Changes saved" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">
        {group === "contact"
          ? t({ fr: "Coordonnées du site", en: "Site details" })
          : t({ fr: "Présentation de la newsletter", en: "Newsletter introduction" })}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {group === "contact"
          ? t({
              fr: "Ces informations alimentent le pied de page, la page Contact, la carte et le bouton WhatsApp.",
              en: "These details feed the footer, the Contact page, the map and the WhatsApp button.",
            })
          : t({
              fr: "Texte affiché au-dessus du formulaire d'inscription, en français et en anglais.",
              en: "Text shown above the subscription form, in French and English.",
            })}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map((setting) => (
          <label
            key={setting.key}
            className={`${labelClass} ${"multiline" in setting && setting.multiline ? "sm:col-span-2" : ""}`}
          >
            {t(setting.label)}
            {"multiline" in setting && setting.multiline ? (
              <textarea
                rows={3}
                value={values[setting.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
                className={inputClass}
              />
            ) : (
              <input
                value={values[setting.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
                className={inputClass}
              />
            )}
            {setting.key === "whatsapp_number" ? (
              <span className="mt-2 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
                {t({
                  fr: "Utilisé pour le bouton flottant, la page Contact et la redirection du panier (paiement). Format international sans + ni espaces, ex. 22997699178.",
                  en: "Used for the floating button, the Contact page and the cart checkout redirect. International format without + or spaces, e.g. 22997699178.",
                })}
                {normalizeWhatsApp(values[setting.key]) ? (
                  <span className="mt-1 block text-accent">
                    {`https://wa.me/${normalizeWhatsApp(values[setting.key])}`}
                  </span>
                ) : null}
              </span>
            ) : null}
          </label>
        ))}
      </div>
      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        <Save className="size-4" />
        {t({ fr: "Enregistrer", en: "Save" })}
      </button>
    </section>
  );
}

/** Ajout, modification, activation et suppression des réseaux sociaux. */
export function SocialSettings() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const { data: links = [] } = useQuery(socialLinksQuery);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["social_links"] });

  const upsert = useMutation({
    mutationFn: async (link: Partial<SocialLink> & { id?: string }) => {
      const payload = {
        platform: link.platform ?? "site",
        label: link.label?.trim() || null,
        url: (link.url ?? "").trim(),
        sort_order: link.sort_order ?? 0,
        enabled: link.enabled ?? true,
      };
      const query = link.id
        ? supabase.from("social_links").update(payload).eq("id", link.id)
        : supabase.from("social_links").insert(payload);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success(t({ fr: "Réseau enregistré", en: "Link saved" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success(t({ fr: "Réseau supprimé", en: "Link deleted" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {t({ fr: "Réseaux sociaux", en: "Social networks" })}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t({
              fr: "Facebook, WhatsApp, TikTok… ajoutez, modifiez, désactivez ou supprimez chaque lien.",
              en: "Facebook, WhatsApp, TikTok… add, edit, disable or delete each link.",
            })}
          </p>
        </div>
        <button
          onClick={() =>
            upsert.mutate({
              platform: "facebook",
              url: "https://",
              sort_order: links.length + 1,
              enabled: true,
            })
          }
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" />
          {t({ fr: "Ajouter", en: "Add" })}
        </button>
      </div>

      <ul className="mt-5 space-y-4">
        {links.map((link) => (
          <SocialRow
            key={link.id}
            link={link}
            onSave={(value) => upsert.mutate(value)}
            onDelete={() => remove.mutate(link.id)}
          />
        ))}
        {links.length === 0 && (
          <li className="text-sm text-muted-foreground">
            {t({ fr: "Aucun réseau social pour le moment.", en: "No social network yet." })}
          </li>
        )}
      </ul>
    </section>
  );
}

function SocialRow({
  link,
  onSave,
  onDelete,
}: {
  link: SocialLink;
  onSave: (value: SocialLink) => void;
  onDelete: () => void;
}) {
  const { t } = useLang();
  const [draft, setDraft] = useState(link);
  useEffect(() => setDraft(link), [link]);

  return (
    <li className="rounded-md border border-border p-4">
      <div className="grid gap-4 md:grid-cols-[160px_1fr_140px_100px]">
        <label className={labelClass}>
          {t({ fr: "Plateforme", en: "Platform" })}
          <select
            value={draft.platform}
            onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
            className={inputClass}
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {t({ fr: "Lien", en: "Link" })}
          <input
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            placeholder="https://…"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t({ fr: "Libellé", en: "Label" })}
          <input
            value={draft.label ?? ""}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t({ fr: "Ordre", en: "Order" })}
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
            className="size-4"
          />
          {t({ fr: "Visible sur le site", en: "Visible on the site" })}
        </label>
        <button
          onClick={() => onSave(draft)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Save className="size-4" />
          {t({ fr: "Enregistrer", en: "Save" })}
        </button>
        <button
          onClick={onDelete}
          className="ml-auto inline-flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          {t({ fr: "Supprimer", en: "Delete" })}
        </button>
      </div>
    </li>
  );
}

/** Liste des inscrits à la newsletter, avec export CSV. */
export function NewsletterSubscribers() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const { data: subscribers = [] } = useQuery(newsletterSubscribersQuery);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter_subscribers"] });
      toast.success(t({ fr: "Abonné supprimé", en: "Subscriber removed" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = () => {
    const csv = [
      "email,nom,date",
      ...subscribers.map((s) => `${s.email},${s.name ?? ""},${s.created_at}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {t({ fr: "Abonnés à la newsletter", en: "Newsletter subscribers" })} (
            {subscribers.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t({
              fr: "Publiez un numéro téléchargeable depuis la catégorie « Newsletter » des contenus.",
              en: "Publish a downloadable issue from the “Newsletter” content category.",
            })}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="rounded-md border border-primary/30 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {t({ fr: "Exporter CSV", en: "Export CSV" })}
        </button>
      </div>
      <ul className="mt-5 divide-y divide-border">
        {subscribers.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
            <span className="min-w-0 flex-1 truncate">
              <span className="font-semibold">{s.email}</span>
              {s.name && <span className="text-muted-foreground"> · {s.name}</span>}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(s.created_at).toLocaleDateString("fr-FR")}
            </span>
            <button
              onClick={() => remove.mutate(s.id)}
              aria-label={t({ fr: "Supprimer", en: "Delete" })}
              className="text-destructive hover:opacity-70"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {subscribers.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">
            {t({ fr: "Aucun inscrit pour le moment.", en: "No subscriber yet." })}
          </li>
        )}
      </ul>
    </section>
  );
}
