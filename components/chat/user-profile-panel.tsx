"use client";

import {
  ChevronDown,
  Clock,
  Headphones,
  Loader2,
  Mail,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useToast } from "@/hooks/use-toast";
import { getDisplayName } from "@/lib/profile/display";
import { formatProfileLocalTime } from "@/lib/profile/local-time";
import type { Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export type UserProfileSummary = Pick<
  Profile,
  "id" | "email" | "display_name" | "avatar_url"
>;

type UserProfilePanelProps = {
  profile: UserProfileSummary;
  currentUserId?: string;
  onMessage: (userId: string) => Promise<void>;
  className?: string;
};

function ProfileStatus({ isSelf }: { isSelf: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          isSelf ? "bg-emerald-400" : "bg-gray-500",
        )}
      />
      <span>{isSelf ? "Online" : "Workspace member"}</span>
    </div>
  );
}

function useLiveLocalTime(enabled: boolean) {
  const [label, setLabel] = useState(() => formatProfileLocalTime());

  useEffect(() => {
    if (!enabled) return;
    setLabel(formatProfileLocalTime());
    const id = window.setInterval(() => setLabel(formatProfileLocalTime()), 30_000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return label;
}

export function UserProfilePanel({
  profile,
  currentUserId,
  onMessage,
  className,
}: UserProfilePanelProps) {
  const { toast } = useToast();
  const [isStartingDm, setIsStartingDm] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const displayName = getDisplayName(profile);
  const isSelf = profile.id === currentUserId;
  const localTime = useLiveLocalTime(isSelf);

  const handleMessage = async () => {
    setIsStartingDm(true);
    try {
      await onMessage(profile.id);
    } finally {
      setIsStartingDm(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast({ title: "Email copied" });
    } catch {
      toast({
        title: "Could not copy",
        description: "Copy the address manually.",
        variant: "destructive",
      });
    }
    setShowMore(false);
  };

  return (
    <div className={cn("flex min-w-0 flex-col overflow-x-hidden px-4 py-5", className)}>
      <div className="flex justify-center">
        <UserAvatar
          profile={profile}
          className="size-28 rounded-2xl ring-1 ring-white/10"
          fallbackClassName="text-2xl font-bold bg-white text-black"
        />
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
        {displayName}
      </h2>

      <div className="mt-2 space-y-1.5">
        <ProfileStatus isSelf={isSelf} />
        {isSelf && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="size-4 shrink-0 text-gray-500" />
            <span>{localTime}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2">
        {isSelf ? (
          <Button
            asChild
            variant="outline"
            className="h-10 min-w-0 flex-1 rounded-xl border-white/15 bg-white/5 px-3 text-white hover:bg-white/10"
          >
            <Link href="/settings">
              <MessageSquare className="size-4 shrink-0" />
              <span className="truncate">Edit profile</span>
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-10 min-w-0 flex-1 rounded-xl border-white/15 bg-white/5 px-3 text-white hover:bg-white/10"
            disabled={isStartingDm}
            onClick={() => void handleMessage()}
          >
            {isStartingDm ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <MessageSquare className="size-4 shrink-0" />
            )}
            <span className="truncate">Message</span>
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          className="h-10 min-w-0 flex-1 rounded-xl border-white/15 bg-white/5 px-3 text-white hover:bg-white/10"
          onClick={() =>
            toast({
              title: "Coming soon",
              description: "Voice huddles will be available in a future update.",
            })
          }
        >
          <Headphones className="size-4 shrink-0" />
          <span className="truncate">Huddle</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" />
        </Button>

        <div className="relative shrink-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setShowMore((v) => !v)}
          >
            <MoreVertical className="size-4" />
          </Button>

          {showMore && (
            <div className="glass-card absolute right-0 top-11 z-20 min-w-40 p-1">
              <button
                type="button"
                className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-smooth hover:bg-white/10"
                onClick={() => void copyEmail()}
              >
                Copy email
              </button>
              {!isSelf && (
                <button
                  type="button"
                  className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-smooth hover:bg-white/10"
                  onClick={() => {
                    setShowMore(false);
                    void handleMessage();
                  }}
                >
                  Send message
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold text-white">Contact information</h3>

        <div className="mt-4 flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Mail className="size-4 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Email address</p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-0.5 block break-all text-sm text-sky-400 hover:text-sky-300 hover:underline"
            >
              {profile.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
