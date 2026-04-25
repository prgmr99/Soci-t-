import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type Tone = "paper" | "paper-soft" | "ink";

type SectionFrameProps<T extends ElementType = "section"> = {
  as?: T;
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: Tone;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "id" | "children" | "className">;

const toneClasses: Record<Tone, string> = {
  paper: "bg-paper text-ink",
  "paper-soft": "bg-paper-soft text-ink",
  ink: "bg-ink text-paper",
};

export function SectionFrame<T extends ElementType = "section">({
  as,
  id,
  children,
  className = "",
  tone = "paper",
  ...props
}: SectionFrameProps<T>) {
  const Tag = (as ?? "section") as ElementType;
  const classes = [
    "w-full px-6 py-20 md:px-12 lg:px-16",
    toneClasses[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag id={id} className={classes} {...props}>
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </Tag>
  );
}
