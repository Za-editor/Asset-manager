import { db } from "@/lib/db";
import { purchase } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    redirect("/");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const { assetId, userId } = session.metadata!;

      // Check if already recorded
      const existingPurchase = await db
        .select()
        .from(purchase)
        .where(and(eq(purchase.assetId, assetId), eq(purchase.userId, userId)))
        .limit(1);

      if (existingPurchase.length === 0) {
        await db.insert(purchase).values({
          userId: userId,
          assetId: assetId,
          paymentId: session.id,
          price: 5.0,
        });
      }

      redirect(`/gallery/${assetId}?success=true`);
    } else {
      redirect(`/gallery/${session.metadata?.assetId}?cancelled=true`);
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    redirect("/");
  }
}
