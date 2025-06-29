"use server";

import { deleteUser, editUser, createApiKey, deleteApiKey } from "@repo/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function deleteUserWrapper() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await deleteUser(session.user.id);
}

export async function editUserWrapper(formData: any, key: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await editUser(formData, key, session.user.id);
}

export async function updateUserPassword(newPassword: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const ctx = await auth.$context;
    const hash = await ctx.password.hash(newPassword);
    await ctx.internalAdapter.updatePassword(session.user.id, hash);
}

export async function createUserApiKeyWrapper(name: string, expiresAt?: Date) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await createApiKey({
      userId: session.user.id,
      name
    });

    return { key: result.key };
  } catch (error) {
    console.error("Error creating user API key:", error);
    throw new Error("Failed to create API key");
  }
}

export async function deleteUserApiKeyWrapper(apiKeyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await deleteApiKey(apiKeyId, session.user.id);
  } catch (error) {
    console.error("Error deleting user API key:", error);
    throw new Error("Failed to delete API key");
  }
}