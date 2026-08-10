import { MessageCircle } from "lucide-react";
import { useLang } from "@/lib/lang";
import { useWhatsAppNumber, whatsappLink } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const { t } = useLang();
  const number = useWhatsAppNumber();

  if (!number) return null;

  return (
    <a
      href={whatsappLink(number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-gold transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">{t({ fr: "Écrire sur WhatsApp", en: "Chat on WhatsApp" })}</span>
    </a>
  );
}
