import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileText,
  KeyRound,
  Languages,
  Images,
  LayoutGrid,
  LayoutTemplate,
  LogOut,
  Mail,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
  Inbox,
  LayoutDashboard,
  ChevronRight,
  Eye,
  Pencil,
  Users,
  Calendar,
  Globe,
  Settings,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Menu,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GalleryField, MediaField, MultiFileField } from "@/components/admin/MediaField";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { SiteImagesPanel } from "@/components/admin/SiteImagesPanel";
import { PagesPanel } from "@/components/admin/PagesPanel";
import { NewsletterPanel } from "@/components/admin/NewsletterPanel";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import { ContactSettings, SocialSettings } from "@/components/admin/SettingsPanel";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useLang } from "@/lib/lang";
import { CONTENT_TYPES, allContentsQuery, missingTranslations } from "@/lib/content";
import type { ContentRow, ContentType } from "@/lib/content";
import { contactMessagesQuery, newsletterSubscribersQuery } from "@/lib/site";
import { useMediaUrl, uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — contenus FR / EN" },
      {
        name: "description",
        content:
          "Gestion séparée des contenus français et anglais du site de M. Joyanot AMOUZOUN, avec repli automatique.",
      },
      { property: "og:title", content: "Tableau de bord — contenus FR / EN" },
      {
        property: "og:description",
        content: "Édition bilingue des articles, livres, formations et produits.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Admin,
});

type Draft = {
  id?: string;
  type: ContentType;
  slug: string;
  title_fr: string;
  title_en: string;
  excerpt_fr: string;
  excerpt_en: string;
  duration_fr: string;
  duration_en: string;
  body_fr: string;
  body_en: string;
  image_url: string;
  gallery: string[];
  video_url: string;
  file_url: string;
  file_label: string;
  price: string;
  promo_price: string;
  published: boolean;
  sort_order: number;
};

const emptyDraft: Draft = {
  type: "article",
  slug: "",
  title_fr: "",
  title_en: "",
  excerpt_fr: "",
  excerpt_en: "",
  duration_fr: "",
  duration_en: "",
  body_fr: "",
  body_en: "",
  image_url: "",
  gallery: [],
  video_url: "",
  file_url: "",
  file_label: "",
  price: "",
  promo_price: "",
  published: false,
  sort_order: 0,
};

function toDraft(row: ContentRow): Draft {
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    title_fr: row.title_fr ?? "",
    title_en: row.title_en ?? "",
    excerpt_fr: (row.excerpt_fr ?? "").includes("===META===") ? (row.excerpt_fr ?? "").split("===META===")[1] : (row.excerpt_fr ?? ""),
    excerpt_en: (row.excerpt_en ?? "").includes("===META===") ? (row.excerpt_en ?? "").split("===META===")[1] : (row.excerpt_en ?? ""),
    duration_fr: (row.excerpt_fr ?? "").includes("===META===") ? (row.excerpt_fr ?? "").split("===META===")[0] : "",
    duration_en: (row.excerpt_en ?? "").includes("===META===") ? (row.excerpt_en ?? "").split("===META===")[0] : "",
    body_fr: row.body_fr ?? "",
    body_en: row.body_en ?? "",
    image_url: row.image_url ?? "",
    gallery: row.gallery ?? [],
    video_url: row.video_url ?? "",
    file_url: row.file_url ?? "",
    file_label: row.file_label ?? "",
    price: row.price != null ? String(row.price) : "",
    promo_price: row.promo_price != null ? String(row.promo_price) : "",
    published: row.published,
    sort_order: row.sort_order,
  };
}

// Background Automatic Translation using MyMemory API with timeout
async function translateText(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=fr|en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Translation failed");
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Translation API error:", error);
    return text; // fallback to original
  }
}

async function translateMarkdown(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  const paragraphs = text.split("\n");
  const translated: string[] = [];
  
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) {
      translated.push("");
      continue;
    }
    
    const isHeader = trimmed.startsWith("#");
    const isListItem = trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed);
    let cleanText = trimmed;
    let prefix = "";
    
    if (isHeader) {
      const match = trimmed.match(/^(#+)\s*(.*)$/);
      if (match) {
        prefix = match[1] + " ";
        cleanText = match[2];
      }
    } else if (isListItem) {
      const match = trimmed.match(/^([\-\*\+]\s*|\d+\.\s*)(.*)$/);
      if (match) {
        prefix = match[1];
        cleanText = match[2];
      }
    }
    
    const translatedPart = cleanText.length > 2 ? await translateText(cleanText) : cleanText;
    translated.push(prefix + translatedPart);
  }
  
  return translated.join("\n");
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

// Helper components to avoid Rules of Hooks violations inside mapping loops
function AdminImageThumbnail({ url, className }: { url: string; className?: string }) {
  const resolved = useMediaUrl(url);
  if (!resolved) return <div className={`bg-slate-100 animate-pulse ${className}`} />;
  return <img src={resolved} alt="" className={className} />;
}

function AdminBookDownloadLink({ fileUrl, children }: { fileUrl: string; children: React.ReactNode }) {
  const url = useMediaUrl(fileUrl);
  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noreferrer"
      download
      className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-colors"
    >
      {children}
    </a>
  );
}

function AdminBookFileLink({ fileUrl, filename }: { fileUrl: string; filename: string }) {
  const url = useMediaUrl(fileUrl);
  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noreferrer"
      download
      className="text-primary font-bold hover:underline truncate max-w-[200px]"
    >
      {filename}
    </a>
  );
}

function getPublicUrl(row: ContentRow) {
  switch (row.type) {
    case "article": return `/actualites`;
    case "formation": return `/formations`;
    case "livre":
    case "produit": return `/boutique`;
    case "realisation": return `/realisations`;
    case "page": return row.slug === "accueil" ? "/" : `/${row.slug}`;
    default: return `/${row.slug}`;
  }
}

const inputClass =
  "mt-2 w-full rounded-xl border border-[#EAE6DF] bg-[#FAF7F2] px-4 py-2.5 text-xs normal-case tracking-normal text-slate-700 outline-none transition-all focus:border-accent focus:bg-white focus:ring-1 focus:ring-accent";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-400";

