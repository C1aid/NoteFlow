"use client";

import { Crown, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FREE_NOTE_LIMIT } from "@/lib/types/database";

interface UpgradePromptProps {
  reason?: "note_limit" | "collaboration";
  noteCount?: number;
}

export function UpgradePrompt({
  reason = "note_limit",
  noteCount = FREE_NOTE_LIMIT,
}: UpgradePromptProps) {
  const isNoteLimit = reason === "note_limit";

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Upgrade to Premium</CardTitle>
        </div>
        <CardDescription>
          {isNoteLimit
            ? `You've reached the free plan limit of ${noteCount} notes.`
            : "Collaboration is a Premium feature."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Unlimited notes
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Real-time collaboration
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Share notes with teammates
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href="/settings">Upgrade now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
