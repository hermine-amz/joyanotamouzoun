import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import { MediaDownload, MediaGallery, MediaImage, MediaVideo } from "@/components/Media";
import { publishedContentsQuery } from "@/lib/content";
import type { ContentType } from "@/lib/content";
import { useCart } from "@/lib/cart";

/** Bouton d'ajout au panier affiché sur les produits de la boutique. */
function AddToCart({ id, title, price }: { id: string; title: string; price: number }) {
  const { t } = useLang();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => {
          add({ id, title, price });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
      >
        {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
        {added
          ? t({ fr: "Ajouté au panier", en: "Added to cart" })
          : t({ fr: "Ajouter au panier", en: "Add to cart" })}
      </button>
      <Link to="/panier" className="text-xs uppercase tracking-widest text-accent hover:underline">
        {t({ fr: "Voir le panier", en: "View cart" })}
      </Link>
    </div>
  );
}

/**
 * Affiche les contenus publiés depuis le tableau de bord.
 * Chaque champ utilise le repli automatique FR <-> EN.
 */
export function CmsList({ type }: { type: ContentType }) {
  const { resolve, t } = useLang();
  const { data = [] } = useQuery(publishedContentsQuery(type));

  if (data.length === 0) return null;

  return (
    <div className="mb-12 grid gap-6 md:grid-cols-2">
      {data.map((item) => {
        const title = resolve(item.title_fr, item.title_en);
        const excerpt = resolve(item.excerpt_fr, item.excerpt_en);
        const body = resolve(item.body_fr, item.body_en);
        return (
          <article key={item.id} className="border border-border bg-card p-8">
            <MediaImage
              value={item.image_url}
              alt={title.value}
              className="mb-6 aspect-video w-full object-cover"
            />
            <div className="flex items-center gap-3">
              <h2 className="text-xl">{title.value}</h2>
              {title.isFallback && (
                <span className="border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
                  {t({ fr: "version FR", en: "FR version" })}
                </span>
              )}
            </div>
            {excerpt.value && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{excerpt.value}</p>
            )}
            {body.value && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{body.value}</p>
            )}
            <MediaGallery items={item.gallery} alt={title.value} />
            <MediaVideo value={item.video_url} title={title.value} />
            {item.price != null && <p className="mt-5 font-display text-2xl text-accent">{item.price} FCFA</p>}
            <div>
              <MediaDownload value={item.file_url} label={item.file_label} />
            </div>
            {type === "produit" && (
              <AddToCart id={item.id} title={title.value} price={Number(item.price ?? 0)} />
            )}
          </article>

        );
      })}
    </div>
  );
}

/** Chronologie du parcours, alimentée par les contenus « expérience » du tableau de bord. */
export function CmsTimeline() {
  const { resolve } = useLang();
  const { data = [] } = useQuery(publishedContentsQuery("experience"));

  if (data.length === 0) return null;

  return (
    <ol className="mt-12 border-l border-border">
      {data.map((item) => {
        const title = resolve(item.title_fr, item.title_en).value;
        const period = resolve(item.excerpt_fr, item.excerpt_en).value;
        const text = resolve(item.body_fr, item.body_en).value;
        return (
          <li key={item.id} className="relative pb-10 pl-8 last:pb-0">
            <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-accent" />
            {period && <p className="eyebrow text-muted-foreground">{period}</p>}
            <h3 className="mt-2 text-lg">{title}</h3>
            {text && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{text}</p>}
          </li>
        );
      })}
    </ol>
  );
}
