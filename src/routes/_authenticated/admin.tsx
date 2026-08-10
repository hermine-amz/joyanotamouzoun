import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  KeyRound,
  Languages,
  Images,
  LayoutGrid,
  LayoutTemplate,

  LogOut,
  Mail,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GalleryField, MediaField } from "@/components/admin/MediaField";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { SiteImagesPanel } from "@/components/admin/SiteImagesPanel";
import { PagesPanel } from "@/components/admin/PagesPanel";
import { NewsletterPanel } from "@/components/admin/NewsletterPanel";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import { ContactSettings, SocialSettings } from "@/components/admin/SettingsPanel";
import { useLang } from "@/lib/lang";
import { CONTENT_TYPES, allContentsQuery, missingTranslations } from "@/lib/content";
import type { ContentRow, ContentType } from "@/lib/content";



export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — contenus FR / EN" },
      {
        name: "description",
        content:
          "Gestion séparée des contenus français et anglais du site de M. Joyanot AMOUZOUN, avec repli automatique.",
      },
      { property: "og:title", content: "Tableau de bord — contenus FR / EN" },
      { property: "og:description", content: "Édition bilingue des articles, livres, formations et produits." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Admin,
});

type Draft = {
  id?: string;
  type: ContentType;
  slug: string;
  title_fr: string;
  title_en: string;
  excerpt_fr: string;
  excerpt_en: string;
  body_fr: string;
  body_en: string;
  image_url: string;
  gallery: string[];
  video_url: string;
  file_url: string;
  file_label: string;
  price: string;
  published: boolean;
  sort_order: number;
};

const emptyDraft: Draft = {
  type: "article",
  slug: "",
  title_fr: "",
  title_en: "",
  excerpt_fr: "",
  excerpt_en: "",
  body_fr: "",
  body_en: "",
  image_url: "",
  gallery: [],
  video_url: "",
  file_url: "",
  file_label: "",
  price: "",
  published: false,
  sort_order: 0,
};

function toDraft(row: ContentRow): Draft {
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    title_fr: row.title_fr ?? "",
    title_en: row.title_en ?? "",
    excerpt_fr: row.excerpt_fr ?? "",
    excerpt_en: row.excerpt_en ?? "",
    body_fr: row.body_fr ?? "",
    body_en: row.body_en ?? "",
    image_url: row.image_url ?? "",
    gallery: row.gallery ?? [],
    video_url: row.video_url ?? "",
    file_url: row.file_url ?? "",
    file_label: row.file_label ?? "",
    price: row.price != null ? String(row.price) : "",
    published: row.published,
    sort_order: row.sort_order,
  };
}


const inputClass =
  "mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-accent";
const labelClass = "block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";

