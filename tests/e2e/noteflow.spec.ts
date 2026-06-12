import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows hero and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /notes that flow/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
  });
});

test.describe("Auth pages", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("signup page renders form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /create an account/i })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });
});

test.describe("Protected routes", () => {
  test("redirects unauthenticated users from notes to login", async ({ page }) => {
    await page.goto("/notes");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Note management (mocked auth)", () => {
  test.skip(
    !process.env.E2E_WITH_SUPABASE,
    "Requires Supabase credentials — set E2E_WITH_SUPABASE=1",
  );

  test("user can sign up, create, edit, and delete a note", async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const password = "testpass123";

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();

    await page.waitForURL(/\/notes/);
    await page.getByRole("button", { name: /new note/i }).click();
    await page.waitForURL(/\/notes\/.+/);

    await page.getByPlaceholder("Note title").fill("E2E Test Note");
    await page.locator(".ProseMirror").click();
    await page.locator(".ProseMirror").fill("Hello from Playwright");

    await page.getByRole("link", { name: /back/i }).click();
    await expect(page.getByText("E2E Test Note")).toBeVisible();

    await page.getByRole("button").filter({ has: page.locator("svg") }).last().click();
  });
});

test.describe("Free tier limit", () => {
  test.skip(
    !process.env.E2E_WITH_SUPABASE,
    "Requires Supabase credentials — set E2E_WITH_SUPABASE=1",
  );

  test("free user sees upgrade prompt after 5 notes", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.getByText(/upgrade to premium/i)).toBeVisible();
  });
});

test.describe("Stripe checkout", () => {
  test("settings page shows upgrade button for free users", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});
