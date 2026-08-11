import { useQuery } from "@tanstack/react-query";
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
} from "lucide-react";
import { socialLinksQuery } from "@/lib/site";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  whatsapp: MessageCircle,
  tiktok: Music2,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  site: Globe,
};

/** Liens réseaux sociaux pilotés depuis le tableau de bord. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const { data = [] } = useQuery(socialLinksQuery);
  const links = data.filter((l) => l.enabled && l.url.trim());

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.platform] ?? Globe;
        const label = link.label?.trim() || link.platform;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="flex size-9 items-center justify-center rounded-sm border border-white/15 text-ivory/80 transition-colors hover:border-accent hover:text-accent"
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </div>
  );
}
