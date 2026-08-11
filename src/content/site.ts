import type { LocalizedText } from "@/lib/lang";

export const person = {
  name: "Joyanot AMOUZOUN",
  role: {
    fr: "Ingénieur mécanicien · Leader de l'artisanat béninois · Entrepreneur",
    en: "Mechanical engineer · Leader of Benin's craft sector · Entrepreneur",
  } satisfies LocalizedText,
  tagline: {
    fr: "Bâtir une industrie africaine à la hauteur du talent de ses artisans.",
    en: "Building an African industry worthy of its artisans' talent.",
  } satisfies LocalizedText,
  intro: {
    fr: "Ingénieur en mécanique, entrepreneur et formateur, M. Joyanot AMOUZOUN consacre sa carrière à la structuration de l'artisanat et de la petite industrie au Bénin. Chef du quartier Agla Petit Château, ancien Président de la Confédération Nationale des Artisans du Bénin et Vice-Président de l'UNAEIB, il conjugue leadership associatif, expertise technique et engagement communautaire.",
    en: "A mechanical engineer, entrepreneur and trainer, Mr. Joyanot AMOUZOUN has devoted his career to structuring craft trades and small industry in Benin. Head of the Agla Petit Château district, former President of the National Confederation of Artisans of Benin and Vice-President of UNAEIB, he combines associative leadership, technical expertise and community commitment.",
  } satisfies LocalizedText,
  email: "contact@joyanot-amouzoun.bj",
  phone: "+229 00 00 00 00",
  whatsapp: "22900000000",
  location: {
    fr: "Agla Petit Château, Cotonou — Bénin",
    en: "Agla Petit Château, Cotonou — Benin",
  } satisfies LocalizedText,
};

export const stats: { value: string; label: LocalizedText }[] = [
  { value: "25+", label: { fr: "années d'expérience", en: "years of experience" } },
  { value: "1 200+", label: { fr: "artisans accompagnés", en: "artisans supported" } },
  { value: "40+", label: { fr: "machines conçues", en: "machines engineered" } },
  { value: "12", label: { fr: "départements couverts", en: "departments covered" } },
];

export const pillars: { title: LocalizedText; text: LocalizedText }[] = [
  {
    title: { fr: "Excellence technique", en: "Technical excellence" },
    text: {
      fr: "Conception, fabrication et maintenance d'équipements industriels adaptés aux réalités africaines.",
      en: "Design, manufacturing and maintenance of industrial equipment adapted to African realities.",
    },
  },
  {
    title: { fr: "Leadership institutionnel", en: "Institutional leadership" },
    text: {
      fr: "Représentation et défense des intérêts des artisans auprès des instances nationales et internationales.",
      en: "Representing and defending artisans' interests before national and international bodies.",
    },
  },
  {
    title: { fr: "Transmission", en: "Knowledge transfer" },
    text: {
      fr: "Formations, guides professionnels et mentorat pour une nouvelle génération d'entrepreneurs.",
      en: "Training, professional guides and mentoring for a new generation of entrepreneurs.",
    },
  },
];

export const biography: LocalizedText[] = [
  {
    fr: "Formé à l'ingénierie mécanique, M. Joyanot AMOUZOUN débute sa carrière dans la fabrication et la maintenance d'équipements industriels. Très tôt, il constate que le talent des artisans béninois est freiné par le manque de structuration, de financement et de normes.",
    en: "Trained as a mechanical engineer, Mr. Joyanot AMOUZOUN began his career in the manufacturing and maintenance of industrial equipment. Early on, he observed that the talent of Beninese artisans was held back by a lack of structure, financing and standards.",
  },
  {
    fr: "Il s'engage alors dans le mouvement associatif et gravit les échelons jusqu'à la présidence de la Confédération Nationale des Artisans du Bénin (CNAB), où il œuvre à la professionnalisation des métiers, à la reconnaissance des qualifications et au dialogue avec les pouvoirs publics.",
    en: "He then became active in the associative movement and rose to the presidency of the National Confederation of Artisans of Benin (CNAB), where he worked on professionalising trades, recognising qualifications and building dialogue with public authorities.",
  },
  {
    fr: "Parallèlement, il développe ses propres activités entrepreneuriales, conçoit des machines pour la transformation agroalimentaire et forme des centaines de jeunes techniciens. Chef du quartier Agla Petit Château, il porte une vision où l'excellence technique sert d'abord la communauté.",
    en: "In parallel, he developed his own entrepreneurial activities, engineered machines for agri-food processing and trained hundreds of young technicians. As head of the Agla Petit Château district, he carries a vision in which technical excellence serves the community first.",
  },
];

