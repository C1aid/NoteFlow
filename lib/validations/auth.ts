import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.record(z.unknown()).optional(),
});

export const collaboratorSchema = z.object({
  email: z.string().email("Invalid email address"),
  permission: z.enum(["read", "write"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type CollaboratorInput = z.infer<typeof collaboratorSchema>;
