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



      <NewsletterSubscribers />
    </div>
  );
}
