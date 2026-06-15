"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Loader2, Lock, User } from "lucide-react";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { MessageItem } from "@/components/chat/message-item";
import { ChannelHeader } from "@/components/chat/channel-header";
import { ChatSidePanel } from "@/components/chat/chat-side-panel";
import {
  UserProfilePanel,
  type UserProfileSummary,
} from "@/components/chat/user-profile-panel";
import { useToast } from "@/hooks/use-toast";
import type { MessageWithAuthor } from "@/lib/chat/queries";
import type { Channel, Profile } from "@/lib/types/database";
import { getDisplayName } from "@/lib/profile/display";
import { dmChatPath } from "@/lib/workspace/paths";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";
import { debounce } from "@/lib/utils";

type ChannelPageProps = {
  channelId: string;
  initialThreadId?: string | null;
};

export function ChannelChat({ channelId, initialThreadId }: ChannelPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((s) => s.profile);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [dmPeer, setDmPeer] = useState<Pick<
    Profile,
    "id" | "email" | "display_name" | "avatar_url"
  > | null>(null);
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [threadParentId, setThreadParentId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessageWithAuthor[]>([]);
  const [profileUser, setProfileUser] = useState<UserProfileSummary | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const openedThreadRef = useRef<string | null>(null);

  const debouncedSetSearch = useRef(
    debounce((value: string) => setSearch(value), 300),
  ).current;

  useEffect(() => {
    debouncedSetSearch(searchInput);
    return () => debouncedSetSearch.cancel();
  }, [searchInput, debouncedSetSearch]);

  const loadChannel = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("channels")
      .select("*")
      .eq("id", channelId)
      .single();
    const ch = data as Channel | null;
    setChannel(ch);

    if (ch?.kind === "dm" && profile?.id) {
      const { data: members } = await supabase
        .from("channel_members")
        .select("user_id")
        .eq("channel_id", channelId);

      const peerId = members?.find((m) => m.user_id !== profile.id)?.user_id;
      if (peerId) {
        const { data: peer } = await supabase
          .from("profiles")
          .select("id, email, display_name, avatar_url")
          .eq("id", peerId)
          .single();
        setDmPeer(peer);
      }
    } else {
      setDmPeer(null);
    }
  }, [channelId, profile?.id]);

  const loadMessages = useCallback(async () => {
    const params = new URLSearchParams({ channelId });
    if (search.trim()) params.set("q", search.trim());

    const res = await fetch(`/api/messages?${params}`);
    if (res.ok) {
      const data = (await res.json()) as MessageWithAuthor[];
      setMessages(data);
    }
    setIsLoading(false);
  }, [channelId, search]);

  const loadThread = useCallback(async (parentId: string) => {
    const params = new URLSearchParams({ channelId, parentId });
    const res = await fetch(`/api/messages?${params}`);
    if (res.ok) {
      setThreadMessages((await res.json()) as MessageWithAuthor[]);
    }
  }, [channelId]);

  useEffect(() => {
    void loadChannel();
    void loadMessages();
  }, [loadChannel, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openThread = useCallback(
    async (parentId: string) => {
      setProfileUser(null);
      setThreadParentId(parentId);
      await loadThread(parentId);
    },
    [loadThread],
  );

  useEffect(() => {
    if (!initialThreadId || isLoading || openedThreadRef.current === initialThreadId) {
      return;
    }

    const parent = messages.find((message) => message.id === initialThreadId);
    if (!parent) return;

    openedThreadRef.current = initialThreadId;
    void openThread(initialThreadId);
  }, [initialThreadId, isLoading, messages, openThread]);

  useEffect(() => {
    const supabase = createClient();

    const channelSub = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          void loadMessages();
          if (threadParentId) void loadThread(threadParentId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channelSub);
    };
  }, [channelId, loadMessages, loadThread, threadParentId]);

  const sendMessage = async (content: string, parentMessageId?: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, content, parentMessageId }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Failed to send");
    }
    await loadMessages();
    if (parentMessageId) await loadThread(parentMessageId);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const message = [...messages, ...threadMessages].find((m) => m.id === messageId);
    const existing = message?.reactions?.find(
      (r) => r.user_id === profile?.id && r.emoji === emoji,
    );

    if (existing) {
      await fetch(
        `/api/reactions?messageId=${messageId}&emoji=${encodeURIComponent(emoji)}`,
        { method: "DELETE" },
      );
    } else {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
    }

    await loadMessages();
    if (threadParentId) await loadThread(threadParentId);
  };

  const openProfile = (author: UserProfileSummary) => {
    setThreadParentId(null);
    setProfileUser(author);
  };

  const startDm = async (userId: string) => {
    const res = await fetch("/api/dms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = (await res.json()) as { id?: string; error?: string };

    if (!res.ok || !data.id) {
      toast({
        title: "Could not open DM",
        description: data.error ?? "Something went wrong",
        variant: "destructive",
      });
      return;
    }

    setProfileUser(null);
    router.push(dmChatPath(data.id));
  };

  if (!channel && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-muted-foreground">
        Channel not found
      </div>
    );
  }

  const parentMessage = messages.find((m) => m.id === threadParentId);

  const isDm = channel?.kind === "dm";
  const headerTitle = isDm && dmPeer ? getDisplayName(dmPeer) : channel?.name;

  const ChannelIcon = isDm ? User : channel?.visibility === "private" ? Lock : Hash;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="liquid-glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-none lg:rounded-xl">
        <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <ChannelHeader
          title={headerTitle ?? ""}
          description={channel?.description}
          email={dmPeer?.email}
          isDm={isDm}
          isPrivate={channel?.visibility === "private"}
          search={searchInput}
          onSearchChange={setSearchInput}
        />

        <div className="relative flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-4 sm:py-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
                  <div className="glass-card max-w-sm px-6 py-8">
                    <div className="liquid-glass mx-auto flex size-12 items-center justify-center rounded-xl">
                      <ChannelIcon className="size-5 text-white/80" />
                    </div>
                    <p className="mt-4 text-lg font-semibold tracking-tight text-white">
                      {isDm
                        ? `Message ${headerTitle}`
                        : `Welcome to #${channel?.name}`}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      This is the start of the channel. Say hello — Markdown and
                      code blocks are supported.
                    </p>
                  </div>
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  currentUserId={profile?.id}
                  onOpenThread={openThread}
                  onToggleReaction={toggleReaction}
                  onAuthorClick={openProfile}
                />
              )}
              <div ref={bottomRef} />
            </div>

            <MessageInput onSend={(content) => sendMessage(content)} />
          </div>

          {threadParentId && parentMessage && (
          <ChatSidePanel
            title="Thread"
            onClose={() => setThreadParentId(null)}
            footer={
              <MessageInput
                isThread
                channelName={channel?.name}
                placeholder="Reply…"
                onSend={(content) => sendMessage(content, threadParentId)}
                onAlsoSendToChannel={(content) => sendMessage(content)}
              />
            }
          >
            <div className="p-2">
              <MessageItem
                message={parentMessage}
                currentUserId={profile?.id}
                onToggleReaction={toggleReaction}
                onAuthorClick={openProfile}
                compact
              />
              <div className="my-2 border-t border-white/10" />
              <MessageList
                messages={threadMessages}
                currentUserId={profile?.id}
                onToggleReaction={toggleReaction}
                onAuthorClick={openProfile}
                compact
              />
            </div>
          </ChatSidePanel>
        )}

        {profileUser && (
          <ChatSidePanel
            title="Profile"
            size="wide"
            onClose={() => setProfileUser(null)}
          >
            <UserProfilePanel
              profile={profileUser}
              currentUserId={profile?.id}
              onMessage={startDm}
            />
          </ChatSidePanel>
          )}
        </div>
      </div>
    </div>
  );
}
