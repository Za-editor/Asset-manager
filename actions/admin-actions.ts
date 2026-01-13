"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const CategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(50, "Category name must be at most 50 characters long"),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

export async function addNewCategoryAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    const name = formData.get("name") as string;

    const validateFields = CategorySchema.parse({ name });
    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.name, validateFields.name))
      .limit(1);

    if (existingCategory.length > 0) {
      return {
        success: false,
        message: "Category already exists",
      };
    }

    await db.insert(category).values({
      name: validateFields.name,
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: "Category created successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "failed to add category",
    };
  }
}

export async function getAllCategorisAction() {
  try {
    return await db.select().from(category).orderBy(category.name);
  } catch (error) {
    console.log(error);
    return []
  }
}

export async function getTotalUsersCountAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

    try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(user);
        return result[0]?.count || 0;
  } catch (error) {
    console.log(error);
    return 0
  }
}
