import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Section, SectionTitle } from "@/components/Page";
import { useLang } from "@/lib/lang";
import { buildWhatsAppOrder, formatPrice, orderReference, useCart } from "@/lib/cart";
import { useWhatsAppNumber, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Votre panier d'articles : validez votre commande et finalisez le paiement directement sur WhatsApp.",
      },
      { property: "og:title", content: "Panier — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Validez votre commande et payez via WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/panier" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { t, lang } = useLang();
  const { items, total, setQty, remove, clear } = useCart();
  const number = useWhatsAppNumber();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState<{ open: boolean; reference: string }>({
    open: false,
    reference: "",
  });
  const [copied, setCopied] = useState(false);

  const checkout = () => {
    if (!number) return;
    const reference = orderReference();
    const text = buildWhatsAppOrder(items, total, { name, note }, lang, reference);
    window.open(whatsappLink(number, text), "_blank", "noopener");
    setConfirm({ open: true, reference });
    setCopied(false);
  };

  const closeConfirm = () => setConfirm({ open: false, reference: "" });

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(confirm.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback silencieux si le presse-papiers n'est pas accessible.
    }
  };

  return (
    <Section>
      <SectionTitle
        eyebrow={t({ fr: "Commande", en: "Order" })}
        title={t({ fr: "Votre panier", en: "Your cart" })}
      />

      {items.length === 0 ? (
        <div className="mt-10 border border-border bg-card p-10 text-center">
          <ShoppingBag className="mx-auto size-8 text-accent" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t({ fr: "Votre panier est vide pour le moment.", en: "Your cart is currently empty." })}
          </p>
          <Link
            to="/boutique"
            className="mt-6 inline-flex items-center rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
          >
            {t({ fr: "Découvrir la boutique", en: "Browse the shop" })}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-border border border-border bg-card">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.price || 0)}</p>
                </div>
                <div className="flex items-center border border-border">
                  <button
                    type="button"
                    aria-label={t({ fr: "Retirer un article", en: "Decrease quantity" })}
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-accent"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-9 text-center text-sm">{item.qty}</span>
                  <button
                    type="button"
                    aria-label={t({ fr: "Ajouter un article", en: "Increase quantity" })}
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-accent"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="w-28 text-right font-display text-lg text-accent">
                  {formatPrice(item.qty * (item.price || 0))}
                </p>
                <button
                  type="button"
                  aria-label={t({ fr: "Supprimer", en: "Remove" })}
                  onClick={() => remove(item.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border bg-card p-6">
            <div className="flex items-baseline justify-between border-b border-border pb-4">
              <span className="eyebrow text-muted-foreground">{t({ fr: "Total", en: "Total" })}</span>
              <span className="font-display text-2xl text-accent">{formatPrice(total)}</span>
            </div>

            <label className="mt-5 block text-xs uppercase tracking-widest text-muted-foreground">
              {t({ fr: "Votre nom", en: "Your name" })}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground"
              />
            </label>

            <label className="mt-4 block text-xs uppercase tracking-widest text-muted-foreground">
              {t({ fr: "Message (facultatif)", en: "Message (optional)" })}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground"
              />
            </label>

            <button
              type="button"
              onClick={checkout}
              disabled={!number}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t({ fr: "Payer via WhatsApp", en: "Pay via WhatsApp" })}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {!number
                ? t({
                    fr: "Le numéro WhatsApp de commande n'est pas encore configuré. Merci de réessayer plus tard.",
                    en: "The WhatsApp order number is not configured yet. Please try again later.",
                  })
                : t({
                fr: "Vous serez redirigé vers WhatsApp avec le détail de votre commande pour finaliser le paiement (Mobile Money, virement ou espèces).",
                en: "You will be redirected to WhatsApp with your order details to complete payment (Mobile Money, transfer or cash).",
                  })}
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-4 w-full text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive"
            >
              {t({ fr: "Vider le panier", en: "Clear cart" })}
            </button>
          </aside>
        </div>
      )}

      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 text-center shadow-gold">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Check className="size-6" />
            </div>
            <h2 className="font-display text-xl text-foreground">
              {t({ fr: "Commande envoyée", en: "Order sent" })}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t({
                fr: "Votre commande a été transmise sur WhatsApp. Conservez votre numéro de référence :",
                en: "Your order has been sent via WhatsApp. Please keep your reference number:",
              })}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 border border-border bg-background px-4 py-3">
              <span className="font-mono text-lg font-semibold tracking-wide text-accent">
                {confirm.reference}
              </span>
              <button
                type="button"
                onClick={copyReference}
                aria-label={t({ fr: "Copier la référence", en: "Copy reference" })}
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-xs text-accent">
                {t({ fr: "Référence copiée !", en: "Reference copied!" })}
              </p>
            )}
            <button
              type="button"
              onClick={closeConfirm}
              className="mt-6 inline-flex items-center rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
            >
              {t({ fr: "Fermer", en: "Close" })}
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
