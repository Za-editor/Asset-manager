"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, purchase } from "@/lib/db/schema";
import { eq, and, SQL } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createStripeCheckoutSession(assetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const [getAsset] = await db.select().from(asset).where(eq(asset.id, assetId));
  if (!getAsset) {
    throw new Error("Asset not found");
  }

  const existingPurchase = await db
    .select()
    .from(purchase)
    .where(
      and(eq(purchase.assetId, assetId), eq(purchase.userId, session.user.id))
    )
    .limit(1);

  if (existingPurchase.length > 0) {
    return {
      alreadyPurchased: true,
    };
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
 
             name: getAsset.title,
              description: `Purchase of ${getAsset.title}`,
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.APP_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/gallery/${assetId}?cancelled=true`,
      metadata: {
        assetId: assetId,
        userId: session.user.id,
      },
    });

    return {
      sessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create Stripe checkout session");
  }
}

