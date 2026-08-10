import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Section } from "@/components/Page";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { SocialLinks } from "@/components/SocialLinks";
import { useLang } from "@/lib/lang";
import { siteSettingsQuery } from "@/lib/site";
import { person } from "@/content/site";
import { useWhatsAppNumber, whatsappLink } from "@/lib/whatsapp";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Joyanot AMOUZOUN" },
      {
        name: "description",
        content: "Contactez M. Joyanot AMOUZOUN : formulaire, WhatsApp, email, réseaux sociaux et localisation à Cotonou.",
      },
      { property: "og:title", content: "Contact — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Formulaire, WhatsApp, email et localisation." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { t, lang } = useLang();
  const { data: settings = {} } = useQuery(siteSettingsQuery);
  const email = settings["contact_email"] || person.email;
  const phone = settings["contact_phone"] || person.phone;
  const whatsapp = useWhatsAppNumber();
  const address =
    (lang === "en" ? settings["contact_address_en"] : settings["contact_address_fr"]) ||
    settings["contact_address_fr"] ||
    t(person.location);
  const mapsQuery = settings["contact_maps_query"] || "Agla, Cotonou, Bénin";
  const [sent, setSent] = useState(false);



  return (
    <>
      <CmsPageHero page="contact"
        eyebrow="Contact"
        title={t({ fr: "Écrivons le prochain projet ensemble", en: "Let's build the next project together" })}
        description={t({
          fr: "Conférences, partenariats, formations, expertise technique ou sollicitations de la communauté : votre message sera lu avec attention.",
          en: "Conferences, partnerships, training, technical expertise or community requests: your message will be read carefully.",
        })}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            className="border border-border bg-card p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              e.currentTarget.reset();
            }}
          >
            <h2 className="text-2xl">{t({ fr: "Formulaire de contact", en: "Contact form" })}</h2>
            <span className="gold-rule mt-4" />
            <div className="mt-7 space-y-4">
              <input
                required
                maxLength={100}
                placeholder={t({ fr: "Nom et prénom", en: "Full name" })}
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <input
                required
                type="email"
                maxLength={255}
                placeholder={t({ fr: "Adresse email", en: "Email address" })}
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <input
                maxLength={30}
                placeholder={t({ fr: "Téléphone (optionnel)", en: "Phone (optional)" })}
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <textarea
                required
                rows={5}
                maxLength={1000}
                placeholder={t({ fr: "Votre message", en: "Your message" })}
                className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="w-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {t({ fr: "Envoyer le message", en: "Send message" })}
              </button>
              {sent && (
                <p className="text-sm text-accent-foreground/80">
                  {t({
                    fr: "Merci, votre message a bien été pris en compte.",
                    en: "Thank you, your message has been received.",
                  })}
                </p>
              )}
            </div>
          </form>

          <div className="space-y-6">
            <div className="border border-border bg-card p-8">
              <h2 className="text-2xl">{t({ fr: "Coordonnées", en: "Details" })}</h2>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  {address}
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
              {whatsapp ? (
                <a
                  href={whatsappLink(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>

            <div className="surface-navy border border-border p-8">
              <p className="eyebrow text-accent">{t({ fr: "Réseaux sociaux", en: "Social networks" })}</p>
              <SocialLinks className="mt-4" />
            </div>


            <div className="overflow-hidden border border-border">
              <iframe
                title={`Google Maps — ${mapsQuery}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`}
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </Section>
      <CmsBlocks page="contact" />
    </>
  );
}
