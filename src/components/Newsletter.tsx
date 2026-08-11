import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Send, User } from "lucide-react";
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
    <section className="border-t border-white/10 surface-navy relative overflow-hidden">
      <div aria-hidden className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="mx-auto max-w-2xl px-5 py-20 relative z-10">
        <div className="flex flex-col md:items-center md:text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent mb-6">
            Newsletter
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-ivory">
            {t({ fr: "Restez informé", en: "Stay informed" })}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/70">{intro}</p>
        </div>

        <form onSubmit={submit} className="mx-auto mt-12 max-w-3xl">
          <div className="flex flex-col md:flex-row gap-2 bg-white/5 border border-white/10 p-2 md:rounded-full rounded-3xl backdrop-blur-md shadow-xl">
            
            <div className="flex-1 flex items-center px-4 relative group py-2 md:py-0">
              <User className="size-4.5 text-ivory/40 group-focus-within:text-accent transition-colors absolute left-4" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder={t({ fr: "Nom (optionnel)", en: "Name (optional)" })}
                className="w-full bg-transparent pl-8 pr-2 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none"
              />
            </div>
            
            <div className="hidden md:block w-px bg-white/10 my-2" />
            
            <div className="flex-[1.5] flex items-center px-4 relative group border-t border-white/10 md:border-t-0 py-3 md:py-0">
              <Mail className="size-4.5 text-ivory/40 group-focus-within:text-accent transition-colors absolute left-4" />
              <input
                required
                type="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t({ fr: "Votre adresse email", en: "Your email address" })}
                className="w-full bg-transparent pl-8 pr-2 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl md:rounded-full bg-accent px-8 py-4 md:py-0 text-sm font-bold text-accent-foreground disabled:opacity-60 transition-all hover:bg-accent/90 shrink-0 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] w-full md:w-auto"
            >
              {t({ fr: "S'inscrire", en: "Subscribe" })}
              <Send className="size-4" />
            </button>

          </div>
        </form>
      </div>
    </section>
  );
}
