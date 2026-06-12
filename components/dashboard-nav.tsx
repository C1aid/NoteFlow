"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSubscriptionLabel, useUserStore } from "@/store/user-store";

const navItems = [
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const profile = useUserStore((s) => s.profile);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/notes" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            NoteFlow
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={pathname.startsWith(href) ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-2")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {getSubscriptionLabel(profile.subscription_tier)} plan
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
