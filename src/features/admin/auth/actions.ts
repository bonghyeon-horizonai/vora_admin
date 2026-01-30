"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { OTP } from "otplib";
import qrcode from "qrcode";

import { createSession, deleteSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

// Instantiate OTP with TOTP strategy (default)
const authenticator = new OTP({ strategy: "totp" });

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const twoFactorToken = formData.get("twoFactorToken") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email));

  if (!admin || !admin.password) {
    // Return generic error to avoid enumeration, or handle mock default password if needed (e.g. for initial setup)
    // For now assuming existing admins might not have passwords set yet.
    return { error: "Invalid credentials" };
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);

  if (!isValidPassword) {
    return { error: "Invalid credentials" };
  }

  if (admin.twoFactorEnabled) {
    if (!twoFactorToken) {
      return { twoFactorRequired: true };
    }

    if (!admin.twoFactorSecret) {
      // Should not happen if enabled
      return { error: "2FA configuration error" };
    }

    const { valid } = await authenticator.verify({
      token: twoFactorToken,
      secret: admin.twoFactorSecret,
    });

    if (!valid) {
      return { error: "Invalid 2FA code" };
    }
  }

  // Create session
  await createSession(admin.id, admin.email, admin.role);

  return { success: true };
}

export async function generateTwoFactorSecret(adminId: string) {
  const secret = authenticator.generateSecret();
  // Using user-friendly name for the app
  const otpauth = authenticator.generateURI({
    secret,
    label: adminId,
    issuer: "Vora Admin",
  });
  const qrCodeUrl = await qrcode.toDataURL(otpauth);

  return { secret, qrCodeUrl };
}

export async function enableTwoFactor(
  adminId: string,
  secret: string,
  token: string,
) {
  const { valid } = await authenticator.verify({ token, secret });

  if (!valid) {
    return { error: "Invalid OTP code" };
  }

  await db
    .update(admins)
    .set({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    })
    .where(eq(admins.id, adminId));

  revalidatePath("/admins/[id]", "page");
  return { success: true };
}

export async function disableTwoFactor(adminId: string) {
  await db
    .update(admins)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
    })
    .where(eq(admins.id, adminId));

  revalidatePath("/admins/[id]", "page");
  return { success: true };
}

export async function adminLogout() {
  await deleteSession();
  return { success: true };
}
