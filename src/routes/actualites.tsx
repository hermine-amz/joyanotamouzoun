import { createFileRoute } from "@tanstack/react-router";
import { CmsList } from "@/components/CmsList";
import { Section } from "@/components/Page";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/actualites")({
  head: () => ({
    meta: [
      { title: "Actualités — Joyanot AMOUZOUN" },
      {
        name: "description",
        content: "Articles, prises de position et informations sur l'artisanat, l'industrie et la vie du quartier Agla.",
      },
      { property: "og:title", content: "Actualités — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Articles et actualités du secteur artisanal et industriel." },
      { property: "og:url", content: "/actualites" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/actualites" }],
  }),
  component: News,
});

function News() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero
        page="actualites"
        eyebrow={t({ fr: "Actualités", en: "News" })}
        title={t({ fr: "Articles, tribunes et informations", en: "Articles, opinion pieces and updates" })}
        description={t({
          fr: "Suivez les avancées du secteur artisanal, les projets industriels et les initiatives communautaires.",
          en: "Follow progress in the craft sector, industrial projects and community initiatives.",
        })}
      />

      <Section>
        <CmsList type="article" />
      </Section>
      <CmsBlocks page="actualites" />
    </>
  );
}
