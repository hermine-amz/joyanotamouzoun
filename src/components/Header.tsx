import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Menu, ShoppingCart, X, ChevronDown } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useLang } from "@/lib/lang";
import type { LocalizedText } from "@/lib/lang";
import { person } from "@/content/site";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQuery } from "@/lib/site";
import { useMediaUrl } from "@/lib/media";
import { useCart } from "@/lib/cart";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** Accès au panier avec compteur d'articles. */
function CartLink({ onNavigate }: { onNavigate?: () => void }) {
  const { count } = useCart();
  return (
    <Link
      to="/panier"
      onClick={onNavigate}
      aria-label="Panier"
      className="relative flex size-9 items-center justify-center rounded-full text-ivory/70 transition-all hover:bg-white/5 hover:text-ivory"
    >
      <ShoppingCart className="size-[18px]" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex size-[18px] items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-deep/95 backdrop-blur supports-[backdrop-filter]:bg-navy-deep/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="group flex items-center gap-3.5" onClick={() => setOpen(false)}>
          <SiteLogo />
          <span className="hidden sm:block font-display text-lg font-medium tracking-wide text-white transition-colors group-hover:text-accent">
            {person.name}
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-ivory/70 transition-all hover:bg-white/5 hover:text-ivory"
              activeProps={{ className: "text-ivory bg-white/10 font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {session && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 xl:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              {t({ fr: "Tableau de bord", en: "Dashboard" })}
            </Link>
          )}
          <CartLink />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ivory/70 transition-all hover:bg-white/5 hover:text-ivory focus:outline-none"
              >
                {lang === "fr" ? (
                  <>
                    <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="h-3 rounded-sm object-cover" />
                    FR
                  </>
                ) : (
                  <>
                    <img src="https://flagcdn.com/w20/us.png" alt="EN" className="h-3 rounded-sm object-cover" />
                    EN
                  </>
                )}
                <ChevronDown className="ml-1 size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="mt-1 w-[80px] rounded-xl border border-white/10 bg-navy-deep p-1 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => setLang("fr")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold uppercase tracking-widest text-ivory focus:bg-white/10"
              >
                <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="h-3 rounded-sm object-cover" />
                FR
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLang("en")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold uppercase tracking-widest text-ivory focus:bg-white/10"
              >
                <img src="https://flagcdn.com/w20/us.png" alt="US" className="h-3 rounded-sm object-cover" />
                EN
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
