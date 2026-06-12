"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError, getSupabaseConfigError } from "@/lib/supabase/config";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { SupabaseConfigBanner } from "@/components/supabase-config-banner";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    const configError = getSupabaseConfigError();
    if (configError) {
      toast({
        title: "Sign up unavailable",
        description: configError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account created",
        description: "Check your email to confirm, or sign in if confirmation is disabled.",
      });
      router.push("/notes");
      router.refresh();
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: formatAuthError(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/notes`,
      },
    });

    if (error) {
      toast({
        title: "OAuth failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SupabaseConfigBanner />
      <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start taking notes with NoteFlow</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void signUpWithGoogle()}
            >
              Continue with Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
