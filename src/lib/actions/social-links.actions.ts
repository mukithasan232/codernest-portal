"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PlatformType } from "@prisma/client";

// Get all active social links for the public footer
export async function getPublicSocialLinks() {
  try {
    const links = await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return { success: true, data: links };
  } catch (error: any) {
    console.error("Error fetching public social links:", error);
    return { success: false, error: "Failed to load social links" };
  }
}

// Get all social links for the admin panel
export async function getAllSocialLinksAdmin() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { order: "asc" },
    });
    return { success: true, data: links };
  } catch (error: any) {
    console.error("Error fetching all social links:", error);
    return { success: false, error: "Failed to load social links" };
  }
}

// Create a new social link
export async function createSocialLink(data: { platform: PlatformType; label: string; url: string }) {
  try {
    // Get the current max order
    const lastLink = await prisma.socialLink.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = lastLink ? lastLink.order + 1 : 0;

    const link = await prisma.socialLink.create({
      data: {
        ...data,
        order: nextOrder,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { success: true, data: link };
  } catch (error: any) {
    console.error("Error creating social link:", error);
    return { success: false, error: "Failed to create social link" };
  }
}

// Update a social link
export async function updateSocialLink(id: string, data: Partial<{ platform: PlatformType; label: string; url: string; order: number; isActive: boolean }>) {
  try {
    const link = await prisma.socialLink.update({
      where: { id },
      data,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { success: true, data: link };
  } catch (error: any) {
    console.error("Error updating social link:", error);
    return { success: false, error: "Failed to update social link" };
  }
}

// Delete a social link
export async function deleteSocialLink(id: string) {
  try {
    await prisma.socialLink.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting social link:", error);
    return { success: false, error: "Failed to delete social link" };
  }
}

// Toggle a social link's active status
export async function toggleSocialLinkActive(id: string, isActive: boolean) {
  return updateSocialLink(id, { isActive });
}
