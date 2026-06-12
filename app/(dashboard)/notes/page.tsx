"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  canCreateNote,
  FREE_NOTE_LIMIT,
  type Note,
} from "@/lib/types/database";
import { formatDate } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";

export default function NotesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profile = useUserStore((s) => s.profile);
  const isLoadingProfile = useUserStore((s) => s.isLoading);
  const [isCreating, setIsCreating] = useState(false);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
  });

  const createNote = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .insert({
          owner_id: user.id,
          title: "Untitled Note",
          content: { type: "doc", content: [{ type: "paragraph" }] },
        })
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (note) => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push(`/notes/${note.id}`);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not create note",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ title: "Note deleted" });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete note",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = async () => {
    if (!profile) {
      toast({
        title: "Could not create note",
        description:
          "Profile not loaded. Run Supabase migrations (see README → Supabase & Stripe).",
        variant: "destructive",
      });
      return;
    }

    if (!canCreateNote(profile.subscription_tier, notes.length)) {
      toast({
        title: "Note limit reached",
        description: `Free plan allows up to ${FREE_NOTE_LIMIT} notes. Upgrade to Premium.`,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createNote.mutateAsync();
    } finally {
      setIsCreating(false);
    }
  };

  const atNoteLimit =
    profile &&
    !canCreateNote(profile.subscription_tier, notes.length);

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">
            {profile?.subscription_tier === "free"
              ? `${notes.length}/${FREE_NOTE_LIMIT} notes used`
              : `${notes.length} notes`}
          </p>
        </div>
        <Button onClick={() => void handleCreate()} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "New note"}
        </Button>
      </div>

      {atNoteLimit && <UpgradePrompt reason="note_limit" noteCount={notes.length} />}

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-muted-foreground">No notes yet</p>
            <Button onClick={() => void handleCreate()}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="group relative transition-shadow hover:shadow-md">
              <Link href={`/notes/${note.id}`}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                  <CardDescription>
                    Updated {formatDate(note.updated_at)}
                  </CardDescription>
                </CardHeader>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => deleteNote.mutate(note.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
