import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/lang";
import { contactMessagesQuery } from "@/lib/site";

export function MessagesPanel() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading } = useQuery(contactMessagesQuery);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      toast.success(t({ fr: "Message supprimé", en: "Message deleted" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = () => {
    // Generate CSV contents with proper quotes escaping
    const headers = "nom,email,telephone,message,date\n";
    const rows = messages
      .map((m) => {
        const name = (m.name ?? "").replace(/"/g, '""');
        const email = (m.email ?? "").replace(/"/g, '""');
        const phone = (m.phone ?? "").replace(/"/g, '""');
        const message = (m.message ?? "").replace(/"/g, '""');
        return `"${name}","${email}","${phone}","${message}","${m.created_at}"`;
      })
      .join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "messages_contact.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {t({ fr: "Messages de contact", en: "Contact messages" })} ({messages.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t({
              fr: "Messages envoyés depuis le formulaire de contact du site.",
              en: "Messages sent from the website contact form.",
            })}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={messages.length === 0}
          className="rounded-md border border-primary/30 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {t({ fr: "Exporter CSV", en: "Export CSV" })}
        </button>
      </div>

      <ul className="mt-5 divide-y divide-border">
        {messages.map((m) => (
          <li key={m.id} className="py-4 text-sm space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-foreground">{m.name}</span>
                <span className="text-muted-foreground"> · </span>
                <a href={`mailto:${m.email}`} className="text-accent hover:underline">
                  {m.email}
                </a>
                {m.phone && (
                  <>
                    <span className="text-muted-foreground"> · </span>
                    <a
                      href={`tel:${m.phone}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {m.phone}
                    </a>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  onClick={() => remove.mutate(m.id)}
                  aria-label={t({ fr: "Supprimer", en: "Delete" })}
                  className="text-destructive hover:opacity-70"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-muted-foreground bg-secondary/30 p-3 rounded border border-border/50">
              {m.message}
            </p>
          </li>
        ))}
        {messages.length === 0 && !isLoading && (
          <li className="py-3 text-sm text-muted-foreground">
            {t({ fr: "Aucun message pour le moment.", en: "No messages yet." })}
          </li>
        )}
        {isLoading && (
          <li className="py-3 text-sm text-muted-foreground">
            {t({ fr: "Chargement...", en: "Loading..." })}
          </li>
        )}
      </ul>
    </section>
  );
}
