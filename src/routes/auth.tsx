import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang } from "@/lib/lang";
import { Section } from "@/components/Page";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Espace administrateur — Joyanot AMOUZOUN" },
      {
        name: "description",
        content: "Connexion à l'espace d'administration du site de M. Joyanot AMOUZOUN pour gérer les contenus FR et EN.",
      },
      { property: "og:title", content: "Espace administrateur — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Connexion sécurisée à la gestion des contenus bilingues." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success(t({ fr: "Compte créé. Vérifiez votre email.", en: "Account created. Check your email." }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(t({ fr: "Connexion Google impossible.", en: "Google sign-in failed." }));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  };

  return (
    <Section>
      <div className="mx-auto w-full max-w-md border border-border bg-card p-8">
        <span className="eyebrow text-accent">{t({ fr: "Espace privé", en: "Private area" })}</span>
        <h1 className="mt-3 text-3xl">
          {mode === "signin"
            ? t({ fr: "Connexion", en: "Sign in" })
            : t({ fr: "Créer un compte", en: "Create an account" })}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t({
            fr: "Accès réservé à la gestion des contenus français et anglais.",
            en: "Reserved for managing French and English content.",
          })}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t({ fr: "Email", en: "Email" })}
            className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t({ fr: "Mot de passe", en: "Password" })}
            className="w-full border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {mode === "signin" ? t({ fr: "Se connecter", en: "Sign in" }) : t({ fr: "S'inscrire", en: "Sign up" })}
          </button>
        </form>

        <button
          onClick={google}
          className="mt-3 w-full border border-primary/30 px-5 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {t({ fr: "Continuer avec Google", en: "Continue with Google" })}
        </button>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          {mode === "signin"
            ? t({ fr: "Pas encore de compte ?", en: "No account yet?" })
            : t({ fr: "J'ai déjà un compte", en: "I already have an account" })}
        </button>
      </div>
    </Section>
  );
}
