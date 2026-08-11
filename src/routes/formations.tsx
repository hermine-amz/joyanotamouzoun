import { createFileRoute, Link } from "@tanstack/react-router";
import { CmsList } from "@/components/CmsList";
import { Section } from "@/components/Page";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formations — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Catalogue des formations : conception de machines, soudure, gestion d'entreprise artisanale et leadership.",
      },
      { property: "og:title", content: "Formations — Joyanot AMOUZOUN" },
      {
        property: "og:description",
        content: "Catalogue complet des formations professionnelles proposées.",
      },
      { property: "og:url", content: "/formations" },
    ],
    links: [{ rel: "canonical", href: "/formations" }],
  }),
  component: Trainings,
});

function Trainings() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero
        page="formations"
        eyebrow={t({ fr: "Formations", en: "Training" })}
        title={t({
          fr: "Un catalogue orienté métier et résultats",
          en: "A trade-focused, results-driven catalogue",
        })}
        description={t({
          fr: "Des programmes courts et opérationnels, animés par un praticien de l'ingénierie et de l'entrepreneuriat.",
          en: "Short, operational programmes led by a practitioner of engineering and entrepreneurship.",
        })}
      />

      <Section>
        <CmsList type="formation" />
        <Link
          to="/contact"
          className="inline-flex border border-primary/30 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {t({ fr: "Demander une session", en: "Request a session" })}
        </Link>
      </Section>
      <CmsBlocks page="formations" />
    </>
  );
}
