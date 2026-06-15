export type SubscriptionTier = "free" | "pro" | "premium";
export type ChannelVisibility = "public" | "private";
export type ChannelKind = "channel" | "dm";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          subscription_tier: SubscriptionTier;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      channels: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          visibility: ChannelVisibility;
          kind: ChannelKind;
          section_id: string | null;
          workspace_id: string | null;
          dm_key: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          visibility?: ChannelVisibility;
          kind?: ChannelKind;
          section_id?: string | null;
          workspace_id?: string | null;
          dm_key?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          visibility?: ChannelVisibility;
          kind?: ChannelKind;
          section_id?: string | null;
          workspace_id?: string | null;
          dm_key?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      channel_sections: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          workspace_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          workspace_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          workspace_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      channel_members: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          content: string;
          parent_message_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          content: string;
          parent_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          user_id?: string;
          content?: string;
          parent_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          emoji?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          stripe_subscription_id: string;
          user_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stripe_subscription_id: string;
          user_id: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stripe_subscription_id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type Channel = Database["public"]["Tables"]["channels"]["Row"];
export type ChannelSection = Database["public"]["Tables"]["channel_sections"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];

export const FREE_CHANNEL_LIMIT = 10;
export const FREE_HISTORY_DAYS = 90;
export const PRO_PRICE_MONTHLY = 8;

export function isProTier(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "premium";
}

export function canCreateChannel(
  tier: SubscriptionTier,
  channelCount: number,
): boolean {
  if (isProTier(tier)) return true;
  return channelCount < FREE_CHANNEL_LIMIT;
}

export function getHistoryCutoff(tier: SubscriptionTier): Date | null {
  if (isProTier(tier)) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - FREE_HISTORY_DAYS);
  return cutoff;
}