function Admin() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editorLang, setEditorLang] = useState<"fr" | "en">("fr");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [activeType, setActiveType] = useState<ContentType | "all">("all");
  const [panel, setPanel] = useState<"contents" | "pages" | "media" | "images" | "settings" | "subscribers" | "messages">("contents");


  const [search, setSearch] = useState("");
  const [email, setEmail] = useState<string>("");

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error(t({ fr: "Les mots de passe ne correspondent pas.", en: "Passwords do not match." }));
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t({ fr: "Mot de passe mis à jour.", en: "Password updated." }));
    setPwOpen(false);
    setNewPw("");
    setConfirmPw("");
  };

  useEffect(() => {
    supabase
      .from("user_roles")
      .select("role")
      .then(({ data }) => {
        setIsAdmin(!!data?.some((r) => r.role === "admin" || r.role === "editor"));
      });
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const { data: rows = [], isLoading, error } = useQuery(allContentsQuery);

  const counts = useMemo(() => {
    const map = new Map<ContentType, number>();
    rows.forEach((r) => map.set(r.type, (map.get(r.type) ?? 0) + 1));
    return map;
  }, [rows]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      published: rows.filter((r) => r.published).length,
      drafts: rows.filter((r) => !r.published).length,
      untranslated: rows.filter((r) => missingTranslations(r).length > 0).length,
    }),
    [rows],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => activeType === "all" || r.type === activeType)
      .filter(
        (r) =>
          !q ||
          r.title_fr.toLowerCase().includes(q) ||
          (r.title_en ?? "").toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q),
      );
  }, [rows, activeType, search]);

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const payload = {
        type: value.type,
        slug: value.slug.trim(),
        title_fr: value.title_fr.trim(),
        title_en: value.title_en.trim() || null,
        excerpt_fr: value.excerpt_fr.trim() || null,
        excerpt_en: value.excerpt_en.trim() || null,
        body_fr: value.body_fr.trim() || null,
        body_en: value.body_en.trim() || null,
        image_url: value.image_url.trim() || null,
        gallery: value.gallery,
        video_url: value.video_url.trim() || null,
        file_url: value.file_url.trim() || null,
        file_label: value.file_label.trim() || null,
        price: value.price.trim() ? Number(value.price) : null,
        published: value.published,
        published_at: value.published ? new Date().toISOString() : null,
        sort_order: value.sort_order,
      };
      const query = value.id
        ? supabase.from("contents").update(payload).eq("id", value.id)
        : supabase.from("contents").insert(payload);
      const { error: err } = await query;
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success(t({ fr: "Contenu enregistré", en: "Content saved" }));
      setDraft(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase.from("contents").delete().eq("id", id);
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success(t({ fr: "Contenu supprimé", en: "Content deleted" }));
      setDraft(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const field = (key: keyof Draft) => (draft?.[key] ?? "") as string;
  const update = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const suffix = editorLang === "fr" ? "_fr" : "_en";
  const titleKey = `title${suffix}` as keyof Draft;
  const excerptKey = `excerpt${suffix}` as keyof Draft;
  const bodyKey = `body${suffix}` as keyof Draft;

  const openNew = () => {
    setDraft({ ...emptyDraft, type: activeType === "all" ? "article" : activeType });
    setEditorLang("fr");
  };

  const statCards = [
    { label: { fr: "Contenus", en: "Items" }, value: stats.total },
    { label: { fr: "Publiés", en: "Published" }, value: stats.published },
    { label: { fr: "Brouillons", en: "Drafts" }, value: stats.drafts },
    { label: { fr: "EN à compléter", en: "EN to complete" }, value: stats.untranslated },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Barre supérieure */}
      <header className="surface-navy border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="eyebrow text-accent">{t({ fr: "Administration", en: "Administration" })}</p>
            <h1 className="mt-1 text-2xl text-ivory">
              {t({ fr: "Tableau de bord", en: "Dashboard" })}
            </h1>
            {email && <p className="mt-1 text-xs text-ivory/60">{email}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-xs font-semibold text-ivory/80 transition-colors hover:border-accent hover:text-accent"
            >
              <ExternalLink className="size-4" />
              {t({ fr: "Voir le site", en: "View site" })}
            </Link>
            <button
              onClick={() => setPwOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-xs font-semibold text-ivory/80 transition-colors hover:border-accent hover:text-accent"
            >
              <KeyRound className="size-4" />
              {t({ fr: "Mot de passe", en: "Password" })}
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-xs font-semibold text-ivory/80 transition-colors hover:border-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              {t({ fr: "Déconnexion", en: "Sign out" })}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {isAdmin === false && (
          <p className="mb-6 flex items-start gap-3 rounded-md border border-accent/40 bg-card p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
            {t({
              fr: "Votre compte n'a pas encore le rôle administrateur : la lecture et l'édition des contenus non publiés seront refusées.",
              en: "Your account does not have the admin role yet: reading and editing unpublished content will be denied.",
            })}
          </p>
        )}

        {/* Statistiques */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label.fr} className="rounded-lg border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t(card.label)}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Navigation latérale */}
          <aside className="rounded-lg border border-border bg-card p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t({ fr: "Catégories", en: "Categories" })}
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveType("all"); setPanel("contents"); }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  activeType === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutGrid className="size-4" />
                  {t({ fr: "Tout", en: "All" })}
                </span>
                <span className="text-xs opacity-70">{rows.length}</span>
              </button>
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => { setActiveType(type.value); setPanel("contents"); }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    activeType === type.value ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText className="size-4 shrink-0" />
                    {t(type.label)}
                  </span>
                  <span className="text-xs opacity-70">{counts.get(type.value) ?? 0}</span>
                </button>
              ))}
            </nav>
            <p className="px-2 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t({ fr: "Gestion", en: "Manage" })}
            </p>
            <nav className="space-y-1">
              {(
                [
                  { key: "pages" as const, icon: LayoutTemplate, label: { fr: "Pages du site", en: "Site pages" } },
                  { key: "media" as const, icon: Images, label: { fr: "Médiathèque", en: "Media library" } },
                  { key: "images" as const, icon: Images, label: { fr: "Images du site", en: "Site images" } },
                  { key: "settings" as const, icon: Share2, label: { fr: "Contact & réseaux", en: "Contact & social" } },
                  { key: "subscribers" as const, icon: Mail, label: { fr: "Newsletter", en: "Newsletter" } },
                  { key: "messages" as const, icon: Inbox, label: { fr: "Messages reçus", en: "Messages received" } },
                ]
              ).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPanel(panel === item.key ? "contents" : item.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    panel === item.key ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <item.icon className="size-4 shrink-0" />
                  {t(item.label)}
                </button>
              ))}
            </nav>
          </aside>

          {panel === "pages" ? (
            <PagesPanel
              rows={rows}
              onEdit={(row) => {
                setDraft(toDraft(row));
                setEditorLang("fr");
              }}
              onCreate={(slug) => {
                setDraft({ ...emptyDraft, type: "page", slug, published: true });
                setEditorLang("fr");
              }}
            />
          ) : panel === "media" ? (
            <MediaLibrary />
          ) : panel === "images" ? (
            <SiteImagesPanel />
          ) : panel === "settings" ? (
            <div className="space-y-6">
              <ContactSettings />
              <SocialSettings />
            </div>
          ) : panel === "subscribers" ? (
            <NewsletterPanel
              rows={rows}
              onEdit={(row) => {
                setDraft(toDraft(row));
                setEditorLang("fr");
              }}
              onCreate={(slug) => {
                setDraft({ ...emptyDraft, type: "newsletter", slug, published: true });
                setEditorLang("fr");
              }}
            />
          ) : panel === "messages" ? (
            <MessagesPanel />
          ) : (

          /* Liste */
          <section className="rounded-lg border border-border bg-card">

            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t({ fr: "Rechercher un contenu…", en: "Search content…" })}
                  className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="size-4" />
                {t({ fr: "Nouveau", en: "New" })}
              </button>
            </div>

            {isLoading && <p className="p-6 text-sm text-muted-foreground">…</p>}
            {error && <p className="p-6 text-sm text-destructive">{(error as Error).message}</p>}
            {!isLoading && visible.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">
                {t({ fr: "Aucun contenu dans cette catégorie.", en: "No content in this category." })}
              </p>
            )}

            <ul className="divide-y divide-border">
              {visible.map((row) => {
                const missing = missingTranslations(row);
                return (
                  <li key={row.id}>
                    <button
                      onClick={() => {
                        setDraft(toDraft(row));
                        setEditorLang("fr");
                      }}
                      className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{row.title_fr}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {t(CONTENT_TYPES.find((c) => c.value === row.type)?.label ?? { fr: row.type, en: row.type })}
                          {" · "}
                          {row.slug}
                        </span>
                      </span>
                      {missing.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-accent">
                          <Languages className="size-3" />
                          EN
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                          row.published
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {row.published ? t({ fr: "Publié", en: "Published" }) : t({ fr: "Brouillon", en: "Draft" })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
          )}
        </div>

      </main>

      {/* Panneau d'édition */}
      {draft && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-card shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
              <h2 className="text-lg font-semibold">
                {draft.id ? t({ fr: "Modifier le contenu", en: "Edit content" }) : t({ fr: "Nouveau contenu", en: "New content" })}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex overflow-hidden rounded-md border border-border">
                  {(["fr", "en"] as const).map((code) => (
                    <button
                      key={code}
                      onClick={() => setEditorLang(code)}
                      className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                        editorLang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <button onClick={() => setDraft(null)} aria-label={t({ fr: "Fermer", en: "Close" })}>
                  <X className="size-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              {editorLang === "en" && !draft.title_en.trim() && (
                <p className="flex items-start gap-2 rounded-md border border-accent/40 bg-secondary p-4 text-xs">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  {t({
                    fr: "Traduction anglaise absente : les visiteurs anglophones verront la version française.",
                    en: "English translation missing: English visitors will see the French version.",
                  })}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  {t({ fr: "Type", en: "Type" })}
                  <select
                    value={draft.type}
                    onChange={(e) => update({ type: e.target.value as ContentType })}
                    className={inputClass}
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(type.label)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  {t({ fr: "Identifiant (slug)", en: "Slug" })}
                  <input value={draft.slug} onChange={(e) => update({ slug: e.target.value })} className={inputClass} />
                </label>
              </div>

              <label className={labelClass}>
                {t({ fr: "Titre", en: "Title" })} ({editorLang.toUpperCase()})
                <input
                  value={field(titleKey)}
                  onChange={(e) => update({ [titleKey]: e.target.value } as Partial<Draft>)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                {t({ fr: "Résumé", en: "Excerpt" })} ({editorLang.toUpperCase()})
                <textarea
                  rows={3}
                  value={field(excerptKey)}
                  onChange={(e) => update({ [excerptKey]: e.target.value } as Partial<Draft>)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                {t({ fr: "Contenu", en: "Body" })} ({editorLang.toUpperCase()})
                <textarea
                  rows={10}
                  value={field(bodyKey)}
                  onChange={(e) => update({ [bodyKey]: e.target.value } as Partial<Draft>)}
                  className={inputClass}
                />
              </label>

              <div className="space-y-5 rounded-lg border border-border bg-secondary/40 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
                  {t({ fr: "Médias", en: "Media" })}
                </p>
                <MediaField
                  label={t({ fr: "Image principale", en: "Main image" })}
                  accept="image/*"
                  folder="images"
                  preview="image"
                  value={draft.image_url}
                  onChange={(v) => update({ image_url: v })}
                />
                <GalleryField
                  folder="images"
                  value={draft.gallery}
                  onChange={(v) => update({ gallery: v })}
                />
                <MediaField
                  label={t({ fr: "Vidéo", en: "Video" })}
                  hint={t({
                    fr: "Fichier MP4 téléversé, ou lien YouTube / Vimeo.",
                    en: "Uploaded MP4 file, or YouTube / Vimeo link.",
                  })}
                  accept="video/*"
                  folder="videos"
                  value={draft.video_url}
                  onChange={(v) => update({ video_url: v })}
                />
                <MediaField
                  label={t({ fr: "Fichier à télécharger", en: "Downloadable file" })}
                  hint={t({ fr: "PDF, Word, Excel, ZIP…", en: "PDF, Word, Excel, ZIP…" })}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.epub"
                  folder="fichiers"
                  value={draft.file_url}
                  onChange={(v) => update({ file_url: v })}
                />
                <label className={labelClass}>
                  {t({ fr: "Texte du bouton de téléchargement", en: "Download button label" })}
                  <input
                    value={draft.file_label}
                    onChange={(e) => update({ file_label: e.target.value })}
                    placeholder={t({ fr: "Télécharger le fichier", en: "Download file" })}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <label className={labelClass}>
                  {t({ fr: "Prix", en: "Price" })}
                  <input value={draft.price} onChange={(e) => update({ price: e.target.value })} className={inputClass} />
                </label>
                <label className={labelClass}>
                  {t({ fr: "Ordre", en: "Order" })}
                  <input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => update({ sort_order: Number(e.target.value) })}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => update({ published: e.target.checked })}
                  className="size-4"
                />
                {t({ fr: "Publier sur le site", en: "Publish on the site" })}
              </label>

              <p className="text-xs text-muted-foreground">
                {t({
                  fr: "Le titre français est obligatoire : il sert de repli lorsque l'anglais est absent.",
                  en: "The French title is required: it is the fallback when English is missing.",
                })}
              </p>
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-card px-6 py-4">
              <button
                onClick={() => save.mutate(draft)}
                disabled={save.isPending || !draft.slug.trim() || !draft.title_fr.trim()}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {t({ fr: "Enregistrer", en: "Save" })}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-md border border-primary/30 px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                {t({ fr: "Annuler", en: "Cancel" })}
              </button>
              {draft.id && (
                <button
                  onClick={() => remove.mutate(draft.id!)}
                  className="ml-auto inline-flex items-center gap-2 rounded-md border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  {t({ fr: "Supprimer", en: "Delete" })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mot de passe */}
      {pwOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4">
          <form onSubmit={changePassword} className="w-full max-w-md rounded-lg border border-border bg-card p-7">
            <h2 className="text-xl font-semibold">{t({ fr: "Changer mon mot de passe", en: "Change my password" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t({ fr: "8 caractères minimum.", en: "8 characters minimum." })}
            </p>
            <input
              type="password"
              required
              minLength={8}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder={t({ fr: "Nouveau mot de passe", en: "New password" })}
              className={inputClass}
            />
            <input
              type="password"
              required
              minLength={8}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder={t({ fr: "Confirmer le mot de passe", en: "Confirm password" })}
              className={inputClass}
            />
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={pwSaving}
                className="flex-1 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {t({ fr: "Enregistrer", en: "Save" })}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPwOpen(false);
                  setNewPw("");
                  setConfirmPw("");
                }}
                className="flex-1 rounded-md border border-primary/30 px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                {t({ fr: "Annuler", en: "Cancel" })}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
