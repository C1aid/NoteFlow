import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message, Profile, Reaction } from "@/lib/types/database";
import { getHistoryCutoff, isProTier, type SubscriptionTier } from "@/lib/types/database";

export type ThreadSummary = {
  reply_count: number;
  last_reply_at: string;
  participants: Pick<Profile, "id" | "email" | "display_name" | "avatar_url">[];
};

export type MessageWithAuthor = Message & {
  author: Pick<Profile, "id" | "email" | "display_name" | "avatar_url">;
  reactions: (Reaction & { user_email?: string })[];
  thread?: ThreadSummary;
};

type ThreadReplyRow = {
  parent_message_id: string;
  created_at: string;
  user_id: string;
  author: Pick<Profile, "id" | "email" | "display_name" | "avatar_url"> | null;
};

async function attachThreadSummaries(
  supabase: SupabaseClient,
  messages: MessageWithAuthor[],
): Promise<MessageWithAuthor[]> {
  if (messages.length === 0) return messages;

  const parentIds = messages.map((message) => message.id);
  const { data: replies, error } = await supabase
    .from("messages")
    .select(
      `
      parent_message_id,
      created_at,
      user_id,
      author:profiles!messages_user_id_fkey(id, email, display_name, avatar_url)
    `,
    )
    .in("parent_message_id", parentIds)
    .order("created_at", { ascending: false });

  if (error || !replies?.length) return messages;

  const grouped = new Map<string, ThreadReplyRow[]>();

  for (const reply of replies as unknown as ThreadReplyRow[]) {
    const bucket = grouped.get(reply.parent_message_id) ?? [];
    bucket.push(reply);
    grouped.set(reply.parent_message_id, bucket);
  }

  return messages.map((message) => {
    const threadReplies = grouped.get(message.id);
    if (!threadReplies?.length) return message;

    const participants: ThreadSummary["participants"] = [];
    const seen = new Set<string>();

    for (const reply of threadReplies) {
      if (!reply.author || seen.has(reply.author.id)) continue;
      seen.add(reply.author.id);
      participants.push(reply.author);
      if (participants.length >= 3) break;
    }

    return {
      ...message,
      thread: {
        reply_count: threadReplies.length,
        last_reply_at: threadReplies[0]!.created_at,
        participants,
      },
    };
  });
}

export async function countUserChannels(supabase: SupabaseClient, userId: string) {
  const { count, error } = await supabase
    .from("channels")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .eq("kind", "channel");

  if (error) throw error;
  return count ?? 0;
}

export async function fetchChannelMessages(
  supabase: SupabaseClient,
  channelId: string,
  tier: SubscriptionTier,
  options?: { parentId?: string | null; search?: string },
) {
  let query = supabase
    .from("messages")
    .select(
      `
      *,
      author:profiles!messages_user_id_fkey(id, email, display_name, avatar_url),
      reactions(*)
    `,
    )
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });

  if (options?.parentId) {
    query = query.eq("parent_message_id", options.parentId);
  } else {
    query = query.is("parent_message_id", null);
  }

  const cutoff = getHistoryCutoff(tier);
  if (cutoff) {
    query = query.gte("created_at", cutoff.toISOString());
  }

  if (options?.search?.trim()) {
    query = query.textSearch("content", options.search.trim(), {
      type: "websearch",
      config: "english",
    });
    if (!isProTier(tier) && cutoff) {
      query = query.gte("created_at", cutoff.toISOString());
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const messages = (data ?? []) as unknown as MessageWithAuthor[];

  if (!options?.parentId) {
    return attachThreadSummaries(supabase, messages);
  }

  return messages;
}
