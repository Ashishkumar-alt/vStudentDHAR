import { addDoc, serverTimestamp } from "firebase/firestore";
import type { AdminLog, AdminLogAction } from "./models";
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
    console.error("Failed to log admin action:", error);
    // Don't throw error to avoid breaking main functionality
  }
}
