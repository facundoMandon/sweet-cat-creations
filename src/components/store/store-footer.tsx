import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Music2, MessageCircle, Twitter } from "lucide-react";
import { brand, content } from "@/config";

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  whatsapp: MessageCircle,
  x: Twitter,
} as const;

export function StoreFooter() {
  return (
    <footer className="mt-20 border-t-2 border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src={brand.assets.logo} alt="" className="size-10 object-contain" />
          <div>
            <p className="font-display text-lg font-extrabold">{brand.name}</p>
            <p className="text-sm text-muted-foreground">
              {content.footer.tagline}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-foreground/70">
          {content.footer.nav.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          {brand.social.map((s) => {
            const Icon = SOCIAL_ICONS[s.id];
            return (
              <a
                key={s.id}
                href={s.href}
                aria-label={s.label}
                className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
      </div>
      <div className="border-t-2 border-border/60 py-4 text-center text-xs text-muted-foreground">
        {content.footer.copyright.replace(
          "%s",
          `${new Date().getFullYear()} ${brand.name}`,
        )}
      </div>
    </footer>
  );
}
