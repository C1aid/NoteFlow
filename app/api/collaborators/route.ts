import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { canCollaborate } from "@/lib/types/database";
import { collaboratorSchema } from "@/lib/validations/auth";

const inviteSchema = collaboratorSchema.extend({
  noteId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { noteId, email, permission } = parsed.data;

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    if (!profile || !canCollaborate(profile.subscription_tier)) {
      return NextResponse.json(
        { error: "Collaboration requires Premium subscription" },
        { status: 403 },
      );
    }

    const { data: note } = await supabase
      .from("notes")
      .select("id, owner_id")
      .eq("id", noteId)
      .single();

    if (!note || note.owner_id !== user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: inviteeProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!inviteeProfile) {
      return NextResponse.json(
        { error: "User not found. They must sign up first." },
        { status: 404 },
      );
    }

    if (inviteeProfile.id === user.id) {
      return NextResponse.json(
        { error: "You cannot invite yourself" },
        { status: 400 },
      );
    }

    const { error } = await admin.from("collaborators").upsert(
      {
        note_id: noteId,
        user_id: inviteeProfile.id,
        permission,
      },
      { onConflict: "note_id,user_id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `${email} added as ${permission} collaborator`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
