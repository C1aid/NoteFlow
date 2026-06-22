"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Reveal, RevealText } from "@/components/landing/motion";
import { PricingVideoBackground } from "@/components/landing/pricing-video-background";
import { Button } from "@/components/ui/button";
import {
  PRO_PRICE_MONTHLY,
  PRO_PRICE_YEARLY,
  type BillingInterval,
  getProYearlyMonthlyEquivalent,
  getProYearlySavingsPercent,
} from "@/lib/types/database";
import { cn } from "@/lib/utils";
type FeatureRow = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  business: boolean | string;
};

const compareFeatures: FeatureRow[] = [
  { label: "Message history", free: "90 days", pro: "Unlimited", business: "Unlimited" },
  { label: "Channels", free: "Up to 10", pro: "Unlimited", business: "Unlimited" },
  { label: "Threads & reactions", free: true, pro: true, business: true },
  { label: "Markdown & code blocks", free: true, pro: true, business: true },
  { label: "GitHub link previews", free: true, pro: true, business: true },
  { label: "Full-text search", free: "90-day window", pro: "Unlimited", business: "Unlimited" },
  { label: "Priority support", free: false, pro: true, business: true },
  { label: "SSO / SCIM", free: false, pro: false, business: "Contact sales" },
];

type ComparePlanId = "free" | "pro" | "business";

const comparePlanNames: { id: ComparePlanId; name: string }[] = [
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "business", name: "Business+" },
];

const compareGridCols =
  "grid grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] items-center";

function planColumnClass(planId: ComparePlanId) {
  return cn(
    "h-full px-4 py-4 sm:px-5 sm:py-[1.125rem]",
    planId === "free" && "bg-white/[0.02]",
    planId === "pro" && "bg-sky-400/[0.06]",
    planId === "business" && "bg-white/[0.02]",
  );
}

