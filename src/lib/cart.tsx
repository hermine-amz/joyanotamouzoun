import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ja-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* panier illisible : on repart d'un panier vide */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * (i.price || 0), 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Montant formaté en FCFA. */
export function formatPrice(value: number) {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

/** Référence de commande lisible, basée sur la date du jour. */
export function orderReference(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `CMD-${stamp}-${suffix}`;
}

/**
 * Construit le message de commande envoyé sur WhatsApp : salutation nominative,
 * détail ligne par ligne (quantité, prix unitaire, sous-total) et récapitulatif.
 */
export function buildWhatsAppOrder(
  items: CartItem[],
  total: number,
  customer: { name: string; note: string },
  lang: "fr" | "en",
  reference = orderReference(),
) {
  const name = customer.name.trim();
  const note = customer.note.trim();
  const count = items.reduce((n, i) => n + i.qty, 0);
  const date = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const lines = items.map(
    (i, index) =>
      `${index + 1}. ${i.title}\n   ${i.qty} × ${formatPrice(i.price || 0)} = ${formatPrice(
        i.qty * (i.price || 0),
      )}`,
  );

  if (lang === "en") {
    return [
      `Hello Mr. Joyanot AMOUZOUN, this is ${name || "a customer from your website"}.`,
      "I would like to confirm the following order:",
      "",
      `🧾 Order reference: ${reference}`,
      `📅 Date: ${date}`,
      "",
      "🛒 Items ordered:",
      ...lines,
      "",
      `📦 Total items: ${count}`,
      `💰 Amount to pay: ${formatPrice(total)}`,
      "",
      "👤 Customer details:",
      `• Name: ${name || "(to be provided)"}`,
      note ? `• Message: ${note}` : "",
      "",
      "Please let me know the payment method (Mobile Money, transfer or cash) so I can complete the payment. Thank you.",
    ]
      .filter((line) => line !== "")
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  }

  return [
    `Bonjour M. Joyanot AMOUZOUN, je suis ${name || "un client de votre site"}.`,
    "Je souhaite confirmer la commande suivante :",
    "",
    `🧾 Référence : ${reference}`,
    `📅 Date : ${date}`,
    "",
    "🛒 Articles commandés :",
    ...lines,
    "",
    `📦 Nombre d'articles : ${count}`,
    `💰 Montant à payer : ${formatPrice(total)}`,
    "",
    "👤 Coordonnées :",
    `• Nom : ${name || "(à communiquer)"}`,
    note ? `• Message : ${note}` : "",
    "",
    "Merci de m'indiquer le moyen de paiement (Mobile Money, virement ou espèces) afin de finaliser la commande.",
  ]
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}
