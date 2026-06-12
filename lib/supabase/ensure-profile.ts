import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types/database";

export async function ensureUserProfile(
  userId: string,
  email: string,
): Promise<Profile> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    return existing as Profile;
  }

  const { data, error } = await admin
    .from("profiles")
    .insert({
      id: userId,
      email,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  return data as Profile;
}
