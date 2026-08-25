import React from "react";
import { IconCheck } from "@tabler/icons-react";

import "./pricing-card.css";

type PricingCardProps = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  /** Tints the card with the brand accent and promotes the CTA. */
  featured?: boolean;
  badge?: string;
  ctaLabel?: string;
  onSelect?: () => void;
};

function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  featured = false,
  badge = "Most popular",
  ctaLabel = "Get started",
  onSelect,
}: PricingCardProps) {
  return (
    <article
      className={`pricing-card flex w-full max-w-sm flex-col gap-6 rounded-2xl border p-6 ${
        featured
          ? "bg-[var(--brand-bg-subtle)] border-[var(--brand-border)]"
          : "bg-[var(--gray-bg-subtle)] border-[var(--gray-border-subtle)]"
      }`}
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[var(--gray-text-high)] text-base font-medium">
            {name}
          </h3>
          {featured && (
            <span className="rounded-full bg-[var(--brand-solid)] px-2.5 py-1 text-xs font-medium text-[var(--brand-on-solid)]">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--gray-text-low)]">{description}</p>
      </header>

      <p className="flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-[var(--gray-text-high)]">
          {price}
        </span>
        <span className="text-sm text-[var(--gray-text-low)]">{period}</span>
      </p>

      <button
        type="button"
        onClick={onSelect}
        className={
          featured
            ? "rounded-lg bg-[var(--brand-solid)] px-4 py-2.5 text-sm font-medium text-[var(--brand-on-solid)] transition-colors hover:bg-[var(--brand-solid-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-border-hover)]"
            : "rounded-lg border border-[var(--gray-border)] bg-[var(--gray-ui)] px-4 py-2.5 text-sm font-medium text-[var(--gray-text-high)] transition-colors hover:bg-[var(--gray-ui-hover)] active:bg-[var(--gray-ui-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gray-border-hover)]"
        }
      >
        {ctaLabel}
      </button>

      <div
        className={`h-px w-full ${
          featured
            ? "bg-[var(--brand-border-subtle)]"
            : "bg-[var(--gray-border-subtle)]"
        }`}
        aria-hidden="true"
      />

      <ul className="flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <IconCheck
              className="mt-0.5 size-4 shrink-0 text-[var(--brand-text-low)]"
              stroke={2.5}
              aria-hidden="true"
            />
            <span className="text-[var(--gray-text-high)]">{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default PricingCard;
