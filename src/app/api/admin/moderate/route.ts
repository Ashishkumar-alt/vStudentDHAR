import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, type AdminUser } from "@/lib/auth/middleware";
import { approveRoom, rejectRoom, softDeleteRoom, approveItem, rejectItem, softDeleteItem } from "@/lib/firebase/listings";
import { adminRef, userRef } from "@/lib/firebase/refs";
import { getDoc, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/db";
import { z } from "zod";

// Validation schema for moderation actions
const moderationSchema = z.object({
  action: z.enum(["approve", "reject", "delete"]),
  type: z.enum(["room", "item"]),
  id: z.string().min(1),
  reason: z.string().optional(),
});

// Helper function to log admin actions
async function logAdminAction(admin: AdminUser, action: string, targetType: string, targetId: string, details?: any) {
  try {
    const { getFirebaseAdminFirestore } = await import("@/lib/firebase/admin-server");
    const db = getFirebaseAdminFirestore();
    await db.collection("admin_logs").add({
      adminId: admin.uid,
      adminEmail: admin.email,
      action,
      targetType,
      targetId,
      timestamp: new Date(),
      details: details || {},
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

export const POST = withAdminAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = moderationSchema.parse(body);
    const { action, type, id, reason } = validatedData;

    // Execute moderation action and log it
    const adminEmail = admin.email;

    switch (action) {
      case "approve":
        if (type === "room") {
          await approveRoom(id, admin.uid, adminEmail);
        } else {
          await approveItem(id, admin.uid, adminEmail);
        }
        await logAdminAction(admin, "approve", type, id);
        break;

      case "reject":
        if (type === "room") {
          await rejectRoom(id, admin.uid, adminEmail, reason);
        } else {
          await rejectItem(id, admin.uid, adminEmail, reason);
        }
        await logAdminAction(admin, "reject", type, id, { reason });
        break;

      case "delete":
        if (type === "room") {
          await softDeleteRoom(id, admin.uid, adminEmail, reason);
        } else {
          await softDeleteItem(id, admin.uid, adminEmail, reason);
        }
        await logAdminAction(admin, "delete", type, id, { reason });
        break;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${action} action completed successfully`,
      action,
      type,
      id
    });

  } catch (error) {
    console.error("Moderation API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.issues 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});

export const GET = withAdminAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    // Return admin verification status
    return NextResponse.json({ 
      success: true, 
      message: "Admin access verified",
      adminId: admin.uid,
      adminEmail: admin.email
    });

  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
});
