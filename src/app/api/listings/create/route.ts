import { NextRequest, NextResponse } from "next/server";
import { withAuth, type AuthenticatedUser } from "@/lib/auth/middleware";
import { createRoom, createItem } from "@/lib/firebase/listings";
import { SpamLimitError, getRemainingListingsToday } from "@/lib/firebase/anti-spam";
import { adminRef, userRef } from "@/lib/firebase/refs";
import { getDoc } from "firebase/firestore";
import { z } from "zod";

// Validation schemas
const roomListingSchema = z.object({
  title: z.string().min(3).max(100),
  area: z.string().min(2).max(50),
  description: z.string().max(1200).optional(),
  contactPhone: z.string().regex(/^\+?[0-9]{8,15}$/, "Invalid phone number"),
  rent: z.number().min(0).max(100000),
  deposit: z.number().min(0).max(100000),
  genderAllowed: z.enum(["male", "female", "any"]),
  address: z.string().max(200),
  institution: z.string().max(100).optional(),
  sunFacing: z.boolean().optional(),
  mountainView: z.boolean().optional(),
});

const itemListingSchema = z.object({
  title: z.string().min(3).max(100),
  area: z.string().min(2).max(50),
  description: z.string().max(1200).optional(),
  contactPhone: z.string().regex(/^\+?[0-9]{8,15}$/, "Invalid phone number"),
  price: z.number().min(0).max(100000),
  category: z.string().min(2).max(50),
  condition: z.string().min(2).max(50),
});

// Helper function to verify user exists and is valid
async function verifyUser(userId: string) {
  const userDoc = await getDoc(userRef(userId));
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }
  return userDoc.data();
}

// Validate listing data
function validateListingData(data: any, type: "room" | "item") {
  const schema = type === "room" ? roomListingSchema : itemListingSchema;
  return schema.parse(data);
}

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Verify user exists in database
    await verifyUser(user.uid);

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

    // Validate listing data with Zod
    try {
      validateListingData(listingData, type as "room" | "item");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "Invalid listing data", 
          details: error.issues 
        }, { status: 400 });
      }
      throw error;
    }

    // Add user ID to listing data
    listingData.createdBy = user.uid;
    listingData.createdByEmail = user.email;

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
    const remainingListings = await getRemainingListingsToday(user.uid);

    return NextResponse.json({
      success: true,
      listingId,
      message: "Listing created successfully",
      remainingListingsToday: remainingListings
    });

  } catch (error) {
    console.error("Error creating listing:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create listing";
    const statusCode = errorMessage.includes("not found") ? 404 :
                      errorMessage.includes("Invalid") ? 400 :
                      errorMessage.includes("Unauthorized") ? 401 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
});

export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Verify user exists
    await verifyUser(user.uid);

    // Get remaining listings for today
    const remainingListings = await getRemainingListingsToday(user.uid);
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
    const statusCode = errorMessage.includes("not found") ? 404 :
                      errorMessage.includes("Unauthorized") ? 401 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
});
