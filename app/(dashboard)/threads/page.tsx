"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MessageContent } from "@/components/chat/message-content";
import { UserAvatar } from "@/components/user-avatar";
import type { MessageWithAuthor } from "@/lib/chat/queries";
import { getDisplayName } from "@/lib/profile/display";
import { dmChatPath, workspaceChannelPath } from "@/lib/workspace/paths";
import { formatRelativeTime } from "@/lib/utils";

type ThreadMessage = MessageWithAuthor & {
  reply_count?: number;
  channel?: {
    id: string;
    name: string;
    kind: string;
    workspace?: { slug: string } | null;
  };
};

function threadHref(thread: ThreadMessage) {
  if (thread.channel?.kind === "dm") {
    return `${dmChatPath(thread.channel_id)}?thread=${thread.id}`;
  }

  const slug = thread.channel?.workspace?.slug;
  if (slug) {
    return `${workspaceChannelPath(slug, thread.channel_id)}?thread=${thread.id}`;
  }

  return `/channels/${thread.channel_id}?thread=${thread.id}`;
}

export default function ThreadsPage() {
  const [threads, setThreads] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/threads")
      .then((r) => r.json())
      .then((data) => setThreads(data as ThreadMessage[]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <PageHeader
        title="Threads"
        description="All conversations with replies across your channels."
        icon={MessagesSquare}
      />

      <div className="glass-card mt-6 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : threads.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No threads yet. Reply to a message in any channel to start one.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link
                  href={threadHref(thread)}
                  className="block px-4 py-4 transition-smooth hover:bg-white/5"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {thread.channel?.kind === "dm" ? (
                      <span>Direct message</span>
                    ) : (
                      <span>#{thread.channel?.name ?? "channel"}</span>
                    )}
                    <span>·</span>
                    <span>{thread.reply_count} replies</span>
                  </div>
                  <div className="flex gap-3">
                    <UserAvatar
                      profile={
                        thread.author ?? {
                          email: "unknown",
                          display_name: null,
                          avatar_url: null,
                        }
                      }
                      className="size-9"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-white">
                          {thread.author
                            ? getDisplayName(thread.author)
                            : "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(thread.created_at))}
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm text-gray-300">
                        <MessageContent content={thread.content} />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
