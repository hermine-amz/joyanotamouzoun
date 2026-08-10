import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string | null;
}) {
  return (
    <section className="surface-navy relative overflow-hidden">
      {image && (
        <>
          <img src={image} alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-35" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-r from-navy-deep via-navy-deep/85 to-navy-deep/40" />
        </>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
        <p className="eyebrow animate-soft-fade text-accent">{eyebrow}</p>
        <h1 className="animate-rise mt-4 max-w-3xl text-4xl leading-tight text-ivory md:text-5xl">{title}</h1>
        <span className="gold-rule mt-6" />
        <p className="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-ivory/70">{description}</p>
      </div>
    </section>
  );
}


export function Section({
  children,
  className = "",
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "muted" | "navy";
}) {
  const tones = {
    light: "bg-background",
    muted: "bg-secondary",
    navy: "surface-navy",
  } as const;
  return (
    <section className={`${tones[tone]} ${className}`}>
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">{children}</div>
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  invert?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className={`eyebrow ${invert ? "text-accent" : "text-accent"}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-3xl md:text-4xl ${invert ? "text-ivory" : "text-foreground"}`}>{title}</h2>
      <span className="gold-rule mt-5" />
    </div>
  );
}
