"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, purchase } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createPaypalOrderActions(assetId: string) {
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
      and(eq(purchase.assetId, assetId), eq(purchase.userId, session.user.id)),
    )
    .limit(1);

  if (existingPurchase.length > 0) {
    return {
      alreadyPurchased: true,
    };
  }

  try {
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: assetId,
              description: `Purchase of ${getAsset.title}`,
              amount: {
                currency_code: "USD",
                value: "5.00",
              },
              custom_id: `${session.user.id}| ${assetId}`,
            },
          ],
          application_context: {
            return_url: `${process.env.APP_URL}/api/paypal/capture?assetId=${assetId}`,
            cancel_url: `${process.env.APP_URL}/gallery/${assetId}?cancelled=true`,
          },
        }),
      },
    );
    const data = await response.json();
    if (data.id) {
      console.log(data);
    } else {
      throw new Error("Failed to create paypalm order");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create paypal order");
  }
}
