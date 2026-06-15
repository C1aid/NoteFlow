"use client";

import { UserAvatar } from "@/components/user-avatar";
import type { ThreadSummary } from "@/lib/chat/queries";
import { formatLastReplyLabel } from "@/lib/chat/format";

type ThreadSummaryBarProps = {
  thread: ThreadSummary;
  onOpen: () => void;
};

export function ThreadSummaryBar({ thread, onOpen }: ThreadSummaryBarProps) {
  const replyLabel =
    thread.reply_count === 1 ? "1 reply" : `${thread.reply_count} replies`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-2 flex w-full items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-left transition-smooth hover:border-sky-500/35 hover:bg-sky-500/10"
    >
      <div className="flex -space-x-2">
        {thread.participants.map((participant) => (
          <UserAvatar
            key={participant.id}
            profile={participant}
            className="size-6 rounded-md ring-2 ring-black"
            fallbackClassName="text-[10px]"
          />
        ))}
      </div>

      <span className="text-sm font-medium text-sky-400">{replyLabel}</span>
      <span className="text-sm text-gray-500">
        {formatLastReplyLabel(thread.last_reply_at)}
      </span>
    </button>
  );
}