export const timeline: { period: string; title: LocalizedText; text: LocalizedText }[] = [
  {
    period: "Aujourd'hui",
    title: { fr: "Chef du Quartier Agla Petit Château", en: "Head of Agla Petit Château District" },
    text: {
      fr: "Administration de proximité, médiation communautaire et développement local.",
      en: "Local administration, community mediation and grassroots development.",
    },
  },
  {
    period: "—",
    title: { fr: "Vice-Président de l'UNAEIB", en: "Vice-President of UNAEIB" },
    text: {
      fr: "Union Nationale des Artisans et Entreprises Industrielles du Bénin : structuration et plaidoyer.",
      en: "National Union of Artisans and Industrial Enterprises of Benin: structuring and advocacy.",
    },
  },
  {
    period: "—",
    title: {
      fr: "Président de la Confédération Nationale des Artisans du Bénin (CNAB)",
      en: "President of the National Confederation of Artisans of Benin (CNAB)",
    },
    text: {
      fr: "Représentation nationale de l'artisanat, réforme des corps de métiers, partenariats institutionnels.",
      en: "National representation of craft trades, reform of trade bodies, institutional partnerships.",
    },
  },
  {
    period: "—",
    title: { fr: "Consultant en ingénierie mécanique", en: "Mechanical engineering consultant" },
    text: {
      fr: "Études, conception d'équipements, audits techniques et accompagnement d'unités de production.",
      en: "Studies, equipment design, technical audits and support for production units.",
    },
  },
  {
    period: "—",
    title: { fr: "Entrepreneur & formateur", en: "Entrepreneur & trainer" },
    text: {
      fr: "Création d'ateliers, fabrication de machines et programmes de formation professionnelle.",
      en: "Creating workshops, manufacturing machines and running vocational training programmes.",
    },
  },
];

export const organizations: {
  name: string;
  role: LocalizedText;
  text: LocalizedText;
}[] = [
  {
    name: "BEVULTA",
    role: { fr: "Fondateur", en: "Founder" },
    text: {
      fr: "Structure dédiée à l'ingénierie, à la fabrication d'équipements et à l'accompagnement des unités de production.",
      en: "An organisation dedicated to engineering, equipment manufacturing and support for production units.",
    },
  },
  {
    name: "CNAB",
    role: { fr: "Ancien Président", en: "Former President" },
    text: {
      fr: "Confédération Nationale des Artisans du Bénin — faîtière représentant les corps de métiers artisanaux du pays.",
      en: "National Confederation of Artisans of Benin — the umbrella body representing the country's craft trades.",
    },
  },
  {
    name: "UNAEIB",
    role: { fr: "Vice-Président", en: "Vice-President" },
    text: {
      fr: "Union Nationale des Artisans et Entreprises Industrielles du Bénin — promotion de la petite industrie.",
      en: "National Union of Artisans and Industrial Enterprises of Benin — promoting small industry.",
    },
  },
  {
    name: "Autres structures",
    role: { fr: "Membre & partenaire", en: "Member & partner" },
    text: {
      fr: "Participation à des comités techniques, chambres consulaires et programmes de développement du secteur privé.",
      en: "Participation in technical committees, consular chambers and private-sector development programmes.",
    },
  },
];

export const books: {
  title: LocalizedText;
  format: LocalizedText;
  price: string;
  text: LocalizedText;
}[] = [
  {
    title: {
      fr: "Guide de l'artisan entrepreneur",
      en: "The Artisan Entrepreneur's Guide",
    },
    format: { fr: "Ebook PDF · 148 pages", en: "PDF ebook · 148 pages" },
    price: "5 000 FCFA",
    text: {
      fr: "Structurer son atelier, fixer ses prix, gérer sa trésorerie et formaliser son activité.",
      en: "Structuring your workshop, pricing your work, managing cash flow and formalising your business.",
    },
  },
  {
    title: {
      fr: "Maintenance industrielle : les fondamentaux",
      en: "Industrial Maintenance: The Fundamentals",
    },
    format: { fr: "Ebook PDF · 96 pages", en: "PDF ebook · 96 pages" },
    price: "4 000 FCFA",
    text: {
      fr: "Méthodes de maintenance préventive et corrective appliquées aux petites unités de production.",
      en: "Preventive and corrective maintenance methods applied to small production units.",
    },
  },
  {
    title: {
      fr: "Leadership et gouvernance associative",
      en: "Leadership and Associative Governance",
    },
    format: { fr: "Ouvrage imprimé · 210 pages", en: "Print book · 210 pages" },
    price: "12 000 FCFA",
    text: {
      fr: "Diriger une organisation professionnelle : statuts, mandats, plaidoyer et redevabilité.",
      en: "Leading a professional organisation: statutes, mandates, advocacy and accountability.",
    },
  },
];

