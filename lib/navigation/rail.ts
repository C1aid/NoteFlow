import {
  Bell,
  FolderOpen,
  Home,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";

export const railItems = [
  {
    key: "home",
    href: "/channels",
    label: "Home",
    icon: Home,
    isActive: (pathname: string) =>
      pathname.startsWith("/w/") ||
      pathname.startsWith("/search") ||
      pathname === "/channels",
  },
  {
    key: "dms",
    href: "/dms",
    label: "DMs",
    icon: MessageSquare,
    isActive: (pathname: string) =>
      pathname.startsWith("/dms") || /^\/channels\/[^/]+\/chat/.test(pathname),
  },
  {
    key: "activity",
    href: "/activity",
    label: "Activity",
    icon: Bell,
    isActive: (pathname: string) => pathname.startsWith("/activity"),
  },
  {
    key: "files",
    href: "/files",
    label: "Files",
    icon: FolderOpen,
    isActive: (pathname: string) => pathname.startsWith("/files"),
  },
  {
    key: "more",
    href: "/more",
    label: "More",
    icon: MoreHorizontal,
    isActive: (pathname: string) =>
      pathname.startsWith("/more") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/threads"),
  },
] as const;
