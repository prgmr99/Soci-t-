import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "default" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsAnchor = ButtonBaseProps & {
  href: string;
  type?: never;
  disabled?: never;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

type ButtonAsButton = ButtonBaseProps & {
  href?: never;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
} & Omit<
    ComponentPropsWithoutRef<"button">,
    "type" | "disabled" | "className" | "children"
  >;

type ButtonProps = ButtonAsAnchor | ButtonAsButton;

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: filled ink on paper. Hover lifts with a visible brass hairline
  // (stroke-only, stays on-brand) instead of an imperceptible color nudge.
  // Active presses back to pure ink. Focus ring uses brass-strong for AA.
  primary:
    "bg-ink text-paper shadow-[inset_0_0_0_1px_transparent] hover:bg-[#1a1a1b] hover:shadow-[inset_0_0_0_1px_rgba(154,125,61,0.6)] active:bg-ink active:shadow-[inset_0_0_0_1px_transparent] focus-visible:ring-brass-strong focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  ghost:
    "bg-transparent text-ink border border-brass hover:bg-brass/10 hover:border-brass-strong active:bg-brass/15 focus-visible:ring-brass-strong focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
};

// Bumped from 14px/500 → 15.2px/600 so the CTA carries weight next to the
// strengthened 17px body copy. 3px radius removes the harsh corner while
// keeping the architectural/editorial silhouette — beyond ~6px reads as
// consumer SaaS.
const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-[3px] tracking-[0.08em] uppercase font-sans font-semibold transition-[background-color,box-shadow,border-color,color] duration-200 outline-none cursor-pointer select-none";

// Default min-h-12 (48px) clears the 44pt touch target. `lg` is for terminal
// CTAs (apply, sign up) where the button has to carry weight against a
// large display-size headline; otherwise the action reads as subordinate.
const sizeClasses: Record<ButtonSize, string> = {
  default: "min-h-12 px-8 py-3.5 text-[0.95rem]",
  lg: "min-h-14 px-12 py-4 text-[1.05rem]",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorProps } = props as ButtonAsAnchor;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { type = "button", disabled, ...buttonProps } = props as ButtonAsButton;
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${classes} disabled:opacity-40 disabled:cursor-not-allowed`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
