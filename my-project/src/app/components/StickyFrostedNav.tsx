import type { ElementType, ReactNode } from "react";

export interface StickyFrostedNavProps {
  /** Element/tag to render as — defaults to <nav>, use "header" for page chrome. */
  as?: ElementType;
  /** Your actual content: nav links, icons, a search input, a card title, etc. */
  children?: ReactNode;
  /** Blur strength in px for the fade-out region. */
  blur?: number;
  /** Blur + brightness for the thin edge-highlight rim. Set false to omit it. */
  edgeBlur?: number;
  edgeHighlight?: boolean;
  /** Thickness of the edge-highlight rim in px. */
  edgeThickness?: number;
  className?: string;
}

export default function StickyFrostedNav({
  as: Tag = "nav",
  children,
  blur = 4,
  edgeBlur = 2,
  edgeHighlight = true,
  edgeThickness = 1,
  className,
}: StickyFrostedNavProps) {
  return (
    <Tag className={`sticky top-0 z-10 ${className ?? ""}`}>
      {/* Blur that fades out via mask-image instead of cutting off hard */}
      <div
        className="pointer-events-none absolute inset-0 h-[200%]"
        style={{
          backdropFilter: `blur(${blur}px) brightness(100%) saturate(10%)`,
          WebkitBackdropFilter: `blur(${blur}px) brightness(100%) saturate(10%)`,
          maskImage:
            "linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0% 50%, transparent 50% 100%)",
        }}
      />

      {/* Thin light rim along the bottom edge, so the panel reads as a
          physical, lit sheet of glass rather than a flat blurred tint. */}
      {edgeHighlight && (
        <div
          className="pointer-events-none absolute inset-0 h-full translate-y-full bg-white/10"
          style={{
            backdropFilter: `blur(${edgeBlur}px) brightness(110%) saturate(120%)`,
            WebkitBackdropFilter: `blur(${edgeBlur}px) brightness(110%) saturate(120%)`,
            maskImage: `linear-gradient(to bottom, black 0, black ${edgeThickness}px, transparent ${edgeThickness}px)`,
            WebkitMaskImage: `linear-gradient(to bottom, black 0, black ${edgeThickness}px, transparent ${edgeThickness}px)`,
          }}
        />
      )}

      {/* Your content, rendered above both layers */}
      <div className="relative">{children}</div>
    </Tag>
  );
}
