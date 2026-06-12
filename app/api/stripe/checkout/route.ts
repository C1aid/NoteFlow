import { NextResponse } from "next/server";
import { PREMIUM_PRICE_ID, getStripe } from "@/lib/stripe";
import { ensureUserProfile } from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(user.id, user.email ?? "");

    const stripe = getStripe();
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/settings?success=true`,
      cancel_url: `${appUrl}/settings?canceled=true`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
