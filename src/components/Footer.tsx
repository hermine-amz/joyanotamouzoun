import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "@/lib/lang";
import { person } from "@/content/site";
import { SocialLinks } from "@/components/SocialLinks";
import { siteSettingsQuery } from "@/lib/site";

export function Footer() {
  const { t } = useLang();
  const { data: settings = {} } = useQuery(siteSettingsQuery);
  const email = settings["contact_email"] || person.email;
  const phone = settings["contact_phone"] || person.phone;

  return (
    <footer className="surface-navy border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-ivory">{person.name}</p>
          <span className="gold-rule mt-4" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/70">{t(person.role)}</p>
          <SocialLinks className="mt-6" />
        </div>


        <div>
          <p className="eyebrow text-accent">{t({ fr: "Navigation", en: "Navigation" })}</p>
          <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-ivory/70">
            {[
              { to: "/a-propos", label: { fr: "À propos", en: "About" } },
              { to: "/experiences", label: { fr: "Expériences", en: "Experience" } },
              { to: "/organisations", label: { fr: "Organisations", en: "Organisations" } },
              { to: "/livres", label: { fr: "Livres", en: "Books" } },
              { to: "/formations", label: { fr: "Formations", en: "Training" } },
              { to: "/realisations", label: { fr: "Réalisations", en: "Projects" } },
              { to: "/actualites", label: { fr: "Actualités", en: "News" } },
              { to: "/boutique", label: { fr: "Boutique", en: "Shop" } },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-accent">
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-accent">Contact</p>
          <ul className="mt-5 space-y-3 text-sm text-ivory/70">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>{t(person.location)}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-accent">{phone}</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>
            </li>

          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} {person.name}. {t({ fr: "Tous droits réservés.", en: "All rights reserved." })}
      </div>
    </footer>
  );
}
