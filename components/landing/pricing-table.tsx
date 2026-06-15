"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PricingVideoBackground } from "@/components/landing/pricing-video-background";
import { Button } from "@/components/ui/button";
import { PRO_PRICE_MONTHLY } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type FeatureRow = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  business: boolean | string;
};

const features: FeatureRow[] = [
  { label: "Message history", free: "90 days", pro: "Unlimited", business: "Unlimited" },
  { label: "Channels", free: "Up to 10", pro: "Unlimited", business: "Unlimited" },
  { label: "Threads & reactions", free: true, pro: true, business: true },
  { label: "Markdown & code blocks", free: true, pro: true, business: true },
  { label: "GitHub link previews", free: true, pro: true, business: true },
  { label: "Full-text search", free: "90-day window", pro: "Unlimited", business: "Unlimited" },
  { label: "Priority support", free: false, pro: true, business: true },
  { label: "SSO / SCIM", free: false, pro: false, business: "Contact sales" },
];

function FeatureCell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <Check
        className={cn(
          "mx-auto size-4",
          highlight ? "text-white" : "text-primary",
        )}
      />
    );
  }
  if (value === false) {
    return <Minus className="mx-auto size-4 text-muted-foreground/40" />;
  }
  return (
    <span
      className={cn(
        "text-xs sm:text-sm",
        highlight ? "font-medium text-white" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function PricingTable() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-y border-white/8 py-16 md:py-24 lg:py-32"
    >
      <PricingVideoBackground />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Choose the plan that&apos;s right for your team
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you need unlimited history and channels.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:mt-16 sm:gap-6 lg:grid-cols-3">
          <div className="glass-card flex flex-col p-6 sm:p-8">
            <p className="text-lg font-semibold text-white">Free</p>
            <p className="mt-1 text-sm text-muted-foreground">
              For small teams getting started
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                $0
              </span>
              <span className="text-sm text-muted-foreground">USD / month</span>
            </div>
            <Link
              href="/signup"
              className="btn-brand-outline mt-8 flex h-11 w-full items-center justify-center rounded-md text-sm font-semibold"
            >
              Get started
            </Link>
          </div>

          <div className="glass-card relative flex flex-col border-primary/30 p-6 ring-1 ring-primary/25 sm:p-8">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-black">
              Recommended
            </span>
            <p className="text-lg font-semibold text-white">Pro</p>
            <p className="mt-1 text-sm text-muted-foreground">For growing dev teams</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                ${PRO_PRICE_MONTHLY}
              </span>
              <span className="text-sm text-muted-foreground">USD / month</span>
            </div>
            <Link
              href="/signup"
              className="btn-brand mt-8 flex h-11 w-full items-center justify-center rounded-md text-sm font-semibold"
            >
              Upgrade
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Stripe test mode — no real charge
            </p>
          </div>

          <div className="glass-card flex flex-col p-6 sm:p-8">
            <p className="text-lg font-semibold text-white">Business+</p>
            <p className="mt-1 text-sm text-muted-foreground">
              For larger organizations
            </p>
            <div className="mt-6">
              <p className="text-base font-medium text-white sm:text-lg">
                Contact sales for pricing
              </p>
            </div>
            <Button
              variant="outline"
              className="btn-brand-outline mt-8 h-11 w-full cursor-not-allowed opacity-60"
              disabled
            >
              Contact Sales
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl space-y-3 md:hidden">
          {features.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="mb-3 text-sm font-medium text-white">{row.label}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Free
                  </p>
                  <FeatureCell value={row.free} />
                </div>
                <div className="rounded-lg bg-white/[0.04] py-1">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Pro
                  </p>
                  <FeatureCell value={row.pro} highlight />
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Business+
                  </p>
                  <FeatureCell value={row.business} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card mx-auto mt-10 hidden max-w-6xl overflow-hidden sm:mt-16 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium text-muted-foreground">Features</th>
                  <th className="p-4 text-center font-semibold text-white">Free</th>
                  <th className="p-4 text-center font-semibold text-white">Pro</th>
                  <th className="p-4 text-center font-semibold text-white">Business+</th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-b border-white/5 last:border-0",
                      i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]",
                    )}
                  >
                    <td className="p-4 font-medium text-white/90">{row.label}</td>
                    <td className="p-4 text-center">
                      <FeatureCell value={row.free} />
                    </td>
                    <td className="p-4 text-center bg-white/[0.03]">
                      <FeatureCell value={row.pro} highlight />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={row.business} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
