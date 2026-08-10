import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/Page";
import { CmsList } from "@/components/CmsList";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";


export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Expériences — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Chef de quartier, ancien Président de la CNAB, Vice-Président de l'UNAEIB, consultant en ingénierie mécanique, entrepreneur et formateur.",
      },
      { property: "og:title", content: "Expériences — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Les responsabilités et fonctions exercées." },
      { property: "og:url", content: "/experiences" },
    ],
    links: [{ rel: "canonical", href: "/experiences" }],
  }),
  component: Experiences,
});

function Experiences() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero page="experiences"
        eyebrow={t({ fr: "Expériences", en: "Experience" })}
        title={t({ fr: "Des responsabilités au croisement du technique et du social", en: "Responsibilities at the crossroads of technical and social" })}
        description={t({
          fr: "Direction d'organisations professionnelles, administration de proximité, conseil en ingénierie et entrepreneuriat industriel.",
          en: "Leading professional organisations, local administration, engineering consultancy and industrial entrepreneurship.",
        })}
      />

      <Section>
        <CmsList type="experience" />
      </Section>
      <CmsBlocks page="experiences" />
    </>
  );
}
