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
    <section className="bg-slate-900 relative overflow-hidden border-b border-[#EAE6DF]/10">
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-20"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-slate-900/80"
          />
        </>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-accent/15 blur-[100px]"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-12 md:py-16 text-center flex flex-col items-center">
        <p className="eyebrow animate-soft-fade text-accent">{eyebrow}</p>
        <h1 className="animate-rise mt-4 text-3xl leading-tight text-white md:text-5xl font-display font-medium">
          {title}
        </h1>
        <span className="gold-rule mt-6 mx-auto" />
        <p className="animate-rise mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-300">
          {description}
        </p>
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
      <h2 className={`mt-4 text-3xl md:text-4xl lg:text-5xl font-display font-medium leading-tight ${invert ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      <span className="gold-rule mt-6" />
    </div>
  );
}
