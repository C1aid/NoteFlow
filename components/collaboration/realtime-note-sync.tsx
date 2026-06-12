"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/lib/types/database";
import {
  getPresenceColor,
  useCollaborationStore,
} from "@/store/user-store";

interface RealtimeNoteSyncProps {
  noteId: string;
  userId: string;
  email: string;
  onRemoteUpdate: (note: Pick<Note, "title" | "content" | "updated_at">) => void;
}

export function RealtimeNoteSync({
  noteId,
  userId,
  email,
  onRemoteUpdate,
}: RealtimeNoteSyncProps) {
  const addUser = useCollaborationStore((s) => s.addUser);
  const removeUser = useCollaborationStore((s) => s.removeUser);
  const setActiveUsers = useCollaborationStore((s) => s.setActiveUsers);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`note:${noteId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `id=eq.${noteId}`,
        },
        (payload) => {
          const updated = payload.new as Note;
          if (updated) {
            onRemoteUpdate({
              title: updated.title,
              content: updated.content,
              updated_at: updated.updated_at,
            });
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{
          email: string;
          userId: string;
        }>();
        const users = Object.values(state)
          .flat()
          .map((p) => ({
            userId: p.userId,
            email: p.email,
            color: getPresenceColor(p.userId),
            lastSeen: Date.now(),
          }));
        setActiveUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((p) => {
          const presence = p as unknown as { email: string; userId: string };
          addUser({
            userId: presence.userId,
            email: presence.email,
            color: getPresenceColor(presence.userId),
            lastSeen: Date.now(),
          });
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach((p) => {
          const presence = p as unknown as { userId: string };
          removeUser(presence.userId);
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ userId, email });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    noteId,
    userId,
    email,
    onRemoteUpdate,
    addUser,
    removeUser,
    setActiveUsers,
  ]);

  return null;
}
