import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang } from "@/lib/lang";
import { Section } from "@/components/Page";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Espace administrateur — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Connexion à l'espace d'administration du site de M. Joyanot AMOUZOUN pour gérer les contenus FR et EN.",
      },
      { property: "og:title", content: "Espace administrateur — Joyanot AMOUZOUN" },
      {
        property: "og:description",
        content: "Connexion sécurisée à la gestion des contenus bilingues.",
      },
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t({ fr: "Connexion réussie", en: "Successfully signed in" }));
        navigate({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;

        // If automatic login is enabled on the project (Confirm email is off)
        if (data?.session) {
          toast.success(t({ fr: "Inscription réussie !", en: "Sign up successful!" }));
          navigate({ to: "/admin" });
        } else {
          toast.success(
            t({
              fr: "Compte créé. Veuillez vérifier vos e-mails pour confirmer l'inscription.",
              en: "Account created. Please check your email to confirm registration.",
            })
          );
          setMode("signin");
        }
      }
    } catch (error) {
      console.error("Auth error details:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur";
      
      // Provide a helpful hint if they just changed the Supabase URL/Key but didn't restart the dev server
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network")) {
        toast.error(
          t({
            fr: "Erreur de connexion. Si vous venez de modifier le fichier .env, veuillez redémarrer votre serveur local (npm run dev).",
            en: "Connection error. If you just modified the .env file, please restart your local dev server (npm run dev).",
          }),
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(t({ fr: "Connexion Google impossible.", en: "Google sign-in failed." }));
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch (error) {
      toast.error(t({ fr: "Erreur d'authentification Google.", en: "Google authentication error." }));
    }
  };

  return (
    <Section className="flex min-h-[80vh] items-center justify-center surface-navy relative py-12 px-4 overflow-hidden">
      {/* Background soft glow */}
      <div className="pointer-events-none absolute -left-20 top-1/4 size-72 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 size-72 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-navy-deep/80 shadow-elevated p-8 md:p-10 backdrop-blur-md animate-soft-fade">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ivory/50 hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="size-3.5" />
          {t({ fr: "Retour à l'accueil", en: "Back to home" })}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="size-5 text-accent animate-pulse" />
          <span className="eyebrow text-accent">{t({ fr: "Espace sécurisé", en: "Secured area" })}</span>
        </div>
        
        <h1 className="text-3xl font-display text-ivory mt-2">
          {mode === "signin"
            ? t({ fr: "Connexion", en: "Sign in" })
            : t({ fr: "Créer un compte", en: "Create an account" })}
        </h1>
        
        <p className="mt-2 text-sm text-ivory/60">
          {t({
            fr: "Accès réservé à la gestion des contenus du site.",
            en: "Access reserved for site content management.",
          })}
        </p>

        {/* Form */}
        <form onSubmit={submit} className="mt-8 space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-ivory/70">
              {t({ fr: "Adresse email", en: "Email address" })}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ivory/45" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full rounded border border-white/10 bg-navy/60 pl-10 pr-4 py-3 text-sm text-ivory placeholder:text-ivory/30 outline-none transition-all focus:border-accent focus:bg-navy/80 focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-ivory/70">
              {t({ fr: "Mot de passe", en: "Password" })}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ivory/45" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-white/10 bg-navy/60 pl-10 pr-10 py-3 text-sm text-ivory placeholder:text-ivory/30 outline-none transition-all focus:border-accent focus:bg-navy/80 focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/45 hover:text-accent transition-colors"
                title={showPassword ? t({ fr: "Masquer", en: "Hide" }) : t({ fr: "Afficher", en: "Show" })}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-gold-soft text-accent-foreground font-semibold py-3.5 rounded transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 shadow-gold mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                {t({ fr: "Chargement...", en: "Loading..." })}
              </span>
            ) : mode === "signin" ? (
              t({ fr: "Se connecter", en: "Sign in" })
            ) : (
              t({ fr: "S'inscrire", en: "Sign up" })
            )}
          </button>
        </form>

        {/* OAuth Separator */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-xs text-ivory/40 uppercase tracking-widest">{t({ fr: "Ou", en: "Or" })}</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={google}
          className="w-full border border-white/20 hover:border-accent text-ivory hover:text-accent font-semibold py-3.5 rounded transition-all cursor-pointer flex items-center justify-center gap-2.5 bg-navy/20 hover:bg-navy/40"
        >
          {/* Simple Google SVG Icon */}
          <svg className="size-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          {t({ fr: "Continuer avec Google", en: "Continue with Google" })}
        </button>

        {/* Toggle Mode */}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-8 w-full text-xs uppercase tracking-widest text-ivory/50 hover:text-accent transition-colors"
        >
          {mode === "signin"
            ? t({ fr: "Pas encore de compte ?", en: "No account yet?" })
            : t({ fr: "J'ai déjà un compte", en: "I already have an account" })}
        </button>
      </div>
    </Section>
  );
}
