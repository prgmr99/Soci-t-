import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

// Minimal cn utility — no external dep needed
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Generic polymorphic helper ──────────────────────────────────────────────

type TypoProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

// ─── Display ─────────────────────────────────────────────────────────────────

function Display<T extends ElementType = "h1">({
  as,
  children,
  className,
  ...props
}: TypoProps<T>) {
  const Tag = (as ?? "h1") as ElementType;
  return (
    <Tag
      className={cn(
        // break-keep (word-break: keep-all) prevents Korean suffixes like
        // "겠습니까" from splitting across lines. leading-[1.1] gives Korean
        // glyphs (no x-height vs cap-height distinction) enough vertical room
        // when a heading wraps onto two lines.
        "break-keep font-serif text-[clamp(2.25rem,4vw+0.75rem,4.5rem)] leading-[1.1] tracking-[-0.02em]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────

function Title<T extends ElementType = "h2">({
  as,
  children,
  className,
  ...props
}: TypoProps<T>) {
  const Tag = (as ?? "h2") as ElementType;
  return (
    <Tag
      className={cn(
        "break-keep font-serif text-[clamp(1.5rem,2.5vw+0.5rem,2.5rem)] leading-[1.2] tracking-[-0.01em]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

function Body<T extends ElementType = "p">({
  as,
  children,
  className,
  ...props
}: TypoProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag
      className={cn(
        // Body copy uses the strengthened muted (~7.5:1 on paper) at a
        // confident 16px base. Line-height 1.7 keeps long paragraphs calm.
        "break-keep font-sans text-[1rem] leading-[1.7] text-muted",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

function Meta<T extends ElementType = "span">({
  as,
  children,
  className,
  ...props
}: TypoProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={cn(
        // Bumped from 10.4px → 11.5px and tightened tracking from 0.18em
        // → 0.14em — small caps stay legible without feeling shouty.
        "font-mono text-[0.72rem] uppercase tracking-[0.14em] text-subtle",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function Quote<T extends ElementType = "blockquote">({
  as,
  children,
  className,
  ...props
}: TypoProps<T>) {
  const Tag = (as ?? "blockquote") as ElementType;
  return (
    <Tag
      className={cn(
        "break-keep font-serif italic text-lg leading-[1.6] text-ink",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ─── Namespace export ─────────────────────────────────────────────────────────

export const Typo = {
  Display,
  Title,
  Body,
  Meta,
  Quote,
};
