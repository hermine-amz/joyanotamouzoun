import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/lang";
import { siteSettingsQuery } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Inscription à la newsletter + téléchargement des numéros publiés. */
export function Newsletter() {
  const { t, lang } = useLang();
  const { data: settings = {} } = useQuery(siteSettingsQuery);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const intro =
    (lang === "en" ? settings["newsletter_intro_en"] : settings["newsletter_intro_fr"]) ||
    settings["newsletter_intro_fr"] ||
    t({
      fr: "Recevez les actualités, formations et publications par email.",
      en: "Receive news, training and publications by email.",
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value) || value.length > 254) {
      toast.error(t({ fr: "Adresse email invalide.", en: "Invalid email address." }));
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: value, name: name.trim().slice(0, 100) || null });
    setSaving(false);
    if (error) {
      toast.error(
        error.code === "23505"
          ? t({ fr: "Vous êtes déjà inscrit.", en: "You are already subscribed." })
          : error.message,
      );
      return;
    }
    toast.success(
      t({ fr: "Inscription confirmée. Merci !", en: "Subscription confirmed. Thank you!" }),
    );
    setEmail("");
    setName("");
  };

  return (
    <section className="border-t border-white/10 surface-navy">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <div className="flex flex-col md:items-center md:text-center">
          <p className="eyebrow text-accent">Newsletter</p>
          <h2 className="mt-3 font-display text-2xl text-ivory">
            {t({ fr: "Restez informé", en: "Stay informed" })}
          </h2>
          <span className="gold-rule mt-4 md:mx-auto" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/70">{intro}</p>
        </div>

        <form onSubmit={submit} className="mx-auto mt-8 max-w-md space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder={t({ fr: "Votre nom (optionnel)", en: "Your name (optional)" })}
            className="w-full rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-accent"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              required
              type="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t({ fr: "Votre adresse email", en: "Your email address" })}
              className="flex-1 rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              <Mail className="size-4" />
              {t({ fr: "Je m'inscris", en: "Subscribe" })}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
