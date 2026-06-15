"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, LogOut, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { useToast } from "@/hooks/use-toast";
import { workspacePath } from "@/lib/workspace/paths";
import type { Workspace } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type WorkspaceWithRole = Workspace & { role?: string };

type WorkspaceSwitcherProps = {
  currentSlug: string;
  currentName: string;
  currentWorkspaceId?: string;
  isOwner?: boolean;
  onWorkspaceCreated: (slug: string) => void;
  onLeft?: () => void;
};

function workspaceInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "WS";
}

function WorkspaceAvatar({ name, active }: { name: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
        active
          ? "bg-white/15 text-white ring-1 ring-white/20"
          : "bg-white/10 text-white/90 ring-1 ring-white/10",
      )}
    >
      {workspaceInitials(name)}
    </span>
  );
}

function MenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<"button"> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-smooth",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function WorkspaceSwitcher({
  currentSlug,
  currentName,
  currentWorkspaceId,
  isOwner,
  onWorkspaceCreated,
  onLeft,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const loadWorkspaces = useCallback(async () => {
    const res = await fetch("/api/workspaces");
    if (res.ok) {
      setWorkspaces((await res.json()) as WorkspaceWithRole[]);
    }
  }, []);

  const computeMenuRect = useCallback(() => {
    const anchor = containerRef.current;
    if (!anchor) return { top: 0, left: 0, width: 0 };

    const rect = anchor.getBoundingClientRect();
    const sidebar = anchor.closest("aside");
    const sidebarRect = sidebar?.getBoundingClientRect();

    const gap = 6;
    let left = rect.left;
    let width = rect.width;

    if (sidebarRect) {
      const inset = 12;
      left = Math.max(sidebarRect.left + inset, rect.left);
      width = Math.min(width, sidebarRect.right - left - inset);
    }

    return {
      top: rect.bottom + gap,
      left,
      width,
    };
  }, []);

  const updateMenuPosition = useCallback(() => {
    setMenuRect(computeMenuRect());
  }, [computeMenuRect]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces, currentSlug]);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        document.getElementById("workspace-switcher-menu")?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const deleteWorkspace = async () => {
    if (!currentWorkspaceId) return;
    if (!window.confirm(`Delete workspace "${currentName}"? All channels will be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");

      toast({ title: "Workspace deleted", description: `"${currentName}" was removed.` });
      const remaining = workspaces.filter((w) => w.id !== currentWorkspaceId);
      if (remaining[0]) {
        router.push(workspacePath(remaining[0].slug));
      } else {
        router.push("/w/new");
      }
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const leaveWorkspace = async () => {
    if (!currentWorkspaceId) return;
    if (!window.confirm(`Leave workspace "${currentName}"?`)) return;

    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/leave`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to leave");

      toast({ title: "Left workspace", description: `You left "${currentName}".` });
      onLeft?.();
      const remaining = workspaces.filter((w) => w.id !== currentWorkspaceId);
      if (remaining[0]) {
        router.push(workspacePath(remaining[0].slug));
      } else {
        router.push("/w/new");
      }
    } catch (err) {
      toast({
        title: "Leave failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setMenuRect(computeMenuRect());
    setOpen(true);
  };

  const menu = open ? (
    <div
      id="workspace-switcher-menu"
      style={{
        position: "fixed",
        top: menuRect.top,
        left: menuRect.left,
        width: menuRect.width,
      }}
      className={cn(
        "glass-card z-[200] overflow-hidden rounded-xl",
        "shadow-[0_12px_48px_rgba(0,0,0,0.55)]",
      )}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Your workspaces
        </p>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto p-2">
        {workspaces.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-500">No workspaces yet</p>
        ) : (
          workspaces.map((ws) => {
            const active = ws.slug === currentSlug;
            return (
              <Link
                key={ws.id}
                href={workspacePath(ws.slug)}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-smooth",
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <WorkspaceAvatar name={ws.name} active={active} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{ws.name}</span>
                {active && <Check className="size-4 shrink-0 text-white/70" />}
              </Link>
            );
          })
        )}
      </div>

      <div className="border-t border-white/10 p-2">
        <CreateWorkspaceDialog
          onCreated={(slug) => {
            setOpen(false);
            void loadWorkspaces();
            onWorkspaceCreated(slug);
          }}
          trigger={
            <MenuItem className="text-gray-200 hover:bg-white/8 hover:text-white">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/8">
                <Plus className="size-4" />
              </span>
              <span className="font-medium">Create workspace</span>
            </MenuItem>
          }
        />
      </div>

      {currentWorkspaceId && (
        <div className="border-t border-white/10 p-2">
          {isOwner ? (
            <MenuItem
              onClick={() => void deleteWorkspace()}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                <Trash2 className="size-4" />
              </span>
              <span className="font-medium">Delete workspace</span>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => void leaveWorkspace()}
              className="text-gray-300 hover:bg-white/8 hover:text-white"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <LogOut className="size-4" />
              </span>
              <span className="font-medium">Leave workspace</span>
            </MenuItem>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative z-20 min-w-0 flex-1">
      <button
        type="button"
        onClick={toggleMenu}
        className={cn(
          "flex w-full min-w-0 items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-smooth",
          open ? "bg-white/10" : "hover:bg-white/5",
        )}
      >
        <WorkspaceAvatar name={currentName} active />
        <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-white">
          {currentName}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-gray-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
