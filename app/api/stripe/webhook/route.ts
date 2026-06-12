import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionTier } from "@/lib/types/database";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (subscriptionId) {
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle();

      if (!existing) {
        await admin.from("subscriptions").insert({
          stripe_subscription_id: subscriptionId,
          user_id: userId,
          status: "active",
        });
      }
    }

    await admin
      .from("profiles")
      .update({ subscription_tier: "premium" as SubscriptionTier })
      .eq("id", userId);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status;
    const userId = subscription.metadata?.supabase_user_id;

    if (userId) {
      const isActive = status === "active" || status === "trialing";

      await admin
        .from("profiles")
        .update({
          subscription_tier: (isActive ? "premium" : "free") as SubscriptionTier,
        })
        .eq("id", userId);

      await admin
        .from("subscriptions")
        .update({ status })
        .eq("stripe_subscription_id", subscription.id);
    }
  }

  return NextResponse.json({ received: true });
}
