import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, ShoppingCart, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import { MediaDownload, MediaGallery, MediaImage, MediaVideo } from "@/components/Media";
import { publishedContentsQuery } from "@/lib/content";
import type { ContentType } from "@/lib/content";
import { useCart } from "@/lib/cart";
import { useWhatsAppNumber, whatsappLink } from "@/lib/whatsapp";
import { useMediaUrl } from "@/lib/media";

/** Bouton d'ajout au panier affiché sur les produits de la boutique. */
function AddToCart({ id, title, price }: { id: string; title: string; price: number }) {
  const { t } = useLang();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (

    <div className="mt-4 flex w-full flex-col">
      <button
        type="button"
        onClick={() => {
          add({ id, title, price });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        className="inline-flex items-center justify-center gap-2.5 w-full rounded-xl border-2 border-slate-900 bg-slate-900 hover:bg-white hover:text-slate-900 text-white px-5 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
      >
        {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
        {added
          ? t({ fr: "Ajouté au panier", en: "Added to cart" })
          : t({ fr: "Ajouter au panier", en: "Add to cart" })}
      </button>
    </div>
  );
}

/** Composant premium pour les actualités / articles avec expandeur de texte. */
function NewsCard({ item }: { item: any }) {
  const { resolve, t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const title = resolve(item.title_fr, item.title_en);
  const excerpt = resolve(item.excerpt_fr, item.excerpt_en);
  const body = resolve(item.body_fr, item.body_en);

  const dateStr = item.published_at
    ? new Date(item.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(item.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <article className="group border border-[#EAE6DF] bg-white rounded-2xl p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-accent/40 bg-card">
      <div>
        {/* Conteneur image principale avec zoom au survol */}
        {item.image_url && (
          <div className="mb-5 overflow-hidden rounded-xl aspect-video w-full border border-[#EAE6DF]">
            <MediaImage
              value={item.image_url}
              alt={title.value}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Date de publication & Badge de traduction */}
        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-accent shrink-0" />
            {dateStr}
          </span>
          {title.isFallback && (
            <span className="border border-accent/40 px-2 py-0.5 text-[8px] uppercase tracking-widest text-accent rounded-md shrink-0">
              {t({ fr: "version FR", en: "FR version" })}
            </span>
          )}
        </div>

        {/* Titre de l'actualité */}
        <h3 className="text-base font-sans font-bold text-slate-800 leading-snug group-hover:text-accent transition-colors">
          {title.value}
        </h3>

        {/* Résumé court */}
        {excerpt.value && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
            {excerpt.value}
          </p>
        )}

        {/* Corps de l'article déroulant */}
        {body.value && (
          <div
            className={`grid transition-all duration-350 ease-in-out ${
              expanded
                ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-[#EAE6DF]/60"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-650 font-medium">
                {body.value}
              </p>
              
              {/* Contenus additionnels à l'intérieur de la zone déroulante */}
              <div className="mt-4 space-y-4">
                <MediaGallery items={item.gallery} alt={title.value} />
                <MediaVideo value={item.video_url} title={title.value} />
                {item.file_url && (
                  <div className="pt-2">
                    <MediaDownload value={item.file_url} label={item.file_label} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton d'action toggle */}
      {body.value && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-slate-800 transition-colors w-fit cursor-pointer"
        >
          {expanded ? (
            <>
              {t({ fr: "Lire moins", en: "Read less" })}
              <ChevronUp className="size-3.5 text-accent shrink-0" />
            </>
          ) : (
            <>
              {t({ fr: "Lire la suite", en: "Read more" })}
              <ChevronDown className="size-3.5 text-accent shrink-0" />
            </>
          )}
        </button>
      )}
    </article>
  );
}

const cleanBodyText = (text: string) => {
  if (!text) return "";
  return text.replace(/<!--PACK_DATA_START-->[\s\S]*?<!--PACK_DATA_END-->/, "").trim();
};

const getPackBooks = (text: string): { title: string; desc: string; file_url: string }[] => {
  if (!text) return [];
  const match = text.match(/<!--PACK_DATA_START-->([\s\S]*?)<!--PACK_DATA_END-->/);
  if (match) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      return [];
    }
  }
  return [];
};

/** Résout une URL média de façon sûre via hook (hors boucle) */
function BookImage({ url, className }: { url: string; className?: string }) {
  const resolved = useMediaUrl(url);
  if (!resolved) return <div className={`bg-slate-100 animate-pulse ${className ?? ""}`} />;
  return <img src={resolved} alt="" className={className} />;
}

/** Mosaïque d'images de couverture d'un livre dans un pack */
function PackBookGallery({ gallery }: { gallery: string[] }) {
  if (!gallery?.length) return null;
  const imgs = gallery.slice(0, 3);
  return (
    <div className={`grid gap-1 shrink-0 ${imgs.length === 1 ? "w-20" : imgs.length === 2 ? "w-20 grid-cols-1" : "w-20 grid-cols-2"}`}>
      {imgs.map((img, i) => (
        <BookImage
          key={i}
          url={img}
          className={`rounded-lg border border-[#EAE6DF]/80 object-cover shadow-sm bg-slate-50 ${
            imgs.length === 1 ? "h-20 w-20" :
            imgs.length === 2 ? "h-9 w-20" :
            i === 0 ? "h-12 w-full col-span-2 row-span-1" : "h-9 w-full"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Mosaïque pleine largeur des couvertures du pack.
 * 1 livre → full width · 2 livres → 50/50 · 3+ → grande gauche + colonne droite
 */
function PackCoverMosaic({ packBooks }: { packBooks: any[] }) {
  const covers = packBooks.map((b) => b.gallery?.[0]).filter(Boolean) as string[];
  if (!covers.length) return null;

  const n = Math.min(covers.length, 4);

  if (n === 1) {
    return (
      <div className="w-full h-52 overflow-hidden">
        <BookImage url={covers[0]} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className="w-full h-52 flex gap-0.5">
        {covers.slice(0, 2).map((img, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            <BookImage url={img} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // 3 ou 4 : grande image à gauche + colonne droite
  const right = covers.slice(1, n);
  return (
    <div className="w-full h-52 flex gap-0.5">
      <div className="flex-[2] overflow-hidden">
        <BookImage url={covers[0]} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col gap-0.5">
        {right.map((img, i) => (
          <div key={i} className="flex-1 overflow-hidden relative">
            <BookImage url={img} className="w-full h-full object-cover" />
            {i === right.length - 1 && covers.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm">+{covers.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumCard({ item, type }: { item: any; type: ContentType }) {
  const { resolve, t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const whatsappNumber = useWhatsAppNumber();

  const title = resolve(item.title_fr, item.title_en);
  const excerpt = resolve(item.excerpt_fr, item.excerpt_en);
  const body = resolve(item.body_fr, item.body_en);
  const cleanedBody = cleanBodyText(body.value);
  const packBooks = getPackBooks(item.body_fr || "");
  const isPack = packBooks.length > 0;

  const hasDetails = cleanedBody.trim() !== "" || isPack || (item.gallery?.length > 0);

  const price = item.promo_price ?? item.price;
  const waMsg = t({
    fr: `Bonjour, je suis intéressé par « ${title.value} »${price ? ` (${price} FCFA${item.promo_price ? " — prix promotionnel" : ""})` : ""}.`,
    en: `Hello, I am interested in "${title.value}"${price ? ` (${price} FCFA${item.promo_price ? " — promo price" : ""})` : ""}.`,
  });

  const waCourseMsg = t({
    fr: `Bonjour, je souhaite m'inscrire à la formation « ${title.value} »${price ? ` (prix : ${item.promo_price ? item.promo_price + " FCFA (Promotion)" : item.price + " FCFA"})` : ""}.`,
    en: `Hello, I would like to register for the training course "${title.value}"${price ? ` (price: ${item.promo_price ? item.promo_price + " FCFA (Promo)" : item.price + " FCFA"})` : ""}.`,
  });

  return (
    <article className="group relative border border-[#EAE6DF] bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-accent/30 animate-soft-fade w-full max-w-sm">
      
      {/* Zone image pleine largeur */}
      <div className="relative">
        {isPack ? (
          <PackCoverMosaic packBooks={packBooks} />
        ) : item.image_url ? (
          <div className="overflow-hidden h-48 w-full">
            <MediaImage
              value={item.image_url}
              alt={title.value}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}

        {/* Badge Pack */}
        {isPack && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-accent/30 text-accent text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            📚 Pack · {packBooks.length} {t({ fr: "livres", en: "books" })}
          </span>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 p-5">
        <div>
          {/* Titre */}
          <h2 className="text-lg font-sans font-bold text-slate-900 leading-snug group-hover:text-accent transition-colors">
            {title.value}
          </h2>

          {/* Résumé */}
          {excerpt.value && (
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
              {excerpt.value}
            </p>
          )}

          {/* Bouton "Voir les livres du pack" */}
          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 cursor-pointer transition-all"
            >
              {expanded ? (
                <>
                  {t({ fr: "Réduire", en: "Collapse" })}
                  <ChevronUp className="size-3.5 shrink-0" />
                </>
              ) : (
                <>
                  {isPack
                    ? t({ fr: `Voir les ${packBooks.length} livres du pack`, en: `View the ${packBooks.length} books` })
                    : t({ fr: "Voir les détails", en: "View details" })}
                  <ChevronDown className="size-3.5 shrink-0" />
                </>
              )}
            </button>
          )}

          {/* Panneau déroulant élégant */}
          <div className={`grid transition-all duration-400 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              {/* Corps texte */}
              {cleanedBody && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 mb-5">
                  {cleanedBody}
                </p>
              )}

              {/* Liste des livres du pack — design élégant */}
              {isPack && (
                <div className="space-y-4 pt-4 border-t border-[#EAE6DF]/70">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {t({ fr: "Livres inclus dans ce pack", en: "Books included in this pack" })}
                  </p>
                  {packBooks.map((pb: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-start p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF]/60 hover:border-accent/25 transition-colors"
                    >
                      {/* Images du livre */}
                      <PackBookGallery gallery={pb.gallery} />

                      {/* Texte */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">
                          {t({ fr: "Livre", en: "Book" })} {idx + 1}
                        </p>
                        <h5 className="text-sm font-bold text-slate-900 leading-snug">
                          {pb.title}
                        </h5>
                        {pb.desc && (
                          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                            {pb.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Galerie globale du pack */}
              {item.gallery?.length > 0 && (
                <div className="mt-5">
                  <MediaGallery items={item.gallery} alt={title.value} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer : Prix + Bouton commande */}
        <div className="mt-auto pt-4 border-t border-[#EAE6DF]/60">
          {/* Prix */}
          {item.price != null && (
            <div className="flex items-baseline flex-wrap gap-2 mb-3">
              {item.promo_price != null ? (
                <>
                  <span className="font-display text-xl font-bold text-accent">{item.promo_price.toLocaleString()} FCFA</span>
                  <span className="text-xs text-slate-400 line-through">{item.price.toLocaleString()} FCFA</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    -{Math.round(((item.price - item.promo_price) / item.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="font-display text-xl font-bold text-accent">{item.price.toLocaleString()} FCFA</span>
              )}
            </div>
          )}

          {/* Fichier joint si existant (brochure formation, etc) */}
          {item.file_url && type !== "livre" && (
            <div className="mb-3">
              <MediaDownload value={item.file_url} label={item.file_label} />
            </div>
          )}

          {/* Bouton commande élégant */}
          {type === "livre" && whatsappNumber && (
            <a
              href={whatsappLink(whatsappNumber, waMsg)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full rounded-xl border-2 border-slate-900 bg-slate-900 hover:bg-white hover:text-slate-900 text-white px-5 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
            >
              {t({ fr: "Commander cet ouvrage", en: "Order this book" })}
            </a>
          )}

          {type === "formation" && whatsappNumber && (
            <a
              href={whatsappLink(whatsappNumber, waCourseMsg)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full rounded-xl border-2 border-slate-900 bg-slate-900 hover:bg-white hover:text-slate-900 text-white px-5 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.01]"
            >
              {t({ fr: "S'inscrire", en: "Register" })}
            </a>
          )}

          {type === "produit" && (
            <AddToCart id={item.id} title={title.value} price={Number(item.promo_price ?? item.price ?? 0)} />
          )}
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ item }: { item: any }) {
  const { resolve, t } = useLang();
  const title = resolve(item.title_fr, item.title_en);
  const excerpt = resolve(item.excerpt_fr, item.excerpt_en);

  return (
    <article className="group flex flex-col w-full max-w-sm animate-soft-fade">
      {item.image_url && (
        <div className="overflow-hidden w-full aspect-video mb-4 rounded-sm border border-[#EAE6DF]/40">
          <MediaImage
            value={item.image_url}
            alt={title.value}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-display text-slate-900 group-hover:text-accent transition-colors">
          {title.value}
        </h3>
        {title.isFallback && (
          <span className="border border-accent/40 px-2 py-0.5 text-[8px] uppercase tracking-widest text-accent rounded-sm shrink-0">
            {t({ fr: "version FR", en: "FR version" })}
          </span>
        )}
      </div>
      
      {excerpt.value && (
        <p className="mt-2.5 text-sm leading-relaxed text-slate-500 font-medium">
          {excerpt.value}
        </p>
      )}

      {/* Affichage des autres médias si l'admin en a ajouté */}
      {(item.gallery?.length > 0 || item.video_url) && (
        <div className="mt-4 space-y-4">
          <MediaGallery items={item.gallery} alt={title.value} />
          <MediaVideo value={item.video_url} title={title.value} />
        </div>
      )}
    </article>
  );
}

/**
 * Affiche les contenus publiés depuis le tableau de bord.
 * Chaque champ utilise le repli automatique FR <-> EN.
 */
export function CmsList({ type }: { type: ContentType }) {
  const { resolve, t } = useLang();
  const { data = [] } = useQuery(publishedContentsQuery(type));
  const whatsappNumber = useWhatsAppNumber();

  if (data.length === 0) return null;

  // Mise en page spéciale pour les actualités
  if (type === "article") {
    return (
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {data.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  // Mise en page minimaliste pour les réalisations (projets)
  if (type === "realisation") {
    return (
      <div className="mb-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [&>*]:w-full justify-items-center">
        {data.map((item) => (
          <ProjectCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  // Utilise PremiumCard pour livre, formation et produit
  return (
    <div className="mb-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [&>*]:max-w-sm [&>*]:w-full justify-items-center">
      {data.map((item) => (
        <PremiumCard key={item.id} item={item} type={type} />
      ))}
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
            {text && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{text}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
