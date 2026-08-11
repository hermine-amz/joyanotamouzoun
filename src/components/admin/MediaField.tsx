import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia, useMediaUrl } from "@/lib/media";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";
const inputClass =
  "mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground outline-none transition-colors focus:border-accent";

/** Champ média : téléversement d'un fichier ou saisie d'une URL externe. */
export function MediaField({
  label,
  hint,
  accept,
  folder,
  value,
  onChange,
  preview = "none",
}: {
  label: string;
  hint?: string;
  accept: string;
  folder: string;
  value: string;
  onChange: (value: string) => void;
  preview?: "image" | "none";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = useMediaUrl(preview === "image" ? value : "");

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadMedia(file, folder));
      toast.success("Fichier téléversé");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Téléverser
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Retirer
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="… ou collez une adresse (https://…)"
        className={inputClass}
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {preview === "image" && url && (
        <img src={url} alt="" className="mt-3 h-32 w-full rounded-md object-cover" />
      )}
    </div>
  );
}

/** Galerie : plusieurs photos téléversées pour un même contenu. */
export function GalleryField({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const paths = await Promise.all(Array.from(files).map((file) => uploadMedia(file, folder)));
      onChange([...value, ...paths]);
      toast.success(`${paths.length} photo(s) ajoutée(s)`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className={labelClass}>Galerie photos (plusieurs images)</span>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Ajouter des photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {value.map((item) => (
            <GalleryThumb
              key={item}
              value={item}
              onRemove={() => onChange(value.filter((v) => v !== item))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryThumb({ value, onRemove }: { value: string; onRemove: () => void }) {
  const url = useMediaUrl(value);
  return (
    <div className="group relative overflow-hidden rounded-md border border-border">
      {url ? (
        <img src={url} alt="" className="h-24 w-full object-cover" />
      ) : (
        <div className="h-24 w-full bg-secondary" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Supprimer la photo"
        className="absolute right-1 top-1 rounded-md bg-background/90 p-1.5 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

/** Champ fichiers multiples : téléversement de plusieurs documents joint au contenu. */
export function MultiFileField({
  label,
  hint,
  accept,
  folder,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  accept: string;
  folder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  let fileUrls: string[] = [];
  try {
    if (value) {
      if (value.startsWith("[") && value.endsWith("]")) {
        fileUrls = JSON.parse(value);
      } else if (value.includes(",")) {
        fileUrls = value.split(",").map((v) => v.trim()).filter(Boolean);
      } else {
        fileUrls = [value];
      }
    }
  } catch (e) {
    fileUrls = [value].filter(Boolean);
  }

  fileUrls = fileUrls.filter(Boolean);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const paths = await Promise.all(
        Array.from(files).map((file) => uploadMedia(file, folder))
      );
      const newUrls = [...fileUrls, ...paths];
      onChange(JSON.stringify(newUrls));
      toast.success(`${paths.length} fichier(s) téléversé(s)`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = (urlToRemove: string) => {
    const newUrls = fileUrls.filter((url) => url !== urlToRemove);
    onChange(newUrls.length > 0 ? JSON.stringify(newUrls) : "");
  };

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Ajouter des fichiers
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {fileUrls.length > 0 && (
        <div className="mt-3 space-y-2">
          {fileUrls.map((url, idx) => {
            const fileName = url.split("/").pop() || `Fichier #${idx + 1}`;
            return (
              <div key={url} className="flex items-center justify-between gap-3 bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EAE6DF] text-xs">
                <span className="truncate font-medium text-slate-700 max-w-[280px]" title={fileName}>
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(url)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
