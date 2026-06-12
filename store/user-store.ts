import type { Profile, SubscriptionTier } from "@/lib/types/database";
import { create } from "zustand";

interface UserState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  isPremium: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  isPremium: () => get().profile?.subscription_tier === "premium",
}));

interface EditorPresence {
  userId: string;
  email: string;
  color: string;
  lastSeen: number;
}

interface CollaborationState {
  activeUsers: EditorPresence[];
  setActiveUsers: (users: EditorPresence[]) => void;
  addUser: (user: EditorPresence) => void;
  removeUser: (userId: string) => void;
}

const PRESENCE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function getPresenceColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length] ?? "#3b82f6";
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  activeUsers: [],
  setActiveUsers: (activeUsers) => set({ activeUsers }),
  addUser: (user) =>
    set((state) => ({
      activeUsers: [
        ...state.activeUsers.filter((u) => u.userId !== user.userId),
        user,
      ],
    })),
  removeUser: (userId) =>
    set((state) => ({
      activeUsers: state.activeUsers.filter((u) => u.userId !== userId),
    })),
}));

export function getSubscriptionLabel(tier: SubscriptionTier): string {
  return tier === "premium" ? "Premium" : "Free";
}
