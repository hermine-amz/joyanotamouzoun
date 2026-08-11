import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLang } from "@/lib/lang";
import { useWhatsAppNumber, whatsappLink } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const { t } = useLang();
  const number = useWhatsAppNumber();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("whatsapp_dismissed") === "true";
    setIsDismissed(dismissed);
  }, []);

  if (!number || isDismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 animate-soft-fade">
      <a
        href={whatsappLink(number)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-gold transition-all hover:scale-105"
      >
        <MessageCircle className="size-5" />
        <span>
          {t({ fr: "Écrire sur WhatsApp", en: "Chat on WhatsApp" })}
        </span>
      </a>
      <button
        onClick={() => {
          setIsDismissed(true);
          localStorage.setItem("whatsapp_dismissed", "true");
        }}
        aria-label={t({ fr: "Fermer", en: "Close" })}
        className="size-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer shrink-0"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
