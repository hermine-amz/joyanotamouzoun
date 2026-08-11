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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Contactez M. Joyanot AMOUZOUN : formulaire, WhatsApp, email, réseaux sociaux et localisation à Cotonou.",
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
  const contactEmail = settings["contact_email"] || person.email;
  const contactPhone = settings["contact_phone"] || person.phone;
  const whatsapp = useWhatsAppNumber();
  const address =
    (lang === "en" ? settings["contact_address_en"] : settings["contact_address_fr"]) ||
    settings["contact_address_fr"] ||
    t(person.location);
  const mapsQuery = settings["contact_maps_query"] || "Agla, Cotonou, Bénin";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cleanMessage = message.trim();
    const cleanPhone = phone.trim() || null;

    if (!cleanEmail || !cleanName || !cleanMessage) {
      toast.error(
        t({
          fr: "Veuillez remplir tous les champs obligatoires.",
          en: "Please fill in all required fields.",
        }),
      );
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
    });
    setSending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t({ fr: "Message envoyé avec succès !", en: "Message sent successfully!" }));
    setSent(true);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <>
      <CmsPageHero
        page="contact"
        eyebrow="Contact"
        title={t({
          fr: "Écrivons le prochain projet ensemble",
          en: "Let's build the next project together",
        })}
        description={t({
          fr: "Conférences, partenariats, formations, expertise technique ou sollicitations de la communauté : votre message sera lu avec attention.",
          en: "Conferences, partnerships, training, technical expertise or community requests: your message will be read carefully.",
        })}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#EAE6DF] p-8 lg:p-10" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-display text-slate-900">{t({ fr: "Formulaire de contact", en: "Contact form" })}</h2>
            <div className="mt-8 space-y-5">
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t({ fr: "Nom et prénom", en: "Full name" })}
                className="w-full bg-[#FAF7F2]/60 border border-[#EAE6DF] rounded-xl px-5 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent focus:bg-white transition-all"
              />
              <input
                required
                type="email"
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t({ fr: "Adresse email", en: "Email address" })}
                className="w-full bg-[#FAF7F2]/60 border border-[#EAE6DF] rounded-xl px-5 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent focus:bg-white transition-all"
              />
              <input
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t({ fr: "Téléphone (optionnel)", en: "Phone (optional)" })}
                className="w-full bg-[#FAF7F2]/60 border border-[#EAE6DF] rounded-xl px-5 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent focus:bg-white transition-all"
              />
              <textarea
                required
                rows={6}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t({ fr: "Votre message", en: "Your message" })}
                className="w-full bg-[#FAF7F2]/60 border border-[#EAE6DF] rounded-xl px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent focus:bg-white transition-all resize-y"
              />
              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-slate-900 rounded-xl px-10 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.01] shadow-sm disabled:opacity-60"
                >
                  {sending
                    ? t({ fr: "Envoi en cours...", en: "Sending..." })
                    : t({ fr: "Envoyer le message", en: "Send message" })}
                </button>
              </div>
              {sent && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-4 text-sm font-semibold animate-soft-fade text-center">
                  {t({
                    fr: "Merci, votre message a bien été pris en compte.",
                    en: "Thank you, your message has been received.",
                  })}
                </div>
              )}
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#EAE6DF] p-8 lg:p-10">
              <h2 className="text-2xl font-display text-slate-900">{t({ fr: "Coordonnées", en: "Details" })}</h2>
              <ul className="mt-8 space-y-5 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  {address}
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="hover:text-accent">
                    {contactPhone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-accent">
                    {contactEmail}
                  </a>
                </li>
              </ul>
              {whatsapp ? (
                <a
                  href={whatsappLink(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-sm hover:scale-[1.01] hover:bg-accent/90 transition-all"
                >
                  <MessageCircle className="size-4 shrink-0" />
                  WhatsApp
                </a>
              ) : null}
            </div>

            <div className="bg-slate-900 text-white rounded-2xl shadow-lg px-8 py-6 flex items-center justify-between">
              <p className="text-accent font-bold uppercase tracking-widest text-[10px] m-0">
                {t({ fr: "Réseaux sociaux", en: "Social networks" })}
              </p>
              <SocialLinks className="" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#EAE6DF] shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-white p-2">
              <iframe
                title={`Google Maps — ${mapsQuery}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`}
                className="h-72 w-full rounded-xl"
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
