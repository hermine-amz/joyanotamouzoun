import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, GraduationCap, Wrench } from "lucide-react";
import heroPortrait from "@/assets/hero-portrait.jpg";
import workshop from "@/assets/workshop.jpg";
import { CmsBlocks } from "@/components/CmsPage";
import { SiteImage } from "@/components/SiteImage";
import { Section, SectionTitle } from "@/components/Page";
import { useQuery } from "@tanstack/react-query";
import { pageContentsQuery, publishedContentsQuery } from "@/lib/content";
import { useLang } from "@/lib/lang";
import { person, pillars, stats } from "@/content/site";

/** Trois dernières actualités publiées depuis le tableau de bord. */
function LatestNews() {
  const { resolve } = useLang();
  const { data = [] } = useQuery(publishedContentsQuery("article"));
  if (data.length === 0) return null;

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {data.slice(0, 3).map((item) => (
        <Link
          to="/actualites"
          key={item.id}
          className="group rounded-2xl bg-white/5 border border-white/10 p-8 lg:p-10 shadow-lg transition-all duration-300 hover:bg-white/10 hover:border-accent/30 hover:-translate-y-1 flex flex-col text-left"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4 line-clamp-1">{resolve(item.excerpt_fr, item.excerpt_en).value}</p>
          <h3 className="text-xl font-display font-medium text-white group-hover:text-accent transition-colors">{resolve(item.title_fr, item.title_en).value}</h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 font-medium line-clamp-3">
            {resolve(item.body_fr, item.body_en).value}
          </p>
        </Link>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Joyanot AMOUZOUN — Ingénieur, leader de l'artisanat béninois" },
      {
        name: "description",
        content:
          "Site officiel de M. Joyanot AMOUZOUN, ingénieur mécanicien, ancien Président de la CNAB, Vice-Président de l'UNAEIB et Chef du quartier Agla Petit Château.",
      },
      { property: "og:title", content: "Joyanot AMOUZOUN — Site officiel" },
      {
        property: "og:description",
        content: "Parcours, organisations, publications, formations et réalisations.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { t, resolve } = useLang();
  const { data: pageRows = [] } = useQuery(pageContentsQuery("accueil"));
  const heroRow = pageRows.find((row) => row.slug === "accueil");
  const heroTagline = resolve(heroRow?.title_fr, heroRow?.title_en).value;
  const heroIntro = resolve(heroRow?.excerpt_fr, heroRow?.excerpt_en).value;

  return (
    <>
      <section className="surface-navy relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 size-96 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow animate-soft-fade text-accent">{t(person.role)}</p>
            <h1 className="animate-rise mt-5 text-4xl leading-[1.1] text-ivory md:text-6xl">
              {person.name}
            </h1>
            <p className="animate-rise mt-5 max-w-xl font-display text-xl text-accent/90 md:text-2xl">
              {heroTagline || t(person.tagline)}
            </p>
            <p className="animate-rise mt-6 max-w-xl text-sm leading-relaxed text-ivory/70 md:text-base">
              {heroIntro || t(person.intro)}
            </p>
            <div className="animate-rise mt-9 flex flex-wrap gap-3">
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                {t({ fr: "Découvrir le parcours", en: "Discover the journey" })}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-ivory/30 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-accent hover:text-accent"
              >
                {t({ fr: "Prendre contact", en: "Get in touch" })}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-[450px] lg:ml-auto">
            <div aria-hidden className="absolute -inset-3 lg:-inset-4 border border-accent/30 rounded-2xl" />
            <SiteImage
              settingKey="image_home_portrait"
              fallback={heroPortrait}
              alt={`Portrait officiel de ${person.name}`}
              width={1280}
              height={1600}
              className="relative aspect-[4/5] w-full object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.value} className="px-2 py-8 text-center md:py-10">
                <p className="font-display text-3xl text-accent md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-ivory/60">
                  {t(stat.label)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <SectionTitle
          eyebrow={t({ fr: "Trois engagements", en: "Three commitments" })}
          title={t({ fr: "Une vision, trois piliers", en: "One vision, three pillars" })}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <article
              key={pillar.title.fr}
              className="group bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#EAE6DF] p-8 lg:p-10 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
            >
              <span className="flex size-14 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                {i === 0 ? (
                  <Wrench className="size-6" />
                ) : i === 1 ? (
                  <Award className="size-6" />
                ) : (
                  <GraduationCap className="size-6" />
                )}
              </span>
              <h3 className="mt-8 text-xl font-display font-medium text-slate-900 group-hover:text-accent transition-colors">{t(pillar.title)}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 font-medium">{t(pillar.text)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid items-stretch gap-12 lg:grid-cols-2">
          <SiteImage
            settingKey="image_home_workshop"
            fallback={workshop}
            alt={t({
              fr: "Atelier de fabrication mécanique",
              en: "Mechanical fabrication workshop",
            })}
            width={1600}
            height={900}
            loading="lazy"
            className="w-full h-full object-cover rounded-2xl shadow-xl border border-[#EAE6DF]"
          />
          <div className="flex flex-col justify-center">
            <SectionTitle
              eyebrow={t({ fr: "Savoir-faire", en: "Craftsmanship" })}
              title={t({
                fr: "L'ingénierie au service de l'artisanat",
                en: "Engineering in service of craftsmanship",
              })}
            />
            <p className="mt-8 text-base leading-relaxed text-slate-600 font-medium md:text-lg">
              {t({
                fr: "Machines de transformation agroalimentaire, équipements sur mesure, audits techniques et accompagnement d'unités de production : chaque projet vise l'autonomie technologique des entreprises locales.",
                en: "Agri-food processing machines, bespoke equipment, technical audits and support for production units: every project aims at the technological autonomy of local businesses.",
              })}
            </p>
            <Link
              to="/realisations"
              className="mt-10 self-start inline-flex items-center gap-2.5 rounded-xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm group"
            >
              {t({ fr: "Voir les réalisations", en: "View the projects" })}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="navy">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            invert
            eyebrow={t({ fr: "Actualités", en: "News" })}
            title={t({ fr: "Dernières publications", en: "Latest publications" })}
          />
          <Link
            to="/actualites"
            className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-white transition-colors group"
          >
            {t({ fr: "Tout voir", en: "View all" })}
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <LatestNews />
      </Section>

      <section className="bg-background py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-3xl relative overflow-hidden flex flex-col items-center border border-[#EAE6DF] bg-gradient-to-br from-white to-[#FAF7F2] rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-6 py-10 text-center">
            <div aria-hidden className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-6">
              <BookOpen className="size-8 text-accent" />
            </div>
            <h2 className="max-w-2xl text-3xl md:text-4xl font-display font-medium text-slate-900 leading-tight">
              {t({
                fr: "Guides professionnels, formations et ressources",
                en: "Professional guides, training and resources",
              })}
            </h2>
            <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-600">
              {t({
                fr: "Des contenus conçus pour les artisans, techniciens et dirigeants d'organisations professionnelles.",
                en: "Content designed for artisans, technicians and leaders of professional organisations.",
              })}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 relative z-10">
              <Link
                to="/boutique"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm"
              >
                {t({ fr: "Visiter la boutique", en: "Visit the shop" })}
              </Link>
              <Link
                to="/formations"
                className="inline-flex items-center justify-center rounded-xl border border-[#EAE6DF] bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {t({ fr: "Voir les formations", en: "See the training" })}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CmsBlocks page="accueil" />
    </>
  );
}
