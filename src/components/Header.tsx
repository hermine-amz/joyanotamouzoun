import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Menu, ShoppingCart, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useLang } from "@/lib/lang";
import type { LocalizedText } from "@/lib/lang";
import { person } from "@/content/site";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQuery } from "@/lib/site";
import { useMediaUrl } from "@/lib/media";
import { useCart } from "@/lib/cart";

/** Accès au panier avec compteur d'articles. */
function CartLink({ onNavigate }: { onNavigate?: () => void }) {
  const { count } = useCart();
  return (
    <Link
      to="/panier"
      onClick={onNavigate}
      aria-label="Panier"
      className="relative flex size-10 items-center justify-center rounded-sm border border-white/15 text-ivory transition-colors hover:text-accent"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

/** Logo pilotable depuis le tableau de bord ; monogramme par défaut. */
function SiteLogo() {
  const { data: settings } = useQuery(siteSettingsQuery);
  const url = useMediaUrl(settings?.["image_logo"] ?? "");
  if (url) {
    return <img src={url} alt={person.name} className="size-10 rounded-sm object-contain" />;
  }
  return (
    <span className="flex size-10 items-center justify-center rounded-sm border border-accent/50 font-display text-lg text-accent">
      JA
    </span>
  );
}


const nav: { to: string; label: LocalizedText }[] = [
  { to: "/", label: { fr: "Accueil", en: "Home" } },
  { to: "/a-propos", label: { fr: "À propos", en: "About" } },
  { to: "/experiences", label: { fr: "Expériences", en: "Experience" } },
  { to: "/organisations", label: { fr: "Organisations", en: "Organisations" } },
  { to: "/livres", label: { fr: "Livres", en: "Books" } },
  { to: "/formations", label: { fr: "Formations", en: "Training" } },
  { to: "/realisations", label: { fr: "Réalisations", en: "Projects" } },
  { to: "/actualites", label: { fr: "Actualités", en: "News" } },
  { to: "/boutique", label: { fr: "Boutique", en: "Shop" } },
  { to: "/contact", label: { fr: "Contact", en: "Contact" } },
];

export function Header() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-deep/95 backdrop-blur supports-[backdrop-filter]:bg-navy-deep/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <SiteLogo />

          <span className="leading-tight">
            <span className="block font-display text-base text-ivory">{person.name}</span>
            <span className="eyebrow block text-accent/80">Bénin</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[13px] font-medium text-ivory/75 transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-sm border border-accent/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground xl:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              {t({ fr: "Tableau de bord", en: "Dashboard" })}
            </Link>
          )}
          <CartLink />
          <div className="flex items-center rounded-sm border border-white/15 p-0.5">
            {(["fr", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  lang === code ? "bg-accent text-accent-foreground" : "text-ivory/70 hover:text-accent"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex size-10 items-center justify-center rounded-sm border border-white/15 text-ivory xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-navy-deep px-5 pb-6 pt-2 xl:hidden">
          {session && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-b border-white/5 py-3 text-sm font-semibold text-accent"
            >
              <LayoutDashboard className="size-4" />
              {t({ fr: "Tableau de bord", en: "Dashboard" })}
            </Link>
          )}
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block border-b border-white/5 py-3 text-sm text-ivory/80"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
