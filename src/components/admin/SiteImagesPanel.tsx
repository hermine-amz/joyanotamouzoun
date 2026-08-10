import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/lang";
import { SITE_IMAGE_KEYS, siteSettingsQuery } from "@/lib/site";
import { MediaField } from "@/components/admin/MediaField";

/** Images fixes du site (accueil, illustrations) remplaçables depuis le tableau de bord. */
export function SiteImagesPanel() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(siteSettingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = SITE_IMAGE_KEYS.map((img) => ({
        key: img.key,
        value: (values[img.key] ?? "").trim(),
      }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success(t({ fr: "Images mises à jour", en: "Images updated" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{t({ fr: "Images du site", en: "Site images" })}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t({
          fr: "Remplacez les photos affichées sur les pages du site. Laissez un champ vide pour conserver l'image d'origine.",
          en: "Replace the photos displayed on the site pages. Leave a field empty to keep the original image.",
        })}
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {SITE_IMAGE_KEYS.map((img) => (
          <MediaField
            key={img.key}
            label={t(img.label)}
            hint={t(img.hint)}
            accept="image/*"
            folder="images"
            preview="image"
            value={values[img.key] ?? ""}
            onChange={(value) => setValues((v) => ({ ...v, [img.key]: value }))}
          />
        ))}
      </div>

      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        <Save className="size-4" />
        {t({ fr: "Enregistrer les images", en: "Save images" })}
      </button>
    </section>
  );
}
