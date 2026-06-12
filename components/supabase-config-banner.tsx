import { AlertCircle } from "lucide-react";
import { getSupabaseConfigError } from "@/lib/supabase/config";

export function SupabaseConfigBanner() {
  const message = getSupabaseConfigError();
  if (!message) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <div className="container mx-auto flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{message}</p>
      </div>
    </div>
  );
}
