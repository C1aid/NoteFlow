export type SubscriptionTier = "free" | "premium";
export type CollaboratorPermission = "read" | "write";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          subscription_tier: SubscriptionTier;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          content: Json;
          is_public: boolean;
          share_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title?: string;
          content?: Json;
          is_public?: boolean;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          content?: Json;
          is_public?: boolean;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collaborators: {
        Row: {
          id: string;
          note_id: string;
          user_id: string;
          permission: CollaboratorPermission;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          user_id: string;
          permission?: CollaboratorPermission;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          user_id?: string;
          permission?: CollaboratorPermission;
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type Collaborator = Database["public"]["Tables"]["collaborators"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export const FREE_NOTE_LIMIT = 5;

export function canCreateNote(
  tier: SubscriptionTier,
  noteCount: number,
): boolean {
  if (tier === "premium") return true;
  return noteCount < FREE_NOTE_LIMIT;
}

export function canCollaborate(tier: SubscriptionTier): boolean {
  return tier === "premium";
}
