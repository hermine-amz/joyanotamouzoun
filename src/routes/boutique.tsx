import { createFileRoute } from "@tanstack/react-router";

import { CmsList } from "@/components/CmsList";
import { Section, SectionTitle } from "@/components/Page";
import { CmsBlocks, CmsPageHero } from "@/components/CmsPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique — Joyanot AMOUZOUN" },
      {
        name: "description",
        content:
          "Ebooks, guides professionnels, formations en ligne et produits numériques de M. Joyanot AMOUZOUN.",
      },
      { property: "og:title", content: "Boutique — Joyanot AMOUZOUN" },
      { property: "og:description", content: "Ebooks, guides, formations et produits numériques." },
      { property: "og:url", content: "/boutique" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/boutique" }],
  }),
  component: Shop,
});

function Shop() {
  const { t } = useLang();

  return (
    <>
      <CmsPageHero
        page="boutique"
        eyebrow={t({ fr: "Boutique", en: "Shop" })}
        title={t({
          fr: "Ressources numériques et formations",
          en: "Digital resources and training",
        })}
        description={t({
          fr: "Ebooks, guides, plans techniques et formations en ligne, livrés immédiatement après paiement.",
          en: "Ebooks, guides, technical plans and online training, delivered immediately after payment.",
        })}
      />

      <Section>
        <CmsList type="produit" />
      </Section>

      <Section>
        <div className="max-w-3xl">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t({
              fr: "Ajoutez vos articles au panier, puis validez votre commande : vous serez redirigé vers WhatsApp pour convenir du mode de paiement et recevoir vos fichiers.",
              en: "Add your items to the cart, then confirm your order: you will be redirected to WhatsApp to arrange payment and receive your files.",
            })}
          </p>
        </div>
      </Section>
      <CmsBlocks page="boutique" />
    </>
  );
}
