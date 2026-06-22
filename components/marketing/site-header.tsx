"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
] as const;

type SiteHeaderProps = {
  overlapHero?: boolean;
};

export function SiteHeader({ overlapHero = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const shellClass =
    "fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6 md:px-12 lg:px-16";

  const barClass =
    "site-header-bar liquid-glass relative flex items-center justify-between rounded-xl px-4 py-2";

  const navLinkClass =
    "text-sm text-white transition-smooth hover:text-gray-300";

  const ctaClass =
    "rounded-md bg-white px-6 py-2 text-sm font-medium text-black transition-smooth hover:bg-gray-100";

  return (
    <>
      <header className={cn(shellClass, "hidden md:block")}>
        <div className={barClass}>
          <Link
            href="/"
            className="select-none text-2xl font-semibold tracking-tight text-white"
          >
            DevTalk
          </Link>

          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a key={href} href={href} className={navLinkClass}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link href="/login" className={navLinkClass}>
              Sign in
            </Link>
            <Link href="/signup" className={ctaClass}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-[opacity,visibility] duration-300 md:hidden",
          menuOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
        )}
        style={{ transitionTimingFunction: "var(--ease-smooth)" }}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      <header className={cn(shellClass, "md:hidden")}>
        <div className="relative">
          <div className={barClass}>
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-white"
              onClick={closeMenu}
            >
              DevTalk
            </Link>

            <button
              type="button"
              className={cn(
                "rounded-xl p-2 text-white transition-smooth",
                menuOpen ? "bg-white/10" : "hover:bg-white/10",
              )}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          <div
            className={cn(
              "absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 origin-top transition-[opacity,transform,visibility] duration-300",
              menuOpen
                ? "visible pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "invisible pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
            )}
            style={{ transitionTimingFunction: "var(--ease-smooth)" }}
            aria-hidden={!menuOpen}
          >
            <div className="liquid-glass overflow-hidden rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
              <nav className="px-3 pb-1 pt-2">
                {navLinks.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="group flex items-center justify-between rounded-xl px-3 py-3.5 transition-smooth hover:bg-white/[0.06] active:bg-white/[0.08]"
                    onClick={closeMenu}
                  >
                    <span className="text-[17px] font-medium tracking-tight text-white">
                      {label}
                    </span>
                    <ArrowRight
                      className="size-4 text-white/25 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white/60"
                      aria-hidden
                    />
                  </a>
                ))}
              </nav>

              <div className="space-y-2.5 p-4 pt-0">
                <Link
                  href="/signup"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-[15px] font-medium text-black transition-smooth hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  className="liquid-glass flex h-12 w-full items-center justify-center rounded-xl border border-white/15 text-[15px] font-medium text-white transition-smooth hover:bg-white/[0.06]"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {!overlapHero && <div className="h-20 sm:h-24 md:h-28" aria-hidden />}
    </>
  );
}