function CompareCellValue({
  value,
  tone = "muted",
}: {
  value: boolean | string;
  tone?: "muted" | "default" | "strong";
}) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <Check
          className="size-[1.125rem] text-sky-300"
          strokeWidth={2.5}
          aria-label="Included"
        />
      </div>
    );
  }

  if (value === false) {
    return (
      <div className="flex justify-center text-white/20">
        <span className="text-sm leading-none" aria-label="Not included">
          —
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <span
        className={cn(
          "text-center text-sm leading-snug",
          tone === "strong" && "font-medium text-white",
          tone === "default" && "text-white/80",
          tone === "muted" && "text-white/45",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function LiquidGlassSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const columnCount = options.length;

  return (
    <div
      className={cn(
        "liquid-glass relative grid rounded-xl p-1",
        columnCount === 2 && "grid-cols-2",
        columnCount === 3 && "grid-cols-3",
        className,
      )}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 rounded-[10px] bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-transform duration-300 ease-out will-change-transform"
        style={{
          width: `calc(${100 / columnCount}% - 0.375rem)`,
          transform:
            activeIndex === 0
              ? "translateX(0)"
              : `translateX(calc(${activeIndex * 100}% + ${activeIndex * 0.25}rem))`,
        }}
      />

      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 touch-manipulation px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] transition-colors sm:px-6",
              isActive ? "text-white" : "text-white/40 hover:text-white/60",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CompareMobilePlanPicker({
  activePlan,
  onChange,
}: {
  activePlan: ComparePlanId;
  onChange: (plan: ComparePlanId) => void;
}) {
  return (
    <div className="flex justify-center">
      <LiquidGlassSegmentedControl
        className="w-full max-w-md"
        ariaLabel="Compare plan"
        value={activePlan}
        onChange={onChange}
        options={comparePlanNames.map((plan) => ({
          value: plan.id,
          label: plan.name,
        }))}
      />
    </div>
  );
}

function cellTone(planId: ComparePlanId, value: boolean | string): "muted" | "default" | "strong" {
  if (typeof value === "string") {
    return planId === "free" ? "muted" : "strong";
  }
  return planId === "free" ? "default" : "strong";
}

function CompareMobileView() {
  const [activePlan, setActivePlan] = useState<ComparePlanId>("pro");

  return (
    <div className="space-y-4 md:hidden">
      <CompareMobilePlanPicker activePlan={activePlan} onChange={setActivePlan} />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur-sm">
        <ul className="divide-y divide-white/[0.06]">
          {compareFeatures.map((row, index) => (
            <li
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5",
                index % 2 === 1 && "bg-white/[0.015]",
              )}
            >
              <span className="text-sm leading-snug text-white/75">{row.label}</span>
              <CompareCellValue
                value={row[activePlan]}
                tone={cellTone(activePlan, row[activePlan])}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompareDesktopGrid() {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-black/35 backdrop-blur-sm md:block">
      <div className="overflow-x-auto">
        <div className="min-w-[42rem]">
          <div className={cn(compareGridCols, "border-b border-white/10")}>
            <div className="px-6 py-5 text-base font-semibold text-white sm:px-7 sm:py-6">
              Features
            </div>
            {comparePlanNames.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  planColumnClass(plan.id),
                  "text-center text-base font-semibold text-white sm:text-[17px]",
                )}
              >
                {plan.name}
              </div>
            ))}
          </div>

          {compareFeatures.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                compareGridCols,
                "border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.02]",
                index % 2 === 1 && "bg-white/[0.015]",
              )}
            >
              <div className="px-6 py-4 text-sm text-white/75 sm:px-7 sm:py-[1.125rem]">
                {row.label}
              </div>
              {comparePlanNames.map((plan) => (
                <div key={`${row.label}-${plan.id}`} className={planColumnClass(plan.id)}>
                  <CompareCellValue
                    value={row[plan.id]}
                    tone={cellTone(plan.id, row[plan.id])}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <>
      <CompareMobileView />
      <CompareDesktopGrid />
    </>
  );
}

type PlanPricing = {
  amount: string;
  period: string;
  note?: string;
};

type Plan = {
  id: string;
  name: string;
  tagline: string;
  features: string[];
  cta: { label: string; href: string; variant: "primary" | "outline" | "disabled" };
  featured?: boolean;
  stagger: "low" | "high";
  getPricing: (interval: BillingInterval) => PlanPricing;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Full chat for small teams — no card needed",
    features: [
      "Up to 10 channels per workspace",
      "90-day message history & search",
      "Public & private channels, plus DMs",
      "Threads, reactions & Markdown",
      "GitHub link previews & attachments",
    ],
    cta: { label: "Get started free", href: "/signup", variant: "outline" },
    stagger: "low",
    getPricing: () => ({
      amount: "$0",
      period: "per month",
      note: "No credit card required",
    }),
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "When history and channels stop fitting in Free",
    features: [
      "Unlimited channels",
      "Unlimited message history",
      "Full-text search across archive",
      "Voice notes, roles & admin modes",
      "Priority support",
    ],
    cta: { label: "Upgrade to Pro", href: "/signup", variant: "primary" },
    featured: true,
    stagger: "high",
    getPricing: (interval) =>
      interval === "yearly"
        ? {
            amount: `$${getProYearlyMonthlyEquivalent()}`,
            period: "per month",
            note: `$${PRO_PRICE_YEARLY} billed annually · save $${PRO_PRICE_MONTHLY * 12 - PRO_PRICE_YEARLY}/year`,
          }
        : {
            amount: `$${PRO_PRICE_MONTHLY}`,
            period: "per month",
            note: `$${getProYearlyMonthlyEquivalent()}/mo on the annual plan`,
          },
  },
  {
    id: "business",
    name: "Business+",
    tagline: "SSO, contracts, and help rolling out to the org",
    features: [
      "Everything in Pro",
      "SSO / SCIM",
      "Custom contracts & billing",
      "Dedicated onboarding",
      "Direct rollout support",
    ],
    cta: { label: "Contact sales", href: "#", variant: "disabled" },
    stagger: "low",
    getPricing: () => ({
      amount: "Custom",
      period: "talk to us",
      note: "Annual contracts available",
    }),
  },
];

function BillingToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  const isYearly = interval === "yearly";
  const savings = getProYearlySavingsPercent();
  const yearlySavings = PRO_PRICE_MONTHLY * 12 - PRO_PRICE_YEARLY;

  return (
    <div className="flex flex-col items-center gap-3">
      <LiquidGlassSegmentedControl
        ariaLabel="Billing interval"
        value={interval}
        onChange={onChange}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
      />

      <p className="text-center text-[11px] leading-relaxed text-white/35 sm:text-xs">
        {isYearly ? (
          <>
            <span className="line-through text-white/25">${PRO_PRICE_MONTHLY}/mo</span>{" "}
            <span className="text-white/55">${getProYearlyMonthlyEquivalent()}/mo</span>{" "}
            when billed annually
          </>
        ) : (
          <>
            Save {savings}% on Pro with annual billing —{" "}
            <span className="text-white/55">${getProYearlyMonthlyEquivalent()}/mo</span>
            {" "}
            <span className="text-white/30">(${yearlySavings}/yr less)</span>
          </>
        )}
      </p>
    </div>
  );
}

function PricingCard({
  plan,
  interval,
}: {
  plan: Plan;
  interval: BillingInterval;
}) {
  const { name, tagline, features, cta, featured, stagger } = plan;
  const pricing = plan.getPricing(interval);
  const isHigh = stagger === "high";
  const isCustom = pricing.amount === "Custom";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col",
        isHigh ? "md:-mt-6" : "md:mt-6",
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border transition-smooth duration-500",
          featured
            ? "border-white/20 bg-black/40 shadow-[0_0_60px_rgba(56,189,248,0.12)] backdrop-blur-sm"
            : "border-white/10 bg-black/40 backdrop-blur-md hover:border-white/20",
        )}
      >
        {featured && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-500/10 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sky-400/20 blur-3xl"
            />
          </>
        )}

        <div className="relative flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
            </div>
            {featured && (
              <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                Most popular
              </span>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-end gap-2">
              <span
                className={cn(
                  "font-light tracking-tight text-white",
                  isCustom ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl",
                )}
                style={{ letterSpacing: "-0.04em" }}
              >
                {pricing.amount}
              </span>
              {!isCustom && (
                <span className="mb-1.5 text-sm text-white/45">{pricing.period}</span>
              )}
            </div>
            {isCustom && (
              <p className="mt-1 text-sm text-white/45">{pricing.period}</p>
            )}
            {pricing.note && (
              <p className="mt-2 text-xs leading-relaxed text-white/40">{pricing.note}</p>
            )}
          </div>

          <div className="my-6 border-t border-white/[0.08]" />

          <div className="flex-1">
            <p className="mb-3 text-sm font-medium text-white/70">Features</p>
            <ul className="space-y-2.5">
              {features.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-snug text-gray-300">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      featured ? "text-sky-300" : "text-primary",
                    )}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7">
            {cta.variant === "primary" && (
              <Link
                href={cta.href}
                className="btn-brand flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
              >
                {cta.label}
                <ArrowRight className="size-4" />
              </Link>
            )}
            {cta.variant === "outline" && (
              <Link
                href={cta.href}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-sm font-semibold text-white transition-smooth hover:border-white/25 hover:bg-white/[0.08]"
              >
                {cta.label}
              </Link>
            )}
            {cta.variant === "disabled" && (
              <Button
                disabled
                variant="outline"
                className="h-11 w-full cursor-not-allowed rounded-xl border-white/10 opacity-50"
              >
                {cta.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingTable() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden border-y border-white/8 py-12 sm:py-16 md:py-24 lg:py-32"
    >
      <PricingVideoBackground />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            <RevealText
              as="span"
              text="One price for the whole team"
              wordDelay={65}
            />
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Start on Free with full messaging. Go Pro when you need more channels
            or a searchable archive — flat rate, no per-seat fees.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 max-w-6xl sm:mt-14">
          <Reveal safe delay={60} className="relative z-20 mb-10 flex justify-center sm:mb-12">
            <BillingToggle interval={billingInterval} onChange={setBillingInterval} />
          </Reveal>

          <div className="relative z-10 grid gap-5 md:grid-cols-3 md:items-end md:gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <Reveal key={plan.id} delay={index * 90} y={32}>
                <PricingCard plan={plan} interval={billingInterval} />
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal safe delay={120} className="relative z-10 mx-auto mt-14 max-w-6xl sm:mt-20">
          <div className="mx-auto mb-8 max-w-xl text-center sm:mb-10">
            <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              What&apos;s included
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Same messaging on every plan — limits are on history, channels,
              and admin tools.
            </p>
          </div>
          <ComparisonTable />
        </Reveal>
      </div>
    </section>
  );
}
