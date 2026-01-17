"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, category, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const AssetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  categoryId: z.coerce.number().positive("Please select a category"),
  fileUrl: z.string().url("Invalid file URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
});

export async function getCategoriesAction() {
  try {
    return await db.select().from(category);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function uploadAssetAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "You must be logged in to upload an asset",
    };
  }

  try {
    const validateFields = AssetSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      categoryId: formData.get("categoryId"),
      fileUrl: formData.get("fileUrl"),
      thumbnailUrl: formData.get("thumbnailUrl") || formData.get("fileUrl"),
    });

    await db.insert(asset).values({
      title: validateFields.title,
      description: validateFields.description,
      fileUrl: validateFields.fileUrl,
      thumbnailUrl: validateFields.thumbnailUrl,
      isApproved: "pending",
      userId: session.user.id,
      categoryId: validateFields.categoryId,
    });

    revalidatePath("/dashboard/assets");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to upload asset:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to upload asset",
    };
  }
}

export async function getUserAssetsAction(userid: string) {
  try {
    return await db
      .select()
      .from(asset)
      .where(eq(asset.userId, userid))
      .orderBy(asset.createdAt);
  } catch (error) {
    console.error("Failed to fetch user assets:", error);
    return [];
  }
}

export async function getPublicAssetsAction(categoryId?: number) {
  try {
    //add multiple base conditions
    let conditions = and(eq(asset.isApproved, "spproved"));

    if (categoryId) {
      conditions = and(conditions, eq(asset.categoryId, categoryId));
    }

    const query = await db
      .select({
        asset: asset,
        categoryName: category.name,
        userName: user.name,
      })
      .from(asset)
      .leftJoin(category, eq(asset.categoryId, category.id))
      .leftJoin(user, eq(asset.userId, user.id))
      .where(conditions);

      return query
  } catch (error) {
    console.error(error);
    return []
  }
}


