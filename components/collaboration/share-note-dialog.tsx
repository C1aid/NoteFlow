"use client";

import { Copy, Share2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { collaboratorSchema } from "@/lib/validations/auth";

interface ShareNoteDialogProps {
  noteId: string;
  shareToken: string;
  isPremium: boolean;
}

export function ShareNoteDialog({
  noteId,
  shareToken,
  isPremium,
}: ShareNoteDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"read" | "write">("write");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/notes/${noteId}?token=${shareToken}`
      : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Share link copied to clipboard." });
  };

  const inviteCollaborator = async () => {
    const parsed = collaboratorSchema.safeParse({ email, permission });
    if (!parsed.success) {
      toast({
        title: "Invalid input",
        description: parsed.error.errors[0]?.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, ...parsed.data }),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to invite collaborator");
      }

      toast({
        title: "Invitation sent",
        description: data.message ?? `${email} can now collaborate on this note.`,
      });
      setEmail("");
      setOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <Button variant="outline" disabled title="Upgrade to Premium to share notes">
        <Share2 className="mr-2 h-4 w-4" />
        Share (Premium)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>
            Invite collaborators or copy the share link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-sm" />
            <Button type="button" variant="secondary" onClick={() => void copyLink()}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Invite by email</Label>
            <Input
              id="email"
              type="email"
              placeholder="collaborator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permission">Permission</Label>
            <select
              id="permission"
              value={permission}
              onChange={(e) =>
                setPermission(e.target.value as "read" | "write")
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="read">Read only</option>
              <option value="write">Can edit</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => void inviteCollaborator()} disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
