"use client";

import { Hash, Lock, Plus, Search, Star, User } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChannelHeaderProps = {
  title: string;
  description?: string | null;
  email?: string | null;
  isDm?: boolean;
  isPrivate?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

const channelTabs: Array<{
  id: string;
  label: string;
  href?: string;
  active?: boolean;
}> = [
  { id: "messages", label: "Messages", active: true },
  { id: "files", label: "Files", href: "/files" },
  { id: "pins", label: "Pins", href: "#" },
];

export function ChannelHeader({
  title,
  description,
  email,
  isDm,
  isPrivate,
  search,
  onSearchChange,
}: ChannelHeaderProps) {
  const ChannelIcon = isDm ? User : isPrivate ? Lock : Hash;

  return (
    <div className="hidden shrink-0 border-b border-white/10 lg:block">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <ChannelIcon className="size-4 shrink-0 text-gray-400" />
          <h1 className="truncate text-base font-bold text-white">{title}</h1>
          {!isDm && <Star className="size-4 shrink-0 text-gray-500" />}
        </div>

        <div className="liquid-glass relative w-56 rounded-xl xl:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages"
            className="h-9 border-0 bg-transparent pl-9 text-sm focus-visible:ring-0"
          />
        </div>
      </div>

      {!isDm && (
        <div className="flex items-center gap-1 px-4 pb-0">
          {channelTabs.map((tab) =>
            tab.href ? (
              <Link
                key={tab.id}
                href={tab.href}
                className="rounded-t-lg px-3 py-2 text-sm font-medium text-gray-400 transition-smooth hover:bg-white/5 hover:text-white"
              >
                {tab.label}
              </Link>
            ) : (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  "rounded-t-lg px-3 py-2 text-sm font-medium transition-smooth",
                  tab.active
                    ? "border-b-2 border-white text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            ),
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 transition-smooth hover:bg-white/5 hover:text-white"
            aria-label="Add tab"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}

      {(description || email) && (
        <div className="border-t border-white/5 px-4 py-2">
          {description && !isDm && (
            <p className="truncate text-xs text-gray-400">{description}</p>
          )}
          {isDm && email && (
            <p className="truncate text-xs text-gray-400">{email}</p>
          )}
        </div>
      )}
    </div>
  );
}
