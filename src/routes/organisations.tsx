import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/Page";
import { CmsList } from "@/components/CmsList";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/organisations")({
  head: () => ({
    meta: [
      { title: "Organisations — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "BEVULTA, CNAB, UNAEIB et autres structures dans lesquelles M. Joyanot AMOUZOUN est engagé.",
      },
      { property: "og:title", content: "Organisations — Joyanot AMOUZOUN" },
      { property: "og:description", content: "BEVULTA, CNAB, UNAEIB et autres structures." },
      { property: "og:url", content: "/organisations" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/organisations" }],
  }),
  component: Organisations,
});

function Organisations() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero
        page="organisations"
        eyebrow={t({ fr: "Organisations", en: "Organisations" })}
        title={t({
          fr: "Structures et engagements institutionnels",
          en: "Institutional bodies and commitments",
        })}
        description={t({
          fr: "Des organisations qui structurent l'artisanat, défendent les métiers et accompagnent les entreprises industrielles du Bénin.",
          en: "Organisations that structure the craft sector, defend trades and support Benin's industrial enterprises.",
        })}
      />

      <Section>
        <CmsList type="organisation" />
      </Section>
      <CmsBlocks page="organisations" />
    </>
  );
}
