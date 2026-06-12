import { describe, expect, it, vi, afterEach } from "vitest";
import {
  formatAuthError,
  getSupabaseConfigError,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

describe("supabase config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects placeholder configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJ.placeholder");

    expect(isSupabaseConfigured()).toBe(false);
    expect(getSupabaseConfigError()).toContain(".env.local");
  });

  it("accepts real-looking configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc123.supabase.co");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real-key",
    );

    expect(isSupabaseConfigured()).toBe(true);
    expect(getSupabaseConfigError()).toBeNull();
  });

  it("formats failed fetch errors clearly", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc123.supabase.co");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real-key",
    );

    expect(formatAuthError(new TypeError("Failed to fetch"))).toContain(
      "Could not reach Supabase",
    );
  });
});
