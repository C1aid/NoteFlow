import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MessageWithAuthor } from "@/lib/chat/queries";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: parentMessages, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      author:profiles!messages_user_id_fkey(id, email, display_name, avatar_url),
      reactions(*),
      channel:channels!messages_channel_id_fkey(
        id,
        name,
        kind,
        workspace:workspaces(slug)
      )
    `,
    )
    .is("parent_message_id", null)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const threads = [];

  for (const msg of parentMessages ?? []) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("parent_message_id", msg.id);

    if (!count || count === 0) continue;

    threads.push({
      ...(msg as MessageWithAuthor),
      reply_count: count,
    });
  }

  return NextResponse.json(threads.slice(0, 30));
}
