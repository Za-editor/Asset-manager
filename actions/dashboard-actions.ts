"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const AssetSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  categoryId: z.number().positive("Please select a category"),
  fileUrl: z.string().url("Invalid file Url"),
  thumbnailUrl: z.string().url("Invalid file Url").optional(),
});

export async function getCategoriesAction() {
  try {
    return db.select().from(category);
  } catch (error) {
    console.log(error);
  }
}

export async function uploadAsset(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("You must be logged in to upload asset");
  }

  try {
    const validateFields = AssetSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
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
    console.error(error);
    return {
      success: false,
      error: "Failed to upload Asset",
    };
  }
}

export async function getUserAssetsAction(userid: string) {
  try {
    return db
      .select()
      .from(asset)
      .where(eq(asset.userId, userid))
      .orderBy(asset.createdAt);
  } catch (error) {
      return [];
      console.log(error);
      
  }
}
