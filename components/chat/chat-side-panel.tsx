"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatSidePanelProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "default" | "wide";
};

export function ChatSidePanel({
  title,
  onClose,
  children,
  footer,
  className,
  size = "default",
}: ChatSidePanelProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-30 flex flex-col bg-black/90 pt-[3.75rem]",
        "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md",
        "lg:relative lg:inset-auto lg:z-0 lg:bg-transparent lg:pb-0 lg:pt-0 lg:backdrop-blur-none",
        size === "wide" ? "lg:w-[26rem]" : "lg:w-[19rem]",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col px-0 lg:px-3 lg:py-3">
        <div className="liquid-glass flex min-h-0 flex-1 flex-col overflow-hidden rounded-none lg:rounded-xl">
          <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-medium text-white">{title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-gray-400 hover:bg-white/10 hover:text-white"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </div>

          {footer}
        </div>
      </div>
    </div>
  );
}
