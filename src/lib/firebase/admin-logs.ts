import { addDoc, serverTimestamp } from "firebase/firestore";
import type { AdminLogAction } from "./models";
import { adminLogsRef } from "./refs";

export async function logAdminAction({
  adminId,
  adminEmail,
  action,
  targetType,
  targetId,
  targetTitle,
  reason,
  ipAddress,
  userAgent,
}: {
  adminId: string;
  adminEmail: string;
  action: AdminLogAction;
  targetType: "room" | "item" | "report" | "user";
  targetId: string;
  targetTitle?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await addDoc(adminLogsRef(), {
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      targetTitle,
      reason,
      timestamp: serverTimestamp(),
      ipAddress,
      userAgent,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "permission-denied"
    ) {
      return;
    }

    console.error("Failed to log admin action:", error);
  }
}
