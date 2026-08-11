import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MEDIA_BUCKET, uploadMedia, useMediaUrl } from "@/lib/media";
import { allContentsQuery } from "@/lib/content";
import { useLang } from "@/lib/lang";

const FOLDERS = ["images", "videos", "fichiers", "divers"] as const;

type MediaItem = { path: string; name: string; folder: string; size: number };

/** Liste tous les fichiers du stockage, dossier par dossier. */
function mediaFilesQuery() {
  return {
    queryKey: ["media-library"],
    queryFn: async (): Promise<MediaItem[]> => {
      const results = await Promise.all(
        FOLDERS.map(async (folder) => {
          const { data, error } = await supabase.storage
            .from(MEDIA_BUCKET)
            .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
          if (error) throw error;
          return (data ?? [])
            .filter((f) => f.id)
            .map((f) => ({
              path: `${folder}/${f.name}`,
              name: f.name,
              folder,
              size: (f.metadata as { size?: number } | null)?.size ?? 0,
            }));
        }),
      );
      return results.flat();
    },
  };
}

const isImage = (path: string) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(path);

/** Médiathèque : voir, remplacer et supprimer les photos et fichiers du site. */
export function MediaLibrary() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const { data: files = [], isLoading, error } = useQuery(mediaFilesQuery());
  const { data: contents = [] } = useQuery(allContentsQuery);
  const [folder, setFolder] = useState<"all" | (typeof FOLDERS)[number]>("all");
  const [target, setTarget] = useState<"auto" | (typeof FOLDERS)[number]>("auto");
  const addRef = useRef<HTMLInputElement>(null);

  const [adding, setAdding] = useState(false);

  const usage = (path: string) =>
    contents.filter(
      (row) =>
        row.image_url === path ||
        row.video_url === path ||
        row.file_url === path ||
        (row.gallery ?? []).includes(path),
    );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["media-library"] });
    queryClient.invalidateQueries({ queryKey: ["media-url"] });
  };

  const remove = useMutation({
    mutationFn: async (path: string) => {
      const { error: err } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
      if (err) throw err;
    },
    onSuccess: () => {
      refresh();
      toast.success(t({ fr: "Fichier supprimé", en: "File deleted" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setAdding(true);
    try {
      await Promise.all(
        Array.from(list).map((file) =>
          uploadMedia(
            file,
            target === "auto" ? (isImage(file.name) ? "images" : "fichiers") : target,
          ),
        ),
      );
      refresh();
      toast.success(t({ fr: "Fichiers ajoutés", en: "Files added" }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdding(false);
      if (addRef.current) addRef.current.value = "";
    }
  };

  const visible = files.filter((f) => folder === "all" || f.folder === folder);

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t({ fr: "Médiathèque", en: "Media library" })}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t({
              fr: "Toutes les photos et fichiers affichés sur le site. Vous pouvez remplacer une image (le site se met à jour partout) ou la supprimer.",
              en: "Every photo and file shown on the site. Replace an image (updated everywhere) or delete it.",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as typeof target)}
            aria-label={t({ fr: "Dossier de destination", en: "Destination folder" })}
            className="rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="auto">{t({ fr: "Dossier automatique", en: "Automatic folder" })}</option>
            {FOLDERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            onClick={() => addRef.current?.click()}
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {t({ fr: "Ajouter", en: "Add" })}
          </button>
          <input
            ref={addRef}
            type="file"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
          <button
            onClick={refresh}
            aria-label={t({ fr: "Actualiser", en: "Refresh" })}
            className="rounded-md border border-primary/30 p-2.5 hover:border-accent hover:text-accent"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", ...FOLDERS] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFolder(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest ${
              folder === key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {key === "all" ? t({ fr: "Tout", en: "All" }) : key}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-5 text-sm text-muted-foreground">…</p>}
      {error && <p className="mt-5 text-sm text-destructive">{(error as Error).message}</p>}
      {!isLoading && visible.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">
          {t({ fr: "Aucun fichier pour le moment.", en: "No file yet." })}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <MediaCard
            key={item.path}
            item={item}
            usedBy={usage(item.path).map((r) => r.title_fr)}
            onDelete={() => remove.mutate(item.path)}
            onReplaced={refresh}
          />
        ))}
      </div>
    </section>
  );
}

function MediaCard({
  item,
  usedBy,
  onDelete,
  onReplaced,
}: {
  item: MediaItem;
  usedBy: string[];
  onDelete: () => void;
  onReplaced: () => void;
}) {
  const { t } = useLang();
  const url = useMediaUrl(item.path);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const replace = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(item.path, file, { upsert: true, cacheControl: "3600" });
      if (error) throw error;
      onReplaced();
      toast.success(t({ fr: "Fichier remplacé", en: "File replaced" }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {isImage(item.path) && url ? (
        <img src={url} alt={item.name} className="h-40 w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-secondary text-xs uppercase tracking-widest text-muted-foreground">
          {item.name.split(".").pop()}
        </div>
      )}
      <div className="space-y-2 p-3">
        <p className="truncate text-xs text-muted-foreground" title={item.path}>
          {item.path}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {usedBy.length > 0
            ? `${t({ fr: "Utilisé par", en: "Used by" })} : ${usedBy.join(", ")}`
            : t({ fr: "Non utilisé sur le site", en: "Not used on the site" })}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-primary/30 px-3 py-1.5 text-[11px] font-semibold hover:border-accent hover:text-accent"
            >
              {t({ fr: "Voir", en: "View" })}
            </a>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 px-3 py-1.5 text-[11px] font-semibold hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {t({ fr: "Changer", en: "Replace" })}
          </button>
          <input ref={inputRef} type="file" hidden onChange={(e) => replace(e.target.files?.[0])} />
          <button
            onClick={onDelete}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
            {t({ fr: "Supprimer", en: "Delete" })}
          </button>
        </div>
      </div>
    </div>
  );
}
