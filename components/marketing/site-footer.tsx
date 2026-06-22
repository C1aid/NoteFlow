import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Security", href: "/security" },
      { label: "System status", href: "/status" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Docs home", href: "/docs" },
      { label: "Getting started", href: "/docs/getting-started" },
      { label: "Workspaces", href: "/docs/workspaces" },
      { label: "Channels & DMs", href: "/docs/channels-and-dms" },
      { label: "Billing & plans", href: "/docs/billing" },
      { label: "API reference", href: "/docs/api" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact & support", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Sign in", href: "/login" },
      { label: "Create workspace", href: "/signup" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Acceptable use", href: "/acceptable-use" },
      { label: "Data processing", href: "/docs/data-processing" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-black">
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 font-semibold">
              <BrandLogo size="md" />
              DevTalk
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Team chat for developers — channels, threads, code blocks, file
              sharing, and GitHub previews in one workspace.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <Link
                href="/status"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                All systems operational
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {footerSections.map(({ title, links }) => (
              <div key={title}>
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  {title}
                </h3>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="touch-manipulation text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevTalk. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/security" className="hover:text-foreground">
              Security
            </Link>
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
