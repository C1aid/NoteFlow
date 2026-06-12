"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import type { Profile } from "@/lib/types/database";
import { useUserStore } from "@/store/user-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setProfile = useUserStore((s) => s.setProfile);
  const setLoading = useUserStore((s) => s.setLoading);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setProfile(null);
          setProfileError(
            data.error ??
              "Could not load profile. Run Supabase migrations from supabase/migrations/.",
          );
          return;
        }
        const profile = (await res.json()) as Profile;
        setProfile(profile);
        setProfileError(null);
      } catch {
        setProfile(null);
        setProfileError("Could not load profile. Check Supabase connection.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [setProfile, setLoading]);

  return (
    <div className="min-h-screen">
      <DashboardNav />
      {profileError && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-3">
          <div className="container mx-auto flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {profileError}
              {profileError.includes("profiles") && (
                <>
                  {" "}
                  Open Supabase → SQL Editor and run{" "}
                  <code className="rounded bg-destructive/10 px-1">
                    001_initial_schema.sql
                  </code>{" "}
                  then{" "}
                  <code className="rounded bg-destructive/10 px-1">
                    002_backfill_profiles.sql
                  </code>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
