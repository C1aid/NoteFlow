"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveCollaborators } from "@/components/collaboration/active-collaborators";
import { RealtimeNoteSync } from "@/components/collaboration/realtime-note-sync";
import { ShareNoteDialog } from "@/components/collaboration/share-note-dialog";
import { NoteEditor } from "@/components/editor/note-editor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { JSONContent } from "@tiptap/core";
import type { Note } from "@/lib/types/database";
import { debounce } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";

export default function NoteDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params.id as string;
  const shareToken = searchParams.get("token");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profile = useUserStore((s) => s.profile);
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState<JSONContent>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isRemoteUpdate = useRef(false);
  const userIdRef = useRef<string>("");
  const emailRef = useRef<string>("");

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userIdRef.current = user.id;
        emailRef.current = user.email ?? "user";
      }

      let query = supabase.from("notes").select("*").eq("id", noteId);

      const { data, error } = await query.single();
      if (error) throw error;

      if (shareToken && data.share_token !== shareToken) {
        throw new Error("Invalid share token");
      }

      return data as Note;
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content as JSONContent);
    }
  }, [note]);

  const saveNote = useMutation({
    mutationFn: async (updates: { title?: string; content?: JSONContent }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("notes")
        .update({
          ...updates,
          content: updates.content as Note["content"],
        })
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => setIsSaving(false),
  });

  const debouncedSave = useCallback(
    debounce((updates: { title?: string; content?: JSONContent }) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      setIsSaving(true);
      saveNote.mutate(updates);
    }, 800),
    [noteId],
  );

  const handleContentChange = (newContent: JSONContent) => {
    setContent(newContent);
    debouncedSave({ content: newContent, title });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle, content });
  };

  const handleRemoteUpdate = useCallback(
    (updated: Pick<Note, "title" | "content" | "updated_at">) => {
      isRemoteUpdate.current = true;
      setTitle(updated.title);
      setContent(updated.content as JSONContent);
      setLastSaved(new Date(updated.updated_at));
    },
    [],
  );

  const isPremium = profile?.subscription_tier === "premium";
  const isOwner = note?.owner_id === profile?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Note not found</p>
        <Button asChild className="mt-4">
          <Link href="/notes">Back to notes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {userIdRef.current && emailRef.current && (
        <RealtimeNoteSync
          noteId={noteId}
          userId={userIdRef.current}
          email={emailRef.current}
          onRemoteUpdate={handleRemoteUpdate}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/notes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <ActiveCollaborators />
          {isSaving ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="h-3 w-3" />
              Saved
            </span>
          ) : null}
          {isOwner && (
            <ShareNoteDialog
              noteId={noteId}
              shareToken={note.share_token}
              isPremium={isPremium}
            />
          )}
        </div>
      </div>

      <NoteEditor
        title={title}
        content={content}
        onChange={handleContentChange}
        onTitleChange={handleTitleChange}
      />
    </div>
  );
}
