import { NextRequest, NextResponse } from "next/server";
import { createRoom, createItem } from "@/lib/firebase/listings";
import { SpamLimitError, getRemainingListingsToday } from "@/lib/firebase/anti-spam";
import { adminRef, userRef } from "@/lib/firebase/refs";
import { getDoc } from "firebase/firestore";

// Helper function to verify user authentication
async function verifyUser(userId: string) {
  const userDoc = await getDoc(userRef(userId));
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }
  return userDoc.data();
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    const userId = authHeader.split(" ")[1];
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid user ID" }, { status: 401 });
    }

    // Verify user exists
    await verifyUser(userId);

    // Parse form data
    const formData = await request.formData();
    const type = formData.get("type") as string;
    const listingData = JSON.parse(formData.get("listingData") as string);
    const photos = formData.getAll("photos") as File[];

    // Validate required fields
    if (!type || !listingData) {
      return NextResponse.json({ error: "Missing required fields: type and listingData" }, { status: 400 });
    }

    if (!["room", "item"].includes(type)) {
      return NextResponse.json({ error: "Invalid listing type. Must be 'room' or 'item'" }, { status: 400 });
    }

    // Add userId to listing data
    listingData.createdBy = userId;

    // Create listing based on type
    let listingId: string;
    try {
      if (type === "room") {
        listingId = await createRoom(listingData, photos);
      } else {
        listingId = await createItem(listingData, photos);
      }
    } catch (error) {
      if (error instanceof SpamLimitError) {
        return NextResponse.json({ 
          error: error.message,
          code: "SPAM_LIMIT_EXCEEDED"
        }, { status: 429 }); // Too Many Requests
      }
      throw error;
    }

    // Get remaining listings for user info
    const remainingListings = await getRemainingListingsToday(userId);

    return NextResponse.json({
      success: true,
      listingId,
      message: "Listing created successfully",
      remainingListingsToday: remainingListings
    });

  } catch (error) {
    console.error("Error creating listing:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create listing";
    const statusCode = errorMessage.includes("Unauthorized") ? 401 : 
                      errorMessage.includes("not found") ? 404 :
                      errorMessage.includes("Invalid") ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
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

    const userId = authHeader.split(" ")[1];
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid user ID" }, { status: 401 });
    }

    // Verify user exists
    await verifyUser(userId);

    // Get remaining listings for today
    const remainingListings = await getRemainingListingsToday(userId);
    const currentCount = 4 - remainingListings; // Since limit is 4

    return NextResponse.json({
      success: true,
      dailyLimit: 4,
      currentCount,
      remainingListings,
      canCreateMore: remainingListings > 0
    });

  } catch (error) {
    console.error("Error getting listing limits:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to get listing limits";
    const statusCode = errorMessage.includes("Unauthorized") ? 401 : 
                      errorMessage.includes("not found") ? 404 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
