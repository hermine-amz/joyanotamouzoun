import { createFileRoute } from "@tanstack/react-router";
import { Compass, Target } from "lucide-react";
import { Section, SectionTitle } from "@/components/Page";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";
import { biography, person } from "@/content/site";
import { CmsTimeline } from "@/components/CmsList";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Biographie, parcours professionnel, diplômes, distinctions, vision et mission de M. Joyanot AMOUZOUN.",
      },
      { property: "og:title", content: "À propos — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Biographie et parcours de M. Joyanot AMOUZOUN." },
      { property: "og:url", content: "/a-propos" },
    ],
    links: [{ rel: "canonical", href: "/a-propos" }],
  }),
  component: About,
});

function About() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero page="a-propos"
        eyebrow={t({ fr: "À propos", en: "About" })}
        title={t({ fr: "Un parcours d'ingénieur au service du collectif", en: "An engineer's path in service of the collective" })}
        description={t(person.intro)}
      />

      <Section>
        <SectionTitle eyebrow={t({ fr: "Biographie", en: "Biography" })} title={t({ fr: "Le parcours", en: "The journey" })} />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {biography.map((paragraph) => (
            <p key={paragraph.fr} className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {t(paragraph)}
            </p>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionTitle
          eyebrow={t({ fr: "Chronologie", en: "Timeline" })}
          title={t({ fr: "Responsabilités et étapes clés", en: "Responsibilities and milestones" })}
        />
        <CmsTimeline />
      </Section>

      <Section tone="navy">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="border border-white/10 p-8">
            <Compass className="size-7 text-accent" />
            <h2 className="mt-6 text-2xl text-ivory">{t({ fr: "Vision", en: "Vision" })}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              {t({
                fr: "Un Bénin où l'artisanat et la petite industrie sont reconnus comme des moteurs de croissance, portés par des professionnels qualifiés, organisés et compétitifs à l'échelle régionale.",
                en: "A Benin where craft trades and small industry are recognised as engines of growth, driven by qualified, organised professionals competitive at regional scale.",
              })}
            </p>
          </div>
          <div className="border border-white/10 p-8">
            <Target className="size-7 text-accent" />
            <h2 className="mt-6 text-2xl text-ivory">{t({ fr: "Mission", en: "Mission" })}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              {t({
                fr: "Former, équiper et représenter : donner aux artisans les outils techniques, les compétences de gestion et la voix institutionnelle nécessaires à leur développement.",
                en: "Train, equip and represent: giving artisans the technical tools, management skills and institutional voice they need to grow.",
              })}
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SectionTitle eyebrow={t({ fr: "Formation", en: "Education" })} title={t({ fr: "Diplômes", en: "Degrees" })} />
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              <li className="border-l-2 border-accent pl-4">
                {t({ fr: "Ingénierie mécanique — conception et fabrication", en: "Mechanical engineering — design and manufacturing" })}
              </li>
              <li className="border-l-2 border-accent pl-4">
                {t({ fr: "Maintenance industrielle et gestion de production", en: "Industrial maintenance and production management" })}
              </li>
              <li className="border-l-2 border-accent pl-4">
                {t({ fr: "Gestion d'organisations professionnelles", en: "Professional organisation management" })}
              </li>
            </ul>
          </div>
          <div>
            <SectionTitle eyebrow={t({ fr: "Reconnaissance", en: "Recognition" })} title={t({ fr: "Distinctions", en: "Distinctions" })} />
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              <li className="border-l-2 border-accent pl-4">
                {t({ fr: "Reconnaissance des corps de métiers artisanaux du Bénin", en: "Recognition from Benin's craft trade bodies" })}
              </li>
              <li className="border-l-2 border-accent pl-4">
                {t({ fr: "Distinctions pour services rendus à la communauté d'Agla", en: "Distinctions for services to the Agla community" })}
              </li>
              <li className="border-l-2 border-accent pl-4">
                {t({ fr: "Participation à des délégations et forums internationaux", en: "Participation in international delegations and forums" })}
              </li>
            </ul>
          </div>
        </div>
      </Section>
      <CmsBlocks page="a-propos" />
    </>
  );
}
