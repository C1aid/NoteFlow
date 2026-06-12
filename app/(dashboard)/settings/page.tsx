"use client";

import { Check, Crown, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { getSubscriptionLabel, useUserStore } from "@/store/user-store";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((s) => s.profile);
  const isLoading = useUserStore((s) => s.isLoading);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      setIsUpgrading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPremium = profile?.subscription_tier === "premium";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{profile?.email}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => void handleSignOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardFooter>
      </Card>

      <Card className={isPremium ? "border-primary" : ""}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>
              {profile ? getSubscriptionLabel(profile.subscription_tier) : "Free"} Plan
            </CardTitle>
          </div>
          <CardDescription>
            {isPremium
              ? "You have access to all Premium features."
              : "Upgrade to unlock unlimited notes and collaboration."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              "Unlimited notes",
              "Real-time collaboration",
              "Share & invite collaborators",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check
                  className={`h-4 w-4 ${isPremium ? "text-primary" : "text-muted-foreground"}`}
                />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        {!isPremium && (
          <CardFooter>
            <Button onClick={() => void handleUpgrade()} disabled={isUpgrading}>
              {isUpgrading ? "Redirecting..." : "Upgrade to Premium — $9/mo"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
