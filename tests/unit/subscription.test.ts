import { describe, expect, it } from "vitest";
import {
  canCreateNote,
  canCollaborate,
  FREE_NOTE_LIMIT,
} from "@/lib/types/database";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

describe("subscription checks", () => {
  it("allows free users to create notes under the limit", () => {
    expect(canCreateNote("free", 0)).toBe(true);
    expect(canCreateNote("free", FREE_NOTE_LIMIT - 1)).toBe(true);
  });

  it("blocks free users at the note limit", () => {
    expect(canCreateNote("free", FREE_NOTE_LIMIT)).toBe(false);
    expect(canCreateNote("free", 10)).toBe(false);
  });

  it("allows premium users unlimited notes", () => {
    expect(canCreateNote("premium", 100)).toBe(true);
  });

  it("restricts collaboration to premium", () => {
    expect(canCollaborate("free")).toBe(false);
    expect(canCollaborate("premium")).toBe(true);
  });
});

describe("auth validation", () => {
  it("validates login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("validates signup with matching passwords", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects signup with mismatched passwords", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});

describe("note CRUD logic", () => {
  it("enforces free tier note count boundary", () => {
    const noteCounts = [0, 4, 5, 6];
    const expected = [true, true, false, false];

    noteCounts.forEach((count, i) => {
      expect(canCreateNote("free", count)).toBe(expected[i]);
    });
  });
});
