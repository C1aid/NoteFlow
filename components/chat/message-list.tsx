"use client";

import { MessageDateDivider } from "@/components/chat/message-date-divider";
import { MessageItem } from "@/components/chat/message-item";
import type { UserProfileSummary } from "@/components/chat/user-profile-panel";
import type { MessageWithAuthor } from "@/lib/chat/queries";
import { formatMessageDate, isSameDay } from "@/lib/chat/format";

type MessageListProps = {
  messages: MessageWithAuthor[];
  currentUserId?: string;
  onOpenThread?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onAuthorClick?: (author: UserProfileSummary) => void;
  compact?: boolean;
};

export function MessageList({
  messages,
  currentUserId,
  onOpenThread,
  onToggleReaction,
  onAuthorClick,
  compact = false,
}: MessageListProps) {
  return (
    <>
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showDateDivider =
          !previous || !isSameDay(previous.created_at, message.created_at);

        return (
          <div key={message.id}>
            {showDateDivider && (
              <MessageDateDivider label={formatMessageDate(message.created_at)} />
            )}
            <MessageItem
              message={message}
              currentUserId={currentUserId}
              onOpenThread={onOpenThread}
              onToggleReaction={onToggleReaction}
              onAuthorClick={onAuthorClick}
              compact={compact}
            />
          </div>
        );
      })}
    </>
  );
}
