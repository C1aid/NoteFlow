"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ChannelChat } from "@/components/chat/channel-chat";

export default function WorkspaceChannelPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const channelId = params.id as string;
  const initialThreadId = searchParams.get("thread");

  return (
    <ChannelChat channelId={channelId} initialThreadId={initialThreadId} />
  );
}
