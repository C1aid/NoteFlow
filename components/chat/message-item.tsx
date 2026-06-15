"use client";

import { MessageSquare, Smile } from "lucide-react";
import { useState } from "react";
import { MessageContent } from "@/components/chat/message-content";
import { ThreadSummaryBar } from "@/components/chat/thread-summary-bar";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import type { MessageWithAuthor } from "@/lib/chat/queries";
import type { UserProfileSummary } from "@/components/chat/user-profile-panel";
import { formatMessageTime, isMessageEdited } from "@/lib/chat/format";
import { getDisplayName } from "@/lib/profile/display";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🚀"];

type MessageItemProps = {
  message: MessageWithAuthor;
  currentUserId?: string;
  onOpenThread?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onAuthorClick?: (author: UserProfileSummary) => void;
  compact?: boolean;
};

export function MessageItem({
  message,
  currentUserId,
  onOpenThread,
  onToggleReaction,
  onAuthorClick,
  compact = false,
}: MessageItemProps) {
  const [showPicker, setShowPicker] = useState(false);
  const author = message.author ?? {
    id: "",
    email: "unknown@devtalk.app",
    display_name: null,
    avatar_url: null,
  };
  const displayName = getDisplayName(author);
  const edited = isMessageEdited(message.created_at, message.updated_at);

  const grouped = (message.reactions ?? []).reduce<
    Record<string, { count: number; reacted: boolean }>
  >((acc, r) => {
    const entry = acc[r.emoji] ?? { count: 0, reacted: false };
    entry.count += 1;
    if (r.user_id === currentUserId) entry.reacted = true;
    acc[r.emoji] = entry;
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg px-2 py-1.5 transition-smooth hover:bg-white/[0.03] sm:px-3",
        compact && "py-1",
      )}
    >
      <button
        type="button"
        onClick={() => onAuthorClick?.(author)}
        className={cn(
          "mt-0.5 shrink-0 rounded-lg transition-smooth",
          onAuthorClick && "hover:opacity-80",
        )}
        disabled={!onAuthorClick}
      >
        <UserAvatar profile={author} className="size-9 rounded-lg" />
      </button>

      <div className="min-w-0 flex-1 pr-8 sm:pr-10">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <button
            type="button"
            onClick={() => onAuthorClick?.(author)}
            disabled={!onAuthorClick}
            className={cn(
              "text-[15px] font-bold text-white",
              onAuthorClick && "cursor-pointer hover:underline",
            )}
          >
            {displayName}
          </button>
          <span className="text-xs text-gray-500">
            {formatMessageTime(message.created_at)}
          </span>
          {edited && <span className="text-xs text-gray-500">(edited)</span>}
        </div>

        <div className="mt-0.5 text-[15px] leading-relaxed text-gray-100">
          <MessageContent content={message.content} />
        </div>

        {Object.keys(grouped).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(grouped).map(([emoji, { count, reacted }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onToggleReaction?.(message.id, emoji)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-smooth",
                  reacted
                    ? "border-sky-500/40 bg-sky-500/15 text-white"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20",
                )}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            ))}
          </div>
        )}

        {!compact && onOpenThread && message.thread && (
          <ThreadSummaryBar
            thread={message.thread}
            onOpen={() => onOpenThread(message.id)}
          />
        )}

        {!compact && onOpenThread && !message.thread && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 rounded-lg px-2 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenThread(message.id)}
          >
            <MessageSquare className="mr-1 size-3.5" />
            Reply in thread
          </Button>
        )}
      </div>

      <div className="absolute right-1 top-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:right-2 sm:top-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
          onClick={() => setShowPicker((v) => !v)}
        >
          <Smile className="size-4" />
        </Button>
        {showPicker && (
          <div className="glass-card absolute right-0 top-9 z-10 flex gap-0.5 p-1.5">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-lg p-1.5 text-base transition-smooth hover:bg-white/10"
                onClick={() => {
                  onToggleReaction?.(message.id, emoji);
                  setShowPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