export const trainings: {
  title: LocalizedText;
  duration: LocalizedText;
  mode: LocalizedText;
  text: LocalizedText;
}[] = [
  {
    title: { fr: "Conception de machines agroalimentaires", en: "Agri-food machine design" },
    duration: { fr: "6 semaines", en: "6 weeks" },
    mode: { fr: "Présentiel — Cotonou", en: "In person — Cotonou" },
    text: {
      fr: "Du cahier des charges au prototype : dimensionnement, matériaux, sécurité et essais.",
      en: "From specification to prototype: sizing, materials, safety and testing.",
    },
  },
  {
    title: { fr: "Soudure et chaudronnerie avancées", en: "Advanced welding and boilermaking" },
    duration: { fr: "4 semaines", en: "4 weeks" },
    mode: { fr: "Atelier pratique", en: "Hands-on workshop" },
    text: {
      fr: "Techniques de soudage, contrôle qualité et normes applicables aux équipements industriels.",
      en: "Welding techniques, quality control and standards for industrial equipment.",
    },
  },
  {
    title: { fr: "Gestion d'entreprise artisanale", en: "Managing a craft business" },
    duration: { fr: "3 jours", en: "3 days" },
    mode: { fr: "Présentiel & en ligne", en: "In person & online" },
    text: {
      fr: "Comptabilité simplifiée, devis, fiscalité et accès au financement.",
      en: "Simplified accounting, quotations, taxation and access to financing.",
    },
  },
  {
    title: {
      fr: "Leadership pour dirigeants d'organisations",
      en: "Leadership for organisation leaders",
    },
    duration: { fr: "2 jours", en: "2 days" },
    mode: { fr: "Séminaire", en: "Seminar" },
    text: {
      fr: "Gouvernance, prise de parole, négociation et représentation institutionnelle.",
      en: "Governance, public speaking, negotiation and institutional representation.",
    },
  },
];

export const news: {
  date: string;
  category: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
}[] = [
  {
    date: "2026-06-18",
    category: { fr: "Artisanat", en: "Craft sector" },
    title: {
      fr: "Vers une nouvelle charte de l'artisanat béninois",
      en: "Towards a new charter for Benin's craft sector",
    },
    excerpt: {
      fr: "Les corps de métiers appellent à une reconnaissance officielle des qualifications professionnelles.",
      en: "Trade bodies are calling for official recognition of professional qualifications.",
    },
  },
  {
    date: "2026-04-02",
    category: { fr: "Industrie", en: "Industry" },
    title: {
      fr: "Nouvelle ligne de transformation du manioc livrée",
      en: "New cassava processing line delivered",
    },
    excerpt: {
      fr: "Une unité complète conçue localement, pensée pour la maintenance et les pièces disponibles sur place.",
      en: "A complete locally engineered unit, designed around maintainability and locally available parts.",
    },
  },
  {
    date: "2026-01-27",
    category: { fr: "Communauté", en: "Community" },
    title: {
      fr: "Agla Petit Château : un plan de quartier participatif",
      en: "Agla Petit Château: a participatory district plan",
    },
    excerpt: {
      fr: "Assainissement, sécurité et jeunesse au cœur des priorités définies avec les habitants.",
      en: "Sanitation, safety and youth at the heart of priorities defined with residents.",
    },
  },
];

export const shopItems: {
  title: LocalizedText;
  type: LocalizedText;
  price: string;
}[] = [
  {
    title: { fr: "Pack Artisan Entrepreneur", en: "Artisan Entrepreneur Pack" },
    type: { fr: "3 ebooks + modèles de devis", en: "3 ebooks + quotation templates" },
    price: "12 000 FCFA",
  },
  {
    title: { fr: "Guide de l'artisan entrepreneur", en: "The Artisan Entrepreneur's Guide" },
    type: { fr: "Ebook PDF", en: "PDF ebook" },
    price: "5 000 FCFA",
  },
  {
    title: {
      fr: "Formation en ligne : gestion d'atelier",
      en: "Online course: workshop management",
    },
    type: { fr: "Formation vidéo · 12 modules", en: "Video course · 12 modules" },
    price: "25 000 FCFA",
  },
  {
    title: { fr: "Plans techniques : presse hydraulique", en: "Technical plans: hydraulic press" },
    type: { fr: "Produit numérique · PDF + DWG", en: "Digital product · PDF + DWG" },
    price: "18 000 FCFA",
  },
];
