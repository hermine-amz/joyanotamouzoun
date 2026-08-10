import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/Page";
import { CmsList } from "@/components/CmsList";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/realisations")({
  head: () => ({
    meta: [
      { title: "Réalisations — Joyanot AMOUZOUN" },
      {
        name: "description",
        content: "Galerie des machines, équipements industriels et projets menés par M. Joyanot AMOUZOUN.",
      },
      { property: "og:title", content: "Réalisations — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Machines, équipements et projets industriels." },
      { property: "og:url", content: "/realisations" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/realisations" }],
  }),
  component: Projects,
});

function Projects() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero
        page="realisations"
        eyebrow={t({ fr: "Réalisations", en: "Projects" })}
        title={t({ fr: "Machines, équipements et projets industriels", en: "Machines, equipment and industrial projects" })}
        description={t({
          fr: "Une sélection de projets illustrant la maîtrise technique et l'ancrage local.",
          en: "A selection of projects illustrating technical mastery and local anchoring.",
        })}
      />

      <Section>
        <CmsList type="realisation" />
      </Section>
      <CmsBlocks page="realisations" />
    </>
  );
}
