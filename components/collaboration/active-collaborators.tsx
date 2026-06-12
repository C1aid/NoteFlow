"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getPresenceColor,
  useCollaborationStore,
} from "@/store/user-store";

export function ActiveCollaborators() {
  const activeUsers = useCollaborationStore((s) => s.activeUsers);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Editing now:</span>
      <div className="flex -space-x-2">
        {activeUsers.map((user) => (
          <Avatar
            key={user.userId}
            className="h-8 w-8 border-2"
            style={{ borderColor: user.color }}
            title={user.email}
          >
            <AvatarFallback
              style={{ backgroundColor: user.color, color: "white" }}
              className="text-xs"
            >
              {user.email.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}

export function useNotePresence(
  noteId: string,
  userId: string,
  email: string,
) {
  const addUser = useCollaborationStore((s) => s.addUser);
  const removeUser = useCollaborationStore((s) => s.removeUser);

  return {
    trackPresence: () => {
      const color = getPresenceColor(userId);
      addUser({ userId, email, color, lastSeen: Date.now() });
      return () => removeUser(userId);
    },
  };
}
