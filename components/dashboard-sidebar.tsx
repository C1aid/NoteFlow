"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Menu, Search, Settings, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChannelList } from "@/components/chat/channel-list";
import { DmList } from "@/components/chat/dm-list";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { cn } from "@/lib/utils";
import type { DmConversation, SidebarData } from "@/lib/chat/sidebar";
import { railItems } from "@/lib/navigation/rail";
import {
  dmChatPath,
  getActiveChannelId,
  getWorkspaceSlugFromPath,
  showDmSidebar,
  showHomeSidebar,
  showSecondarySidebar,
  workspaceChannelPath,
  workspacePath,
} from "@/lib/workspace/paths";
import { getDisplayName } from "@/lib/profile/display";
import { getSubscriptionLabel, useUserStore } from "@/store/user-store";

export { showSecondarySidebar };

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebar, setSidebar] = useState<SidebarData | null>(null);
  const [dms, setDms] = useState<DmConversation[]>([]);
  const workspaceSlug = getWorkspaceSlugFromPath(pathname);
  const activeChannelId = getActiveChannelId(pathname);
  const homeSidebarVisible = showHomeSidebar(pathname);
  const dmSidebarVisible = showDmSidebar(pathname);
  const secondarySidebarVisible = showSecondarySidebar(pathname);

  const activeChannel = useMemo(
    () => sidebar?.channels.find((c) => c.id === activeChannelId),
    [sidebar?.channels, activeChannelId],
  );

  const activeDm = useMemo(
    () => dms.find((d) => d.id === activeChannelId),
    [dms, activeChannelId],
  );

  const loadSidebar = useCallback(async () => {
    if (!workspaceSlug) {
      setSidebar(null);
      return;
    }

    const res = await fetch(
      `/api/channels?workspace=${encodeURIComponent(workspaceSlug)}`,
    );
    if (res.ok) {
      setSidebar((await res.json()) as SidebarData);
    }
  }, [workspaceSlug]);

  const loadDms = useCallback(async () => {
    const res = await fetch("/api/dms");
    if (res.ok) {
      setDms((await res.json()) as DmConversation[]);
    }
  }, []);

  useEffect(() => {
    if (homeSidebarVisible) {
      void loadSidebar();
    }
  }, [loadSidebar, pathname, homeSidebarVisible]);

  useEffect(() => {
    if (dmSidebarVisible) {
      void loadDms();
    }
  }, [loadDms, pathname, dmSidebarVisible]);

  const closeMobile = () => setMobileOpen(false);

  const handleChannelCreated = (id: string) => {
    void loadSidebar();
    if (workspaceSlug) {
      router.push(workspaceChannelPath(workspaceSlug, id));
    }
    closeMobile();
  };

  const handleDmStarted = (id: string) => {
    void loadDms();
    router.push(dmChatPath(id));
    closeMobile();
  };

  const handleChannelDeleted = (channelId: string) => {
    if (activeChannelId === channelId && workspaceSlug) {
      router.push(workspacePath(workspaceSlug));
    }
  };

  const handleDmLeft = (channelId: string) => {
    if (activeChannelId === channelId) {
      router.push("/dms");
    }
  };

  const handleWorkspaceCreated = (slug: string) => {
    router.push(workspacePath(slug));
    closeMobile();
  };

  const mobileHeaderTitle = activeChannel
    ? `#${activeChannel.name}`
    : activeDm
      ? getDisplayName(activeDm.peer)
      : dmSidebarVisible
        ? "Direct messages"
        : sidebar?.workspace.name ?? "DevTalk";

  const homeSidebarContent = (
    <>
      <div className="mb-1 flex items-center justify-between gap-2 overflow-visible px-1">
        {workspaceSlug && sidebar ? (
          <WorkspaceSwitcher
            currentSlug={workspaceSlug}
            currentName={sidebar.workspace.name}
            currentWorkspaceId={sidebar.workspace.id}
            isOwner={sidebar.workspace.created_by === profile?.id}
            onWorkspaceCreated={handleWorkspaceCreated}
          />
        ) : (
          <Link
            href="/w/new"
            className="text-lg font-semibold tracking-tight text-white"
            onClick={closeMobile}
          >
            DevTalk
          </Link>
        )}
        <button
          type="button"
          className="rounded-md p-2 text-gray-300 transition-smooth hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <Link
          href="/search"
          onClick={closeMobile}
          className={cn(
            "mx-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
            pathname.startsWith("/search")
              ? "bg-white/10 text-white"
              : "text-gray-300 hover:bg-white/5 hover:text-white",
          )}
        >
          <Search className="size-5 shrink-0" strokeWidth={1.75} />
          Search
        </Link>

        {sidebar && workspaceSlug && (
          <ChannelList
            sidebar={sidebar}
            workspaceSlug={workspaceSlug}
            activeChannelId={activeChannelId}
            currentUserId={profile?.id}
            onRefresh={() => void loadSidebar()}
            onChannelCreated={handleChannelCreated}
            onChannelDeleted={handleChannelDeleted}
          />
        )}

        <div className="mt-auto border-t border-white/10 pt-3">
          <Link
            href="/settings"
            onClick={closeMobile}
            className={cn(
              "mx-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
              pathname.startsWith("/settings")
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Settings className="size-5 shrink-0" strokeWidth={1.75} />
            Settings
          </Link>
        </div>
      </nav>
    </>
  );

  const dmSidebarContent = (
    <>
      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Direct messages
        </h2>
        <button
          type="button"
          className="rounded-md p-2 text-gray-300 transition-smooth hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto">
        <DmList
          dms={dms}
          activeChannelId={activeChannelId}
          currentUserId={profile?.id}
          onRefresh={() => void loadDms()}
          onDmStarted={handleDmStarted}
          onDmLeft={handleDmLeft}
        />
      </nav>
    </>
  );

  const sidebarContent = dmSidebarVisible ? dmSidebarContent : homeSidebarContent;

  const mobileNav = (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:hidden">
      <div className="liquid-glass flex items-center justify-around rounded-xl px-1 py-1.5">
        {railItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);
          const isHome = item.key === "home";

          if (isHome) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-smooth",
                  active ? "text-white" : "text-gray-400",
                )}
              >
                <Home className="size-5 shrink-0" strokeWidth={1.75} />
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-smooth",
                active ? "text-white" : "text-gray-400",
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.75} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  if (!secondarySidebarVisible) {
    return (
      <>
        <div className="fixed left-0 right-0 top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4 lg:hidden">
          <div className="liquid-glass flex items-center justify-center rounded-xl px-4 py-2.5">
            <Link href="/channels" className="text-base font-semibold text-white">
              DevTalk
            </Link>
          </div>
        </div>
        {mobileNav}
      </>
    );
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4 lg:left-[72px] lg:hidden">
        <div className="liquid-glass flex items-center gap-2 rounded-xl px-3 py-2 sm:px-4">
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-white transition-smooth hover:bg-white/10"
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <Link
              href={
                dmSidebarVisible
                  ? "/dms"
                  : workspaceSlug
                    ? workspacePath(workspaceSlug)
                    : "/w/new"
              }
              className="block truncate text-base font-semibold tracking-tight text-white"
            >
              {mobileHeaderTitle}
            </Link>
            {activeChannel?.description && !dmSidebarVisible && (
              <p className="truncate text-[10px] text-gray-400">
                {activeChannel.description}
              </p>
            )}
          </div>

          {!dmSidebarVisible && (
            <Link
              href="/search"
              className="shrink-0 rounded-md p-2 text-white transition-smooth hover:bg-white/10"
              aria-label="Search"
            >
              <Search className="size-5" />
            </Link>
          )}
          {dmSidebarVisible && <div className="size-9 shrink-0" />}
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 z-50 flex h-screen w-[min(100vw,20rem)] flex-col px-3 py-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] transition-transform sm:px-4 sm:py-6 lg:left-[72px] lg:w-72 lg:translate-x-0 lg:pb-6",
          mobileOpen ? "left-0 translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="liquid-glass flex h-full flex-col rounded-xl px-3 py-5">
          {sidebarContent}
          {profile && (
            <div className="mt-3 border-t border-white/10 px-2 pt-3">
              <p className="text-xs font-medium text-gray-400">
                {getSubscriptionLabel(profile.subscription_tier)} plan
              </p>
            </div>
          )}
        </div>
      </aside>

      {mobileNav}
    </>
  );
}
