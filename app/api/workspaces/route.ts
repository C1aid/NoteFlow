import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/ensure-profile";
import { slugifyWorkspaceName } from "@/lib/workspace/slug";
import type { Workspace } from "@/lib/types/database";

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(200).optional(),
});

async function resolveUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
) {
  const base = slugifyWorkspaceName(name);
  let slug = base;
  let attempt = 0;

  while (attempt < 20) {
    const { data: taken, error } = await supabase.rpc("workspace_slug_taken", {
      slug,
    });

    if (error) {
      const { data: existing } = await supabase
        .from("workspaces")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (!existing) return slug;
    } else if (!taken) {
      return slug;
    }

    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workspaces = (memberships ?? [])
    .map((m) => {
      const row = m as { role: string; workspaces: Workspace | Workspace[] | null };
      const ws = Array.isArray(row.workspaces) ? row.workspaces[0] : row.workspaces;
      if (!ws) return null;
      return { ...ws, role: row.role };
    })
    .filter((ws): ws is Workspace & { role: string } => ws !== null);

  return NextResponse.json(workspaces);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkspaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    await ensureUserProfile(user.id, user.email ?? "");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Profile not found";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const slug = await resolveUniqueSlug(supabase, parsed.data.name);

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
