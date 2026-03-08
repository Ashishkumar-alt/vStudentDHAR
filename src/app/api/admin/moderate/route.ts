import { NextRequest, NextResponse } from "next/server";
import { approveRoom, rejectRoom, softDeleteRoom, approveItem, rejectItem, softDeleteItem } from "@/lib/firebase/listings";
import { adminRef, userRef } from "@/lib/firebase/refs";
import { getDoc, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/db";

// Helper function to get user email from Firestore
async function getUserEmail(uid: string): Promise<string> {
  const userDoc = await getDoc(userRef(uid));
  const userData = userDoc.data();
  return userData?.email || "admin@vstudent.in";
}

// Helper function to verify admin status and get user info
async function getAdminInfo(uid: string) {
  const [adminDoc, userDoc] = await Promise.all([
    getDoc(adminRef(uid)),
    getDoc(userRef(uid))
  ]);
  
  if (!adminDoc.exists()) {
    throw new Error("Admin access required");
  }
  
  const userData = userDoc.data();
  return {
    isAdmin: true,
    adminEmail: userData?.email || "admin@vstudent.in"
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    // Extract token (in a real app, you'd verify this token)
    const token = authHeader.split(" ")[1];
    
    // For now, we'll assume the token contains the user ID
    // In production, you'd verify the Firebase ID token
    const userId = token || ""; // Ensure userId is not undefined

    // Verify admin status and get admin info
    const adminInfo = await getAdminInfo(userId);

    const body = await request.json();
    const { action, type, id, reason } = body;

    if (!action || !type || !id) {
      return NextResponse.json({ error: "Missing required fields: action, type, id" }, { status: 400 });
    }

    if (!["approve", "reject", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!["room", "item"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const adminEmail = adminInfo.adminEmail;

    // Execute moderation action
    switch (action) {
      case "approve":
        if (type === "room") {
          await approveRoom(id, userId, adminEmail);
        } else {
          await approveItem(id, userId, adminEmail);
        }
        break;

      case "reject":
        if (type === "room") {
          await rejectRoom(id, userId, adminEmail, reason);
        } else {
          await rejectItem(id, userId, adminEmail, reason);
        }
        break;

      case "delete":
        if (type === "room") {
          await softDeleteRoom(id, userId, adminEmail, reason);
        } else {
          await softDeleteItem(id, userId, adminEmail, reason);
        }
        break;
    }

    return NextResponse.json({ success: true, message: `${action} action completed` });

  } catch (error) {
    console.error("Moderation API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userId = token || ""; // Ensure userId is not undefined

    // Verify admin status and get admin info
    const adminInfo = await getAdminInfo(userId);

    return NextResponse.json({ 
      success: true, 
      message: "Admin access verified",
      adminId: userId 
    });

  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
