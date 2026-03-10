import {
  DAILY_LISTING_LIMIT,
  SpamLimitError,
  getRemainingListingsToday,
  getUserDailyListingCount,
} from "@/lib/firebase/anti-spam";
import { createItem, createRoom } from "@/lib/firebase/listings";
import type { ItemListing, RoomListing } from "@/lib/firebase/models";

type CreateRoomPayload = Omit<RoomListing, "createdAt" | "updatedAt" | "status" | "createdBy">;
type CreateItemPayload = Omit<ItemListing, "createdAt" | "updatedAt" | "status" | "createdBy">;

export interface ListingLimits {
  dailyLimit: number;
  currentCount: number;
  remainingListings: number;
  canCreateMore: boolean;
}

export class ListingAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ListingAPIError";
  }
}

/**
 * Create a listing via API with spam protection
 */
export async function createListingAPI(
  type: "room",
  listingData: CreateRoomPayload,
  photos: File[],
  userId: string
): Promise<{ listingId: string; remainingListingsToday: number }>;
export async function createListingAPI(
  type: "item",
  listingData: CreateItemPayload,
  photos: File[],
  userId: string
): Promise<{ listingId: string; remainingListingsToday: number }>;
export async function createListingAPI(
  type: "room" | "item",
  listingData: CreateRoomPayload | CreateItemPayload,
  photos: File[],
  userId: string
): Promise<{ listingId: string; remainingListingsToday: number }> {
  try {
    const listingId =
      type === "room"
        ? await createRoom({ ...(listingData as CreateRoomPayload), createdBy: userId }, photos)
        : await createItem({ ...(listingData as CreateItemPayload), createdBy: userId }, photos);

    return {
      listingId,
      remainingListingsToday: await getRemainingListingsToday(userId),
    };
  } catch (error) {
    if (error instanceof SpamLimitError) {
      throw error;
    }

    throw new ListingAPIError(
      error instanceof Error ? error.message : "Failed to create listing"
    );
  }
}

/**
 * Get user's current listing limits
 */
export async function getListingLimits(userId: string): Promise<ListingLimits> {
  try {
    const currentCount = await getUserDailyListingCount(userId);
    const remainingListings = Math.max(0, DAILY_LISTING_LIMIT - currentCount);

    return {
      dailyLimit: DAILY_LISTING_LIMIT,
      currentCount,
      remainingListings,
      canCreateMore: remainingListings > 0,
    };
  } catch (error) {
    throw new ListingAPIError(
      error instanceof Error ? error.message : "Failed to get listing limits"
    );
  }
}
