import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { CmsList } from "@/components/CmsList";
import { Section } from "@/components/Page";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";


export const Route = createFileRoute("/livres")({
  head: () => ({
    meta: [
      { title: "Livres et publications — Joyanot AMOUZOUN" },
      {
        name: "description",
        content: "Guides professionnels, ebooks et ouvrages de M. Joyanot AMOUZOUN, disponibles au téléchargement ou à l'achat.",
      },
      { property: "og:title", content: "Livres et publications — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Guides professionnels, ebooks et ouvrages." },
      { property: "og:url", content: "/livres" },
    ],
    links: [{ rel: "canonical", href: "/livres" }],
  }),
  component: Books,
});

function Books() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero page="livres"
        eyebrow={t({ fr: "Publications", en: "Publications" })}
        title={t({ fr: "Livres, guides et ressources professionnelles", en: "Books, guides and professional resources" })}
        description={t({
          fr: "Des ouvrages pratiques issus de l'expérience du terrain, pour les artisans, techniciens et dirigeants.",
          en: "Practical works drawn from field experience, for artisans, technicians and leaders.",
        })}
      />

      <Section>
        <CmsList type="livre" />
        <Link
          to="/boutique"
          className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          <Download className="size-4" />
          {t({ fr: "Obtenir un ouvrage", en: "Get a book" })}
        </Link>
      </Section>
      <CmsBlocks page="livres" />
    </>
  );
}