function Admin() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [activeType, setActiveType] = useState<ContentType | "all">("all");
  const [panel, setPanel] = useState<
    "overview" | "contents" | "pages" | "media" | "images" | "settings" | "subscribers" | "messages"
  >("overview");

  const [contentsExpanded, setContentsExpanded] = useState(false);

  const [search, setSearch] = useState("");
  const [email, setEmail] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  type PackBook = { title: string; desc: string; file_url: string; gallery: string[] };

  const [currentStep, setCurrentStep] = useState(1);
  const previewImgUrl = useMediaUrl(draft?.image_url);
  const [isPack, setIsPack] = useState(false);
  const [packBooks, setPackBooks] = useState<PackBook[]>([]);

  // States for adding a new book to the pack
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookDesc, setNewBookDesc] = useState("");
  const [newBookFile, setNewBookFile] = useState("");
  const [newBookGallery, setNewBookGallery] = useState<string[]>([]);
  const [isUploadingBookFile, setIsUploadingBookFile] = useState(false);
  const [isUploadingBookImages, setIsUploadingBookImages] = useState(false);

  const handleUploadNewBookFile = async (file?: File) => {
    if (!file) return;
    setIsUploadingBookFile(true);
    try {
      const path = await uploadMedia(file, "fichiers");
      setNewBookFile(path);
      toast.success(t({ fr: "Fichier du livre téléversé", en: "Book file uploaded" }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsUploadingBookFile(false);
    }
  };

  const handleUploadNewBookImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploadingBookImages(true);
    try {
      const paths = await Promise.all(
        Array.from(files).map((file) => uploadMedia(file, "images"))
      );
      setNewBookGallery([...newBookGallery, ...paths]);
      toast.success(t({ fr: `${paths.length} photo(s) ajoutée(s)`, en: `${paths.length} photo(s) added` }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsUploadingBookImages(false);
    }
  };

  // Automatically reset step to 1 and parse pack info when a new draft is opened
  useEffect(() => {
    if (draft) {
      setCurrentStep(1);
      const body = draft.body_fr || "";
      const match = body.match(/<!--PACK_DATA_START-->([\s\S]*?)<!--PACK_DATA_END-->/);
      if (match) {
        setIsPack(true);
        try {
          const books = JSON.parse(match[1].trim());
          setPackBooks(books);
        } catch (e) {
          setPackBooks([]);
        }
      } else {
        setIsPack(false);
        setPackBooks([]);
      }
    } else {
      setIsPack(false);
      setPackBooks([]);
    }
  }, [draft?.id]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSave = (publishedStatus: boolean) => {
    if (!draft) return;
    
    // Process body text to add/remove pack info
    let cleanedBodyFr = draft.body_fr.replace(/<!--PACK_DATA_START-->[\s\S]*?<!--PACK_DATA_END-->/, "").trim();
    if (draft.type === "livre" && isPack && packBooks.length > 0) {
      const packJson = JSON.stringify(packBooks);
      const packBlock = `\n\n<!--PACK_DATA_START-->\n${packJson}\n<!--PACK_DATA_END-->`;
      cleanedBodyFr = `${cleanedBodyFr}${packBlock}`;
    }
    
    const finalDraft = {
      ...draft,
      body_fr: cleanedBodyFr,
      published: publishedStatus,
    };
    
    save.mutate(finalDraft);
  };

  const handleNavClick = (panelName: typeof panel, type: ContentType | "all" = "all") => {
    setPanel(panelName);
    setActiveType(type);
    if (isMobile) {
      setIsLeftSidebarOpen(false);
    }
  };

  const update = (val: Partial<Draft>) => {
    setDraft((d) => (d ? { ...d, ...val } : null));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error(
        t({ fr: "Les mots de passe ne correspondent pas.", en: "Passwords do not match." }),
      );
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t({ fr: "Mot de passe mis à jour.", en: "Password updated." }));
    setPwOpen(false);
    setNewPw("");
    setConfirmPw("");
  };

  useEffect(() => {
    supabase
      .from("user_roles")
      .select("role")
      .then(({ data }) => {
        setIsAdmin(!!data?.some((r) => r.role === "admin" || r.role === "editor"));
      });
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const { data: rows = [], isLoading, error } = useQuery(allContentsQuery);
  const { data: messages = [] } = useQuery(contactMessagesQuery);
  const { data: subscribers = [] } = useQuery(newsletterSubscribersQuery);

  const counts = useMemo(() => {
    const map = new Map<ContentType, number>();
    rows.forEach((r) => map.set(r.type, (map.get(r.type) ?? 0) + 1));
    return map;
  }, [rows]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      published: rows.filter((r) => r.published).length,
      drafts: rows.filter((r) => !r.published).length,
      untranslated: rows.filter((r) => missingTranslations(r).length > 0).length,
    }),
    [rows],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => activeType === "all" || r.type === activeType)
      .filter(
        (r) =>
          !q ||
          r.title_fr.toLowerCase().includes(q) ||
          (r.title_en ?? "").toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q),
      );
  }, [rows, activeType, search]);

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      // 1. Transparent automatic translation for English fields if they are empty
      let title_en = value.title_en.trim();
      let excerpt_en = value.excerpt_en.trim();
      let body_en = value.body_en.trim();
      let duration_en = value.duration_en?.trim() || "";

      const needsTitleTrans = !title_en && value.title_fr.trim();
      const needsExcerptTrans = !excerpt_en && value.excerpt_fr.trim();
      const needsDurationTrans = value.type === "formation" && !duration_en && value.duration_fr?.trim();
      const needsBodyTrans = !body_en && value.body_fr.trim();

      if (needsTitleTrans || needsExcerptTrans || needsBodyTrans || needsDurationTrans) {
        toast.info(t({ fr: "Traduction automatique en cours...", en: "Auto-translating to English..." }));
        
        try {
          if (needsTitleTrans) {
            title_en = await translateText(value.title_fr.trim());
          }
          if (needsExcerptTrans) {
            excerpt_en = await translateText(value.excerpt_fr.trim());
          }
          if (needsDurationTrans) {
            duration_en = await translateText(value.duration_fr.trim());
          }
          if (needsBodyTrans) {
            body_en = await translateMarkdown(value.body_fr.trim());
          }
        } catch (e) {
          console.error("Auto translation error, using French text as fallback:", e);
          if (needsTitleTrans) title_en = value.title_fr.trim();
          if (needsExcerptTrans) excerpt_en = value.excerpt_fr.trim();
          if (needsDurationTrans) duration_en = value.duration_fr.trim();
          if (needsBodyTrans) body_en = value.body_fr.trim();
        }
      }

      const generatedSlug = value.slug.trim() || slugify(value.title_fr.trim()) || `contenu-${Date.now()}`;

      const payload = {
        type: value.type,
        slug: generatedSlug,
        title_fr: value.title_fr.trim(),
        title_en: title_en || null,
        excerpt_fr: (value.type === "formation" && value.duration_fr?.trim()) 
          ? `${value.duration_fr.trim()}===META===${value.excerpt_fr.trim()}` 
          : (value.excerpt_fr.trim() || null),
        excerpt_en: (value.type === "formation" && duration_en) 
          ? `${duration_en}===META===${excerpt_en}` 
          : (excerpt_en || null),
        body_fr: value.body_fr.trim() || null,
        body_en: body_en || null,
        image_url: value.image_url.trim() || null,
        gallery: value.gallery,
        video_url: value.video_url.trim() || null,
        file_url: value.file_url.trim() || null,
        file_label: value.file_label.trim() || null,
        price: value.price.replace(/[^\d]/g, "") ? Number(value.price.replace(/[^\d]/g, "")) : null,
        promo_price: value.promo_price.replace(/[^\d]/g, "") ? Number(value.promo_price.replace(/[^\d]/g, "")) : null,
        published: value.published,
        published_at: value.published ? new Date().toISOString() : null,
        sort_order: value.sort_order,
      };

      const query = value.id
        ? supabase.from("contents").update(payload).eq("id", value.id)
        : supabase.from("contents").insert(payload);
      const { error: err } = await query;
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success(t({ fr: "Contenu enregistré", en: "Content saved" }));
      setDraft(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: err } = await supabase.from("contents").delete().eq("id", id);
      if (err) throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success(t({ fr: "Contenu supprimé", en: "Content deleted" }));
      setDraft(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const moveItem = useMutation({
    mutationFn: async ({ item, direction }: { item: ContentRow; direction: "up" | "down" }) => {
      const typeItems = rows
        .filter((r) => r.type === item.type)
        .sort((a, b) => a.sort_order - b.sort_order);

      const idx = typeItems.findIndex((r) => r.id === item.id);
      if (idx === -1) return;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= typeItems.length) return;

      const updates = typeItems.map((r, i) => {
        let newOrder = i * 10;
        if (i === idx) {
          newOrder = targetIdx * 10;
        } else if (i === targetIdx) {
          newOrder = idx * 10;
        }
        return {
          id: r.id,
          sort_order: newOrder,
        };
      });

      const promises = updates.map((u) =>
        supabase.from("contents").update({ sort_order: u.sort_order }).eq("id", u.id)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success(t({ fr: "Position mise à jour", en: "Position updated" }));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const openNew = () => {
    setDraft({ ...emptyDraft, type: activeType === "all" ? "article" : activeType });
  };

  // Recent activity stream (timeline style - messenger bubbled)
  const timelineEvents = useMemo(() => {
    const list: { id: string; type: "message" | "newsletter"; title: string; subtitle: string; date: string; meta?: string }[] = [];
    
    messages.slice(0, 4).forEach((m) => {
      list.push({
        id: m.id,
        type: "message",
        title: m.name,
        subtitle: m.email,
        meta: m.message,
        date: m.created_at,
      });
    });

    subscribers.slice(0, 4).forEach((s) => {
      list.push({
        id: s.id,
        type: "newsletter",
        title: s.email,
        subtitle: s.name ? `${t({ fr: "Nom : ", en: "Name: " })}${s.name}` : t({ fr: "Nouvel inscrit", en: "New Subscriber" }),
        date: s.created_at,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [messages, subscribers, t]);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Inject Demo Data function
  const injectDemoData = async () => {
    setLoadingDemo(true);
    try {
      // 1. Insert demo contents
      const demoContents = [
        {
          type: "article" as ContentType,
          slug: "presentation-joyanot-amouzoun",
          title_fr: "Présentation de M. Joyanot AMOUZOUN",
          title_en: "Presentation of Mr. Joyanot AMOUZOUN",
          excerpt_fr: "Découvrez le parcours, l'expertise et la vision entrepreneuriale de M. Joyanot AMOUZOUN.",
          excerpt_en: "Discover the career, expertise and entrepreneurial vision of Mr. Joyanot AMOUZOUN.",
          body_fr: "M. Joyanot AMOUZOUN est un entrepreneur et formateur béninois de référence, engagé pour le développement industriel et la promotion de l'artisanat local...",
          body_en: "Mr. Joyanot AMOUZOUN is a leading Beninese entrepreneur and trainer, committed to industrial development and the promotion of local craftsmanship...",
          published: true,
        },
        {
          type: "formation" as ContentType,
          slug: "dessin-industriel-cao",
          title_fr: "Formation en Dessin Industriel & CAO",
          title_en: "Industrial Design & CAD Training",
          excerpt_fr: "Apprenez à concevoir des plans et des modélisations 3D de précision pour vos projets mécaniques.",
          excerpt_en: "Learn to design plans and precision 3D models for your mechanical projects.",
          body_fr: "Cette session de formation intensive s'adresse aux dessinateurs et ingénieurs souhaitant maîtriser le dessin assisté par ordinateur (CAO/DAO).",
          body_en: "This intensive training session is aimed at designers and engineers wishing to master computer-aided design (CAD/CAM).",
          price: 45000,
          published: true,
        },
        {
          type: "livre" as ContentType,
          slug: "reussir-l-entrepreneuriat-local",
          title_fr: "Réussir l'Entrepreneuriat Local",
          title_en: "Succeeding in Local Entrepreneurship",
          excerpt_fr: "Un guide pratique et inspirant pour créer, structurer et développer une entreprise durable.",
          excerpt_en: "A practical and inspiring guide to creating, structuring and growing a sustainable business.",
          body_fr: "Dans cet ouvrage de référence, l'auteur partage des clés fondamentales et son expérience pour réussir à entreprendre localement.",
          body_en: "In this reference work, the author shares fundamental keys and his experience to succeed in undertaking locally.",
          price: 12000,
          published: true,
        }
      ];

      // Insert contents
      const { error: errC } = await supabase.from("contents").insert(demoContents);
      if (errC) throw errC;

      // 2. Insert demo messages
      const demoMessages = [
        {
          name: "Stéphane Tossou",
          email: "stephane.t@example.com",
          phone: "+229 90 12 34 56",
          message: "Bonjour, je serais intéressé par votre ouvrage 'Réussir l'Entrepreneuriat Local'. Est-il possible de le commander avec livraison à Cotonou ? Merci."
        },
        {
          name: "Fabiola Agbessi",
          email: "fabiola.a@example.com",
          phone: null,
          message: "Monsieur Amouzoun, j'aimerais avoir plus de détails sur le calendrier de la prochaine formation en dessin industriel. Merci pour votre retour."
        }
      ];

      const { error: errM } = await supabase.from("contact_messages").insert(demoMessages);
      if (errM) throw errM;

      // 3. Insert demo subscribers
      const demoSubs = [
        { email: "jean.dupont@example.com", name: "Jean Dupont" },
        { email: "marie.koffi@example.com", name: "Marie Koffi" }
      ];

      const { error: errS } = await supabase.from("newsletter_subscribers").insert(demoSubs);
      if (errS) throw errS;

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter_subscribers"] });

      toast.success(t({ fr: "Données de démonstration générées !", en: "Demo data generated successfully!" }));
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Erreur de génération");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#FAF7F2] flex font-sans text-slate-800 antialiased overflow-hidden relative">
      {/* Backdrop de gauche pour mobile */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* 1. Colonne Gauche - Sidebar Minimaliste (Style Coursue / Logip) */}
      <aside
        className={`bg-[#FFFDF9] flex flex-col justify-between shrink-0 h-full overflow-y-auto transition-all duration-300 z-40
          fixed inset-y-0 left-0 w-[240px] border-r border-[#EAE6DF]
          ${isLeftSidebarOpen ? "translate-x-0 p-6" : "-translate-x-full p-0 border-r-0"}
          lg:static lg:translate-x-0
          ${isLeftSidebarOpen ? "lg:w-[240px] lg:opacity-100 lg:p-6 lg:border-r" : "lg:w-0 lg:opacity-0 lg:p-0 lg:border-r-0 lg:overflow-hidden"}
        `}
      >
        <div className="space-y-8">
          {/* Logo Brand & Close button on mobile */}
          <div className="flex items-center justify-between gap-3 px-2">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent font-sans text-sm text-accent-foreground tracking-wider font-bold shadow-sm">
                JA
              </span>
              <div className="leading-tight">
                <span className="block font-semibold text-slate-800 text-sm tracking-wide">Joyanot</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Panel</span>
              </div>
            </Link>
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              aria-label="Fermer le menu"
              className="lg:hidden p-1.5 hover:bg-[#FAF7F2] rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Menus de navigation */}
          <div className="space-y-6">
            {/* Vue principale */}
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("overview")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  panel === "overview"
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                {t({ fr: "Tableau de bord", en: "Dashboard" })}
              </button>
            </div>

            {/* Contenus Collapsible */}
            <div className="space-y-1">
              <button
                onClick={() => setContentsExpanded(!contentsExpanded)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                  panel === "contents"
                    ? "bg-[#FAF7F2] text-slate-800"
                    : "text-slate-500 hover:bg-[#FAF7F2] hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutGrid className="size-4 shrink-0 opacity-70" />
                  {t({ fr: "Contenu", en: "Content" })}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {contentsExpanded ? "▲" : "▼"}
                </span>
              </button>

              {contentsExpanded && (
                <nav className="space-y-1 pl-4 border-l border-[#EAE6DF]/60 ml-5 mt-1 animate-soft-fade">
                  <button
                    onClick={() => handleNavClick("contents", "all")}
                    className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                      panel === "contents" && activeType === "all"
                        ? "bg-[#FAF7F2] text-slate-900 font-bold border-l-2 border-accent pl-2.5"
                        : "text-slate-500 hover:bg-[#FAF7F2]/50 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-left leading-tight pr-2 break-words">{t({ fr: "Tous les contenus", en: "All content" })}</span>
                    <span className="text-[10px] font-bold bg-[#FAF7F2] border border-[#EAE6DF] text-slate-500 px-1.5 py-0.5 rounded shrink-0 self-start mt-0.5">
                      {rows.length}
                    </span>
                  </button>
                  
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleNavClick("contents", type.value)}
                      className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        panel === "contents" && activeType === type.value
                          ? "bg-[#FAF7F2] text-slate-900 font-bold border-l-2 border-accent pl-2.5"
                          : "text-slate-500 hover:bg-[#FAF7F2]/50 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-left leading-tight pr-2 break-words">{t(type.label)}</span>
                      <span className="text-[10px] font-bold bg-[#FAF7F2] border border-[#EAE6DF] text-slate-500 px-1.5 py-0.5 rounded shrink-0 self-start mt-0.5">
                        {counts.get(type.value) ?? 0}
                      </span>
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* Config & Réglages */}
            <div className="space-y-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t({ fr: "Gestion", en: "Management" })}
              </p>
              <nav className="space-y-1">
                {[
                  { key: "pages" as const, icon: LayoutTemplate, label: { fr: "Pages du site", en: "Site pages" } },
                  { key: "media" as const, icon: Images, label: { fr: "Médiathèque", en: "Media library" } },
                  { key: "images" as const, icon: Images, label: { fr: "Images d'en-tête", en: "Header images" } },
                  { key: "settings" as const, icon: Share2, label: { fr: "Contact & réseaux", en: "Contact & social" } },
                  { key: "subscribers" as const, icon: Mail, label: { fr: "Newsletter", en: "Newsletter" } },
                  { key: "messages" as const, icon: Inbox, label: { fr: "Messages reçus", en: "Messages received" } },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key, "all")}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      panel === item.key
                        ? "bg-[#FAF7F2] text-slate-900 font-bold border-l-2 border-accent pl-3"
                        : "text-slate-500 hover:bg-[#FAF7F2] hover:text-slate-800"
                    }`}
                  >
                    <item.icon className="size-4 shrink-0 opacity-70" />
                    <span>{t(item.label)}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Pied de sidebar */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setPwOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="size-4" />
            {t({ fr: "Sécurité", en: "Security" })}
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            {t({ fr: "Déconnexion", en: "Logout" })}
          </button>
        </div>
      </aside>

      {/* 2. Colonne Centrale - Panneau Principal (Style Logip) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {isAdmin === false && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-800 font-medium">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-4.5 text-amber-600 shrink-0" />
              <span>
                ⚠️ {t({
                  fr: "Compte non-administrateur détecté (Mode lecture seule) : Les politiques de sécurité (RLS) de Supabase empêcheront le téléversement d'images et l'enregistrement des fiches. Veuillez configurer le rôle admin pour cet utilisateur.",
                  en: "Non-admin account detected (Read-only mode): Supabase security policies (RLS) will block image uploads and saving forms. Please assign the admin role to this user."
                })}
              </span>
            </div>
          </div>
        )}
        {/* Header de contenu */}
        <header className="bg-[#FFFDF9] border-b border-[#EAE6DF] px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              aria-label="Toggle menu"
              className="p-2 hover:bg-[#FAF7F2] rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Menu className="size-5" />
            </button>
            {/* Barre de recherche arrondie */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t({ fr: "Rechercher...", en: "Search..." })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FAF7F2] border-none rounded-full pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-accent focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-[#EAE6DF] rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:text-accent hover:border-accent/40 bg-[#FFFDF9] transition-colors"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">{t({ fr: "Visiter le site", en: "Visit site" })}</span>
            </Link>
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              aria-label="Activité récente"
              className="p-2 border border-[#EAE6DF] rounded-full text-slate-600 hover:text-accent hover:border-accent/40 bg-[#FFFDF9] transition-colors cursor-pointer relative flex items-center justify-center size-8 sm:size-9"
            >
              <Bell className="size-4" />
              {timelineEvents.length > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="flex-1 p-8">
          {panel === "overview" ? (
            // VUE TABLEAU DE BORD (OVERVIEW)
            <div className="space-y-8 animate-soft-fade">
              {/* Bannière d'accueil modernisée */}
              <div className="rounded-2xl surface-navy p-7 text-ivory relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px]">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-accent/15 to-transparent pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow text-accent">{t({ fr: "Espace Administration", en: "Administration Area" })}</span>
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <h2 className="text-xl font-sans font-bold text-accent mt-2">
                    {t({ fr: "Bonjour M. Joyanot AMOUZOUN", en: "Hello Mr. Joyanot AMOUZOUN" })}
                  </h2>
                  <p className="mt-1.5 text-xs text-ivory/70 max-w-xl leading-relaxed">
                    {t({
                      fr: "Bienvenue dans l'espace de gestion de votre site. Tous vos contenus sont rédigés en français et traduits automatiquement pour vos visiteurs.",
                      en: "Welcome to your site's management area. All your content is written in French and automatically translated for your visitors."
                    })}
                  </p>
                </div>
              </div>

              {/* Si la base est vide : bouton d'injection de démo */}
              {rows.length === 0 && !isLoading && (
                <div className="rounded-2xl border border-dashed border-[#EAE6DF] bg-[#FFFDF9] p-8 text-center shadow-xs space-y-4 text-slate-700">
                  <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                    <Inbox className="size-6" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-sm font-bold text-slate-800">
                      {t({ fr: "Votre base de données est vide", en: "Your database is empty" })}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t({
                        fr: "Puisque vous venez de lier un nouveau projet Supabase, aucune donnée n'est présente. Vous pouvez générer des données de test pour voir le dashboard s'animer.",
                        en: "Since you have just linked a new Supabase project, no data is present. You can generate test data to see the dashboard come to life."
                      })}
                    </p>
                  </div>
                  <button
                    onClick={injectDemoData}
                    disabled={loadingDemo}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingDemo ? (
                      <>
                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t({ fr: "Génération...", en: "Generating..." })}
                      </>
                    ) : (
                      t({ fr: "Générer des données de démonstration", en: "Generate demo data" })
                    )}
                  </button>
                </div>
              )}

              {/* KPI Cards (Style Logip) */}
              {rows.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Carte 1: Taux de publication */}
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t({ fr: "Articles Publiés", en: "Published Items" })}
                      </span>
                      <CheckCircle className="size-4 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xl font-bold text-slate-800">
                        {stats.published} <span className="text-xs font-medium text-slate-400">/ {stats.total}</span>
                      </p>
                      {/* Filon de progression doré */}
                      <div className="h-1 w-full rounded-full bg-[#FAF7F2] overflow-hidden mt-3">
                        <div 
                          className="h-full bg-accent rounded-full" 
                          style={{ width: `${(stats.published / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Carte 2: Traduction */}
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t({ fr: "Santé traduction", en: "Translation Health" })}
                      </span>
                      <Languages className="size-4 text-accent" />
                    </div>
                    <div className="mt-2">
                      <p className="text-2xl font-bold text-slate-800">
                        {stats.total > 0 ? Math.round(((stats.total - stats.untranslated) / stats.total) * 100) : 100}%
                      </p>
                      <div className="h-1 w-full rounded-full bg-[#FAF7F2] overflow-hidden mt-3">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${stats.total > 0 ? ((stats.total - stats.untranslated) / stats.total) * 100 : 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Carte 3: Messagerie */}
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs flex flex-col justify-between min-h-[110px] cursor-pointer" onClick={() => setPanel("messages")}>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t({ fr: "Messages de contact", en: "Contact Inbox" })}
                      </span>
                      <Inbox className="size-4 text-accent" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <p className="text-xl font-bold text-slate-800">{messages.length}</p>
                      <span className="text-[10px] text-accent font-semibold flex items-center hover:underline">
                        {t({ fr: "Boîte", en: "Inbox" })}
                        <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>

                  {/* Carte 4: Inscrits */}
                  <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] p-5 shadow-xs flex flex-col justify-between min-h-[110px] cursor-pointer" onClick={() => setPanel("subscribers")}>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t({ fr: "Newsletter", en: "Newsletter List" })}
                      </span>
                      <Mail className="size-4 text-accent" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <p className="text-xl font-bold text-slate-800">{subscribers.length}</p>
                      <span className="text-[10px] text-accent font-semibold flex items-center hover:underline">
                        {t({ fr: "Gérer", en: "Manage" })}
                        <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DASHBOARD ANALYTICS ADDED HERE */}
              {rows.length > 0 && <AnalyticsDashboard />}

              {/* Table de contenus simplifiée et soignée sous les KPI */}
              {rows.length > 0 && (
                <div className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] bg-[#FAF7F2]/40 px-6 py-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      {t({ fr: "Derniers contenus créés", en: "Latest content created" })}
                    </h3>
                    <button
                      onClick={openNew}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      {t({ fr: "Nouveau", en: "New" })}
                    </button>
                  </div>
                  
                  <ul className="divide-y divide-[#F0EDE6]">
                    {rows.slice(0, 5).map((row) => (
                      <li key={row.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <div className="flex items-center justify-between gap-4 px-6 py-3.5">
                          <a href={getPublicUrl(row)} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 min-w-0 hover:opacity-80 transition-opacity">
                            {row.image_url ? (
                              <AdminImageThumbnail
                                url={row.image_url}
                                className="size-10 rounded-lg object-cover border border-[#EAE6DF]/50 bg-[#FAF7F2]"
                              />
                            ) : (
                              <div className="size-10 rounded-lg border border-[#EAE6DF]/50 bg-[#FAF7F2] flex items-center justify-center text-slate-300">
                                <FileText className="size-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="block truncate font-semibold text-slate-800 text-xs">{row.title_fr}</span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                                <span className="bg-[#FAF7F2] text-slate-500 px-1.5 py-0.5 rounded">
                                  {t(
                                    CONTENT_TYPES.find((c) => c.value === row.type)?.label ?? {
                                      fr: row.type,
                                      en: row.type,
                                    },
                                  )}
                                </span>
                              </span>
                            </div>
                          </a>

                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                row.published
                                  ? "bg-emerald-50/80 text-emerald-800 border-emerald-200/20"
                                  : "bg-[#FAF7F2] text-slate-400 border-[#EAE6DF]"
                              }`}
                            >
                              {row.published
                                ? t({ fr: "En ligne", en: "Live" })
                                : t({ fr: "Brouillon", en: "Draft" })}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : panel === "pages" ? (
            <PagesPanel
              rows={rows}
              onEdit={(row) => setDraft(toDraft(row))}
              onCreate={(slug) => setDraft({ ...emptyDraft, type: "page", slug, published: true })}
            />
          ) : panel === "media" ? (
            <MediaLibrary />
          ) : panel === "images" ? (
            <SiteImagesPanel />
          ) : panel === "settings" ? (
            <div className="space-y-6">
              <ContactSettings />
              <SocialSettings />
            </div>
          ) : panel === "subscribers" ? (
            <NewsletterPanel
              rows={rows}
              onEdit={(row) => setDraft(toDraft(row))}
              onCreate={(slug) => setDraft({ ...emptyDraft, type: "newsletter", slug, published: true })}
            />
          ) : panel === "messages" ? (
            <MessagesPanel />
          ) : (
            // PANNEAU LISTE BILINGUE CLASSIQUE
            <section className="rounded-2xl border border-[#EAE6DF] bg-[#FFFDF9] shadow-xs overflow-hidden animate-soft-fade">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#EAE6DF] bg-[#FAF7F2]/50 p-4.5">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t({ fr: "Rechercher...", en: "Search..." })}
                    className="w-full rounded-full border border-[#EAE6DF] bg-[#FFFDF9] py-2 pl-10 pr-4 text-xs outline-none transition-all focus:border-accent"
                  />
                </div>
                <button
                  onClick={openNew}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Plus className="size-4" />
                  {t({ fr: "Créer un contenu", en: "Create content" })}
                </button>
              </div>

              {isLoading && (
                <div className="p-12 flex flex-col items-center justify-center">
                  <div className="size-5 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t({ fr: "Chargement...", en: "Loading..." })}</p>
                </div>
              )}
              {error && <p className="p-6 text-sm text-destructive">{(error as Error).message}</p>}
              {!isLoading && visible.length === 0 && (
                <p className="p-12 text-center text-xs text-slate-400">
                  {t({ fr: "Aucun contenu trouvé dans cette catégorie.", en: "No content found in this category." })}
                </p>
              )}

              <ul className="divide-y divide-[#F0EDE6]">
                {visible.map((row) => {
                  const missing = missingTranslations(row);
                  return (
                    <li key={row.id} className="hover:bg-[#FAF7F2]/30 transition-colors">
                      <div className="flex items-center justify-between gap-4 px-6 py-4">
                        <a href={getPublicUrl(row)} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
                          {row.image_url ? (
                            <AdminImageThumbnail
                              url={row.image_url}
                              className="size-11 rounded-lg object-cover border border-[#EAE6DF]/50 bg-[#FAF7F2]"
                            />
                          ) : (
                            <div className="size-11 rounded-lg border border-[#EAE6DF]/50 bg-[#FAF7F2] flex items-center justify-center text-slate-300 shrink-0">
                              <FileText className="size-4.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block truncate font-semibold text-slate-800 text-xs leading-tight">{row.title_fr}</span>
                            <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                              <span className="bg-[#FAF7F2] text-slate-500 px-1.5 py-0.5 rounded">
                                {t(
                                  CONTENT_TYPES.find((c) => c.value === row.type)?.label ?? {
                                    fr: row.type,
                                    en: row.type,
                                  },
                                )}
                              </span>
                              <span>·</span>
                              <span className="font-mono max-w-[150px] truncate normal-case tracking-normal font-medium text-slate-400">{row.slug}</span>
                            </span>
                          </div>
                        </a>

                        <div className="flex items-center gap-3">
                          {missing.length > 0 && (
                            <span 
                              className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
                              title={t({ fr: "Traduction anglaise manquante", en: "English translation missing" })}
                            >
                              <Languages className="size-2.5" />
                              {t({ fr: "À traduire", en: "Translate" })}
                            </span>
                          )}

                          <span
                            className={`rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              row.published
                                ? "bg-emerald-50/80 text-emerald-800 border-emerald-200/20"
                                : "bg-[#FAF7F2] text-slate-400 border-[#EAE6DF]"
                            }`}
                          >
                            {row.published
                              ? t({ fr: "En ligne", en: "Live" })
                              : t({ fr: "Brouillon", en: "Draft" })}
                          </span>

                          {activeType !== "all" && search.trim() === "" && (
                            <div className="flex items-center gap-1">
                              <button
                                disabled={visible.indexOf(row) === 0 || moveItem.isPending}
                                onClick={() => moveItem.mutate({ item: row, direction: "up" })}
                                className="size-8.5 rounded-lg border border-[#EAE6DF] hover:border-slate-800 hover:text-slate-850 bg-[#FFFDF9] flex items-center justify-center text-slate-400 transition-colors shadow-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                title={t({ fr: "Monter", en: "Move up" })}
                              >
                                <ArrowUp className="size-3.5" />
                              </button>
                              <button
                                disabled={visible.indexOf(row) === visible.length - 1 || moveItem.isPending}
                                onClick={() => moveItem.mutate({ item: row, direction: "down" })}
                                className="size-8.5 rounded-lg border border-[#EAE6DF] hover:border-slate-800 hover:text-slate-850 bg-[#FFFDF9] flex items-center justify-center text-slate-400 transition-colors shadow-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                title={t({ fr: "Descendre", en: "Move down" })}
                              >
                                <ArrowDown className="size-3.5" />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => setDraft(toDraft(row))}
                            className="size-8.5 rounded-lg border border-[#EAE6DF] hover:border-accent hover:text-accent bg-[#FFFDF9] flex items-center justify-center text-slate-500 transition-colors shadow-xs cursor-pointer"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </main>

      {/* Backdrop de droite pour mobile */}
      {isRightSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsRightSidebarOpen(false)}
        />
      )}

      {/* 3. Colonne Droite - Inspecteur / Activité (Timeline Style Chat - Logip) */}
      <aside
        className={`bg-[#FFFDF9] flex flex-col justify-between shrink-0 h-full overflow-y-auto transition-all duration-300 z-40
          fixed inset-y-0 right-0 w-[300px] border-l border-[#EAE6DF]
          ${isRightSidebarOpen ? "translate-x-0 p-6" : "translate-x-full p-0 border-l-0"}
          lg:static lg:translate-x-0
          ${isRightSidebarOpen ? "lg:w-[300px] lg:opacity-100 lg:p-6 lg:border-l" : "lg:w-0 lg:opacity-0 lg:p-0 lg:border-l-0 lg:overflow-hidden"}
        `}
      >
        <div className="space-y-8">
          {/* User profile & close button on mobile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3.5 bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE6DF] flex-1 min-w-0">
              <div className="size-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold shadow-sm shrink-0">
                JA
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-slate-800 text-xs truncate">Joyanot AMOUZOUN</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Administrateur</span>
              </div>
            </div>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              aria-label="Fermer les notifications"
              className="lg:hidden p-2 hover:bg-[#FAF7F2] rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 border border-[#EAE6DF] bg-[#FFFDF9]"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Flux d'activité chronologique (Timeline style Chat - Logip) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {t({ fr: "Activité récente", en: "Recent Activity" })}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {t({ fr: "Dernières interactions", en: "Latest interactions" })}
              </p>
            </div>

            <div className="space-y-4">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="space-y-1 flex flex-col items-end">
                  {/* Speech bubble */}
                  <div className={`w-full p-3 rounded-2xl text-xs space-y-1 relative border ${
                    evt.type === "message"
                      ? "bg-[#FAF7F2] text-slate-700 border-[#EAE6DF] rounded-tr-none"
                      : "bg-[#0c2340]/5 text-[#0c2340] border-[#EAE6DF] rounded-tr-none"
                  }`}>
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-[10px] text-slate-800 truncate">
                        {evt.type === "message" ? evt.title : t({ fr: "Abonné newsletter", en: "Newsletter subscriber" })}
                      </span>
                      <span className="text-[8px] text-slate-400 shrink-0">
                        {new Date(evt.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed break-words font-medium text-slate-600">
                      {evt.type === "message" ? `"${evt.meta}"` : evt.title}
                    </p>
                  </div>
                  {/* Email & Info sous la bulle */}
                  <span className="text-[9px] text-slate-400 mr-2 block truncate max-w-full">
                    {evt.type === "message" ? evt.subtitle : evt.subtitle}
                  </span>
                </div>
              ))}

              {timelineEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Inbox className="size-6 text-slate-300 mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-center">{t({ fr: "Aucun événement", en: "No events" })}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pied d'activité */}
        <div className="text-[9px] text-slate-300 text-center uppercase tracking-widest pt-4 mt-8 border-t border-[#EAE6DF]">
          Joyanot © {new Date().getFullYear()}
        </div>
      </aside>

      {/* Full-page Stepper Content Editor */}
      {draft && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col h-full w-full overflow-hidden animate-soft-fade">
          {/* Header de l'éditeur */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#EAE6DF] bg-[#FFFDF9] px-6 lg:px-10 py-5">
            <div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-0.5">
                {draft.id
                  ? t({ fr: "Modification du contenu", en: "Editing content" })
                  : t({ fr: "Création d'un nouveau contenu", en: "Creating new content" })}
              </span>
              <h2 className="text-base font-sans font-bold text-slate-800 flex items-center gap-2">
                {draft.title_fr || t({ fr: "Nouveau contenu sans titre", en: "New untitled content" })}
                <span className="text-xs font-normal text-slate-400">
                  ({t(CONTENT_TYPES.find((c) => c.value === draft.type)?.label ?? { fr: draft.type, en: draft.type })})
                </span>
              </h2>
            </div>
            <button
              onClick={() => setDraft(null)}
              aria-label={t({ fr: "Fermer l'éditeur", en: "Close editor" })}
              className="size-9 rounded-xl hover:bg-[#FAF7F2] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-[#EAE6DF]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Barre de progression (Stepper) — Pour un pack livre, l'étape 3 est skippée car les fichiers sont gérés par livre dans l'étape 2 */}
          <div className="bg-[#FFFDF9] border-b border-[#EAE6DF] px-6 lg:px-10 py-4 flex items-center justify-between overflow-x-auto gap-4 scrollbar-none">
            {(draft.type === "livre" && isPack
              ? [
                  { step: 1, label: t({ fr: "1. Configuration", en: "1. Settings" }) },
                  { step: 2, label: t({ fr: "2. Rédaction & Pack", en: "2. Text & Pack" }) },
                  { step: 4, label: t({ fr: "3. Publication & Enregistrement", en: "3. Publish & Save" }) },
                ]
              : [
                  { step: 1, label: t({ fr: "1. Configuration", en: "1. Settings" }) },
                  { step: 2, label: t({ fr: "2. Rédaction", en: "2. Text content" }) },
                  { step: 3, label: t({ fr: "3. Médias & Documents", en: "3. Media & Files" }) },
                  { step: 4, label: t({ fr: "4. Publication & Enregistrement", en: "4. Publish & Save" }) },
                ]
            ).map((s) => (
              <button
                key={s.step}
                onClick={() => {
                  if (s.step < currentStep || draft.title_fr.trim() !== "") {
                    setCurrentStep(s.step);
                  } else {
                    toast.warning(t({ fr: "Veuillez renseigner un titre à l'étape 2 d'abord.", en: "Please set a title in step 2 first." }));
                  }
                }}
                className={`flex items-center gap-2 shrink-0 py-1 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                  currentStep === s.step
                    ? "border-accent text-slate-900"
                    : currentStep > s.step
                    ? "border-emerald-500 text-emerald-650"
                    : "border-transparent text-slate-400 hover:text-slate-650"
                }`}
              >
                <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === s.step
                    ? "bg-accent text-accent-foreground"
                    : currentStep > s.step
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {/* Display sequential visual numbering */}
                  {draft.type === "livre" && isPack && s.step === 4 ? 3 : s.step}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu de l'étape active */}
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 max-w-4xl w-full mx-auto space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-soft-fade bg-white border border-[#EAE6DF] rounded-3xl p-8 lg:p-10 shadow-xs">
                <div className="space-y-1.5 pb-5 border-b border-[#EAE6DF]/60">
                  <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-widest">{t({ fr: "Configuration du contenu", en: "Content settings" })}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {t({
                      fr: "Définissez la catégorie du contenu et sa priorité d'affichage par rapport aux autres.",
                      en: "Define the content category and its priority relative to others."
                    })}
                  </p>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-1 pt-2">
                  <label className={labelClass}>
                    {t({ fr: "Catégorie", en: "Category" })}
                    <select
                      value={draft.type}
                      onChange={(e) => update({ type: e.target.value as ContentType })}
                      className={inputClass}
                    >
                      {CONTENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {t(type.label)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Prix de vente (FCFA) - Affiché pour les formations, produits et livres */}
                {(draft.type === "produit" || draft.type === "formation" || draft.type === "livre") && (() => {
                  const normalPrice = Number(draft.price.replace(/[^\d]/g, "") || 0);
                  const promoPrice = Number(draft.promo_price.replace(/[^\d]/g, "") || 0);
                  const promoPriceError = draft.promo_price && draft.price && promoPrice >= normalPrice;
                  return (
                    <div className="pt-4 border-t border-[#EAE6DF]/60 space-y-4">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <label className={labelClass}>
                          {t({ fr: "Prix de vente (en FCFA)", en: "Price" })}
                          <input
                            value={draft.price}
                            onChange={(e) => update({ price: e.target.value })}
                            placeholder="ex. 15000"
                            className={inputClass}
                          />
                        </label>
                        <label className={labelClass}>
                          {t({ fr: "Prix promotionnel (Optionnel)", en: "Promo Price (Optional)" })}
                          <input
                            value={draft.promo_price}
                            onChange={(e) => update({ promo_price: e.target.value })}
                            placeholder="ex. 12000"
                            className={`${inputClass} ${promoPriceError ? "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-400" : ""}`}
                          />
                        </label>
                      </div>
                      {promoPriceError && (
                        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-semibold animate-soft-fade">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>{t({ fr: `Le prix promotionnel (${promoPrice.toLocaleString()} FCFA) doit être inférieur au prix normal (${normalPrice.toLocaleString()} FCFA).`, en: `The promotional price (${promoPrice.toLocaleString()} FCFA) must be lower than the regular price (${normalPrice.toLocaleString()} FCFA).` })}</span>
                        </div>
                      )}
                      {draft.promo_price && !promoPriceError && promoPrice > 0 && normalPrice > 0 && (
                        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-xs font-semibold animate-soft-fade">
                          <CheckCircle className="size-4 shrink-0" />
                          <span>{t({ fr: `Réduction de ${Math.round(((normalPrice - promoPrice) / normalPrice) * 100)}% appliquée.`, en: `${Math.round(((normalPrice - promoPrice) / normalPrice) * 100)}% discount applied.` })}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-soft-fade bg-white border border-[#EAE6DF] rounded-3xl p-8 lg:p-10 shadow-xs">
                <div className="space-y-1.5 pb-5 border-b border-[#EAE6DF]/60">
                  <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-widest">
                    {draft.type === "livre"
                      ? t({ fr: "Rédaction & Pack (Livre)", en: "Copywriting & Pack (Book)" })
                      : draft.type === "formation"
                      ? t({ fr: "Rédaction (Formation)", en: "Copywriting (Course)" })
                      : draft.type === "article"
                      ? t({ fr: "Rédaction (Actualité)", en: "Copywriting (News)" })
                      : t({ fr: "Rédaction des textes (en Français)", en: "Text copywriting (French)" })}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {t({
                      fr: "Rédigez le titre et le contenu de votre fiche. La version anglaise est générée automatiquement.",
                      en: "Write the title and content of your page. The English translation is automatically generated."
                    })}
                  </p>
                </div>
                
                <div className="space-y-5 pt-2">
                  <label className={labelClass}>
                    {t({ fr: "Titre du contenu", en: "Title" })}
                    <input
                      value={draft.title_fr}
                      onChange={(e) => update({ title_fr: e.target.value })}
                      placeholder={
                        draft.type === "livre"
                          ? "ex. Les Clés du Succès (Volume 1) ou Pack Réussite"
                          : draft.type === "formation"
                          ? "ex. Formation CAO & Impression 3D"
                          : "ex. L'artisanat Béninois : Un levier de développement"
                      }
                      className={inputClass}
                    />
                  </label>

                  {draft.type === "formation" && (
                    <label className={labelClass}>
                      {t({ fr: "Type et durée (ex: 6 semaines — Présentiel, Cotonou)", en: "Type and duration (e.g., 6 weeks — In-person)" })}
                      <input
                        value={draft.duration_fr}
                        onChange={(e) => update({ duration_fr: e.target.value })}
                        placeholder="ex: 6 semaines — Présentiel, Cotonou"
                        className={inputClass}
                      />
                    </label>
                  )}

                  <label className={labelClass}>
                    {t({ fr: "Résumé / Description courte", en: "Short summary" })}
                    <textarea
                      rows={3}
                      value={draft.excerpt_fr}
                      onChange={(e) => update({ excerpt_fr: e.target.value })}
                      placeholder="Rédiger une courte introduction d'une ou deux phrases..."
                      className={inputClass}
                    />
                  </label>

                  {draft.type !== "realisation" && (
                    <label className={labelClass}>
                      {t({ fr: "Texte / Contenu principal", en: "Body Content" })}
                      <textarea
                        rows={12}
                        value={draft.body_fr}
                        onChange={(e) => update({ body_fr: e.target.value })}
                        placeholder="Rédiger la description complète ici..."
                        className={inputClass}
                      />
                    </label>
                  )}
                </div>

                {/* Section Spécifique au Pack de Livres */}
                {draft.type === "livre" && (
                  <div className="mt-6 pt-6 border-t border-[#EAE6DF]/60 space-y-4">
                    <label className="flex items-center gap-3 rounded-xl border border-[#EAE6DF] bg-[#FAF7F2]/50 p-4 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPack}
                        onChange={(e) => setIsPack(e.target.checked)}
                        className="size-4 accent-primary cursor-pointer"
                      />
                      <span>📚 {t({ fr: "Ce livre est un pack composé de plusieurs ouvrages", en: "This book is a pack of multiple books" })}</span>
                    </label>

                    {isPack && (
                      <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#EAE6DF] space-y-5 animate-soft-fade">
                        {/* Formulaire pour ajouter un livre */}
                        <div className="bg-white p-4 rounded-xl border border-[#EAE6DF] space-y-4 shadow-2xs">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            ✨ {t({ fr: "Ajouter un livre au pack", en: "Add a book to the pack" })}
                          </h4>
                          
                          <div className="space-y-3">
                            <label className={labelClass}>
                              {t({ fr: "Titre du livre", en: "Book Title" })}
                              <input
                                type="text"
                                value={newBookTitle}
                                onChange={(e) => setNewBookTitle(e.target.value)}
                                placeholder="ex. Les Clés de la Richesse"
                                className="w-full mt-1.5 rounded-lg border border-[#EAE6DF] bg-white px-3 py-2 text-xs text-slate-750 outline-none focus:border-accent"
                              />
                            </label>

                            <label className={labelClass}>
                              {t({ fr: "Description du livre", en: "Book Description" })}
                              <textarea
                                rows={2}
                                value={newBookDesc}
                                onChange={(e) => setNewBookDesc(e.target.value)}
                                placeholder="ex. Résumé des principes financiers abordés dans cet ouvrage..."
                                className="w-full mt-1.5 rounded-lg border border-[#EAE6DF] bg-white px-3 py-2 text-xs text-slate-750 outline-none focus:border-accent"
                              />
                            </label>

                             <div>
                              <span className={labelClass}>{t({ fr: "Images de couverture (une ou plusieurs)", en: "Cover images (one or more)" })}</span>
                              <div className="mt-2 flex items-center gap-2">
                                <label className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3.5 py-2 text-xs font-semibold bg-white hover:border-accent hover:text-accent cursor-pointer transition-colors">
                                  <Upload className="size-3.5" />
                                  {isUploadingBookImages ? t({ fr: "Téléversement...", en: "Uploading..." }) : t({ fr: "Ajouter des photos", en: "Add photos" })}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    disabled={isUploadingBookImages}
                                    onChange={(e) => handleUploadNewBookImages(e.target.files)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              {newBookGallery.length > 0 && (
                                <div className="mt-3 grid grid-cols-6 gap-2 bg-[#FAF7F2] p-2 rounded-lg border border-[#EAE6DF]">
                                  {newBookGallery.map((url) => (
                                    <div key={url} className="group relative overflow-hidden rounded-md border border-[#EAE6DF] aspect-square bg-white">
                                      <AdminImageThumbnail url={url} className="size-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setNewBookGallery(newBookGallery.filter((v) => v !== url))}
                                        className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <span className={labelClass}>{t({ fr: "Fichier du livre (Admin uniquement)", en: "Book File (Admin only)" })}</span>
                              <div className="mt-2 flex items-center gap-2">
                                <label className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3.5 py-2 text-xs font-semibold bg-white hover:border-accent hover:text-accent cursor-pointer transition-colors">
                                  <Upload className="size-3.5" />
                                  {isUploadingBookFile ? t({ fr: "Téléversement...", en: "Uploading..." }) : t({ fr: "Choisir le fichier PDF/EPUB", en: "Choose PDF/EPUB file" })}
                                  <input
                                    type="file"
                                    accept=".pdf,.epub"
                                    disabled={isUploadingBookFile}
                                    onChange={(e) => handleUploadNewBookFile(e.target.files?.[0])}
                                    className="hidden"
                                  />
                                </label>
                                {newBookFile && (
                                  <span className="text-[11px] text-green-600 font-bold bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 truncate max-w-[200px]" title={newBookFile.split("/").pop()}>
                                    ✓ {newBookFile.split("/").pop()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!newBookTitle.trim()) {
                                toast.error(t({ fr: "Veuillez entrer le titre du livre", en: "Please enter the book title" }));
                                return;
                              }
                              setPackBooks([...packBooks, { title: newBookTitle.trim(), desc: newBookDesc.trim(), file_url: newBookFile, gallery: newBookGallery }]);
                              setNewBookTitle("");
                              setNewBookDesc("");
                              setNewBookFile("");
                              setNewBookGallery([]);
                            }}
                            className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            {t({ fr: "Ajouter ce livre au pack", en: "Add this book to pack" })}
                          </button>
                        </div>

                        {/* Liste des livres déjà dans le pack */}
                        <div className="space-y-3">
                          <span className={labelClass}>{t({ fr: "Livres inclus dans le pack", en: "Books included in the pack" })}</span>
                          
                          {packBooks.length > 0 ? (
                            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                              {packBooks.map((book, idx) => (
                                <div key={idx} className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-[#EAE6DF] text-xs">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h5 className="font-bold text-slate-850 truncate">{idx + 1}. {book.title}</h5>
                                      {book.desc && (
                                        <p className="mt-1 text-[11px] text-slate-500 font-medium leading-relaxed">
                                          {book.desc}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPackBooks(packBooks.filter((_, i) => i !== idx))}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>

                                  {/* Affichage des images de couverture associées au livre */}
                                  {book.gallery && book.gallery.length > 0 && (
                                    <div className="flex items-center gap-1.5 pt-1">
                                      {book.gallery.map((imgUrl, i) => (
                                        <AdminImageThumbnail
                                          key={i}
                                          url={imgUrl}
                                          className="size-8 rounded border border-[#EAE6DF] object-cover bg-slate-50"
                                        />
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Affichage du fichier joint au livre */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-[#EAE6DF]/60 text-[10px]">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">{t({ fr: "Fichier :", en: "File:" })}</span>
                                    {book.file_url ? (
                                      <AdminBookFileLink
                                        fileUrl={book.file_url}
                                        filename={book.file_url.split("/").pop() || ""}
                                      />
                                    ) : (
                                      <span className="text-slate-400 italic">{t({ fr: "Aucun fichier associé", en: "No file associated" })}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 text-center italic py-4">
                              {t({ fr: "Aucun livre dans le pack pour le moment. Remplissez le formulaire ci-dessus pour ajouter des livres.", en: "No books in the pack yet. Fill the form above to add books." })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-soft-fade bg-white border border-[#EAE6DF] rounded-3xl p-8 lg:p-10 shadow-xs">
                <div className="space-y-1.5 pb-5 border-b border-[#EAE6DF]/60">
                  <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-widest">{t({ fr: "Médias & Documents attachés", en: "Attached Media & Files" })}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {t({
                      fr: "Associez des fichiers multimédias ou des documents téléchargeables à votre fiche.",
                      en: "Attach multimedia assets or downloadable documents to your item."
                    })}
                  </p>
                </div>
                
                <div className={`grid gap-6 ${draft.type === "livre" ? "sm:grid-cols-1" : "sm:grid-cols-2"} pt-2`}>
                  <MediaField
                    label={t({ fr: "Image principale", en: "Main image" })}
                    accept="image/*"
                    folder="images"
                    preview="image"
                    value={draft.image_url}
                    onChange={(v) => update({ image_url: v })}
                  />
                  {draft.type !== "livre" && (
                    <MediaField
                      label={t({ fr: "Vidéo illustrative", en: "Illustrative video" })}
                      hint={t({
                        fr: "Fichier MP4 téléversé, ou lien YouTube / Vimeo.",
                        en: "Uploaded MP4 file, or YouTube / Vimeo link.",
                      })}
                      accept="video/*"
                      folder="videos"
                      value={draft.video_url}
                      onChange={(v) => update({ video_url: v })}
                    />
                  )}
                </div>

                <div className="border-t border-[#EAE6DF]/60 pt-6">
                  <GalleryField
                    folder="images"
                    value={draft.gallery}
                    onChange={(v) => update({ gallery: v })}
                  />
                </div>

                {/* Les actualités n'ont pas besoin de pièces jointes à télécharger.
                    Les packs de livres non plus, car les fichiers sont gérés individuellement par livre à l'étape 2.
                    Les réalisations sont des fiches simples (Titre, Image, Résumé). */}
                {draft.type !== "article" && draft.type !== "realisation" && !(draft.type === "livre" && isPack) && (
                  <div className="border-t border-[#EAE6DF]/60 pt-6 grid gap-6 sm:grid-cols-2">
                    <MultiFileField
                      label={
                        draft.type === "livre"
                          ? t({ fr: "Fichier e-book PDF/EPUB (Admin uniquement)", en: "PDF/EPUB ebook file (Admin only)" })
                          : t({ fr: "Documents de formation PDF (plusieurs possibles)", en: "Training brochures or program PDF files" })
                      }
                      hint={t({ fr: "PDF, Word, Excel, ZIP, EPUB… Pour charger plusieurs fichiers, sélectionnez-les ensemble.", en: "PDF, Word, Excel, ZIP, EPUB… To upload multiple files, select them together." })}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.epub,.jpg,.jpeg,.png,.gif"
                      folder="fichiers"
                      value={draft.file_url}
                      onChange={(v) => update({ file_url: v })}
                    />
                    <label className={labelClass}>
                      {t({ fr: "Texte du bouton de téléchargement", en: "Download button label" })}
                      <input
                        value={draft.file_label}
                        onChange={(e) => update({ file_label: e.target.value })}
                        placeholder={t({ fr: "Télécharger le fichier", en: "Download file" })}
                        className={inputClass}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-soft-fade">
                {/* Récapitulatif rapide */}
                <div className="bg-white border border-[#EAE6DF] rounded-3xl p-8 lg:p-10 shadow-xs space-y-4">
                  <div className="space-y-1.5 pb-4 border-b border-[#EAE6DF]/60">
                    <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-widest">{t({ fr: "Récapitulatif de la fiche", en: "Summary review" })}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t({ fr: "Vérifiez l'image et les informations principales avant d'enregistrer.", en: "Verify the preview image and key information before saving." })}</p>
                  </div>
                  <div className="flex gap-4 items-start bg-[#FAF7F2] p-5 rounded-2xl border border-[#EAE6DF]">
                    {previewImgUrl ? (
                      <img 
                        src={previewImgUrl} 
                        alt="" 
                        className="size-16 rounded-xl object-cover border border-[#EAE6DF] bg-slate-200"
                      />
                    ) : (
                      <div className="size-16 rounded-xl bg-slate-105 flex items-center justify-center text-slate-350 border border-[#EAE6DF]">
                        <FileText className="size-6 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                        {t(CONTENT_TYPES.find((c) => c.value === draft.type)?.label ?? { fr: draft.type, en: draft.type })}
                      </p>
                      <h4 className="text-sm font-bold text-slate-800 mt-0.5 truncate">{draft.title_fr || t({ fr: "Sans titre", en: "Untitled" })}</h4>
                      <div className="flex gap-3 text-[11px] text-slate-405 mt-1.5 font-medium">
                        {draft.price && (
                          <span>
                            💰 {draft.promo_price ? `${draft.promo_price} FCFA (Promo) [Normal: ${draft.price} FCFA]` : `${draft.price} FCFA`}
                          </span>
                        )}
                        <span>📸 {draft.gallery.length} photo(s)</span>
                        {draft.file_url && <span>📁 Fichier(s) joint(s)</span>}
                        {draft.type === "livre" && isPack && (
                          <span className="text-accent">📚 Pack ({packBooks.length} livres)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fichiers téléchargement Admin pour les Livres (Pack ou simple) */}
                  {draft.type === "livre" && isPack && packBooks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#EAE6DF]/60 space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t({ fr: "Fichiers des livres du pack (Admin uniquement) :", en: "Pack books files (Admin only):" })}</p>
                      <div className="grid gap-2">
                        {packBooks.map((pb, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#EAE6DF] text-xs shadow-2xs">
                            <span className="truncate font-semibold text-slate-800">{pb.title}</span>
                            {pb.file_url ? (
                              <AdminBookDownloadLink fileUrl={pb.file_url}>
                                {t({ fr: "Télécharger", en: "Download" })}
                              </AdminBookDownloadLink>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">{t({ fr: "Aucun fichier", en: "No file" })}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.type === "livre" && !isPack && draft.file_url && (
                    <div className="mt-4 pt-4 border-t border-[#EAE6DF]/60 space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t({ fr: "Fichier de l'ouvrage (Admin uniquement) :", en: "Book file (Admin only):" })}</p>
                      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#EAE6DF] text-xs shadow-2xs">
                        <span className="truncate font-semibold text-slate-800">{draft.title_fr}</span>
                        <AdminBookDownloadLink fileUrl={draft.file_url}>
                          {t({ fr: "Télécharger", en: "Download" })}
                        </AdminBookDownloadLink>
                      </div>
                    </div>
                  )}
                </div>

                {/* Choix de statut et enregistrement */}
                <div className="bg-white border border-[#EAE6DF] rounded-3xl p-8 lg:p-10 shadow-xs space-y-4">
                  <div className="space-y-1.5 pb-4 border-b border-[#EAE6DF]/60">
                    <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-widest">{t({ fr: "Choisissez l'action d'enregistrement", en: "Choose save action" })}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t({ fr: "Cliquez sur l'une des deux cartes pour stocker ou publier.", en: "Click on one of the two cards to store or publish." })}</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    {/* Option Brouillon Stocké */}
                    <div
                      onClick={() => handleSave(false)}
                      className="group flex flex-col justify-between p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-800 bg-[#FFFDF9] hover:bg-[#FAF7F2]/40 transition-all cursor-pointer space-y-3 shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <FileText className="size-4.5" />
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {t({ fr: "Brouillon", en: "Draft" })}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{t({ fr: "Enregistrer comme Brouillon Stocké", en: "Save as Stored Draft" })}</h4>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                          {t({ fr: "Le contenu sera stocké dans votre base de données, mais restera masqué pour les visiteurs du site.", en: "Save to database but hide from public site visitors." })}
                        </p>
                      </div>
                    </div>

                    {/* Option Publier en ligne */}
                    <div
                      onClick={() => handleSave(true)}
                      className="group flex flex-col justify-between p-6 rounded-2xl border-2 border-slate-200 hover:border-accent bg-[#FFFDF9] hover:bg-[#FAF7F2]/40 transition-all cursor-pointer space-y-3 shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="size-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                          <Globe className="size-4.5" />
                        </span>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
                          {t({ fr: "En ligne", en: "Live" })}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{t({ fr: "Publier et rendre visible en Ligne", en: "Publish and make visible Online" })}</h4>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                          {t({ fr: "Le contenu sera instantanément en ligne et accessible pour tous les visiteurs du site.", en: "Content will be instantly live and viewable by everyone." })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer de l'éditeur */}
          <div className="sticky bottom-0 border-t border-[#EAE6DF] bg-[#FFFDF9] px-6 lg:px-10 py-4 flex items-center justify-between">
            {draft.id ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t({ fr: "Supprimer définitivement ce contenu ?", en: "Permanently delete this content?" }))) {
                    remove.mutate(draft.id!);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 hover:border-rose-300 hover:bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="size-4" />
                {t({ fr: "Supprimer", en: "Delete" })}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-xl border border-[#EAE6DF] hover:bg-[#FAF7F2]/50 px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer bg-white"
              >
                {t({ fr: "Annuler", en: "Cancel" })}
              </button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    // Pour un pack, sauter l'étape 3 en revenant (4 → 2)
                    if (currentStep === 4 && draft.type === "livre" && isPack) {
                      setCurrentStep(2);
                    } else {
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                  className="rounded-xl border border-[#EAE6DF] hover:bg-[#FAF7F2]/50 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors cursor-pointer bg-white"
                >
                  {t({ fr: "Précédent", en: "Previous" })}
                </button>
              )}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    // Validation étape 1 : prix promo invalide
                    if (currentStep === 1) {
                      const normalPrice = Number(draft.price.replace(/[^\d]/g, "") || 0);
                      const promoPrice = Number(draft.promo_price.replace(/[^\d]/g, "") || 0);
                      if (draft.promo_price && draft.price && promoPrice >= normalPrice) {
                        toast.error(t({ fr: "Le prix promotionnel doit être inférieur au prix normal.", en: "The promotional price must be lower than the regular price." }));
                        return;
                      }
                    }
                    // Validation étape 2 : titre obligatoire
                    if (currentStep === 2 && !draft.title_fr.trim()) {
                      toast.warning(t({ fr: "Le titre est obligatoire pour continuer.", en: "Title is required to proceed." }));
                      return;
                    }
                    // Pour un pack livre, sauter l'étape 3 (2 → 4)
                    if (currentStep === 2 && draft.type === "livre" && isPack) {
                      setCurrentStep(4);
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  {t({ fr: "Continuer", en: "Continue" })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue Changer le mot de passe */}
      {pwOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-soft-fade">
          <form
            onSubmit={changePassword}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl animate-rise"
          >
            <h2 className="text-sm font-bold text-slate-800">
              {t({ fr: "Changer de mot de passe", en: "Change password" })}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {t({ fr: "Le mot de passe doit contenir 8 caractères minimum.", en: "The password must have at least 8 characters." })}
            </p>
            <div className="space-y-4 mt-5">
              <input
                type="password"
                required
                minLength={8}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder={t({ fr: "Nouveau mot de passe", en: "New password" })}
                className={inputClass}
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder={t({ fr: "Confirmer le nouveau mot de passe", en: "Confirm password" })}
                className={inputClass}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={pwSaving}
                className="flex-1 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                {pwSaving ? t({ fr: "Enregistrement...", en: "Saving..." }) : t({ fr: "Mettre à jour", en: "Update" })}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPwOpen(false);
                  setNewPw("");
                  setConfirmPw("");
                }}
                className="flex-1 rounded-xl border border-slate-200 hover:border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer bg-white"
              >
                {t({ fr: "Annuler", en: "Cancel" })}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
