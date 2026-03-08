import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { roomsRef, itemsRef } from "./refs";

const DAILY_LISTING_LIMIT = 4;

export class SpamLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpamLimitError";
  }
}

/**
 * Check if user has exceeded daily listing limit
 * @param userId - The user's ID
 * @returns Promise<boolean> - True if user can create more listings
 */
export async function canUserCreateListing(userId: string): Promise<boolean> {
  try {
    // Get today's start and end timestamps
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const startTimestamp = Timestamp.fromDate(todayStart);
    const endTimestamp = Timestamp.fromDate(todayEnd);

    // Count user's room listings created today
    const roomsQuery = query(
      roomsRef(),
      where("createdBy", "==", userId),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<", endTimestamp)
    );
    
    const roomsSnapshot = await getDocs(roomsQuery);
    const roomCount = roomsSnapshot.size;

    // Count user's item listings created today
    const itemsQuery = query(
      itemsRef(),
      where("createdBy", "==", userId),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<", endTimestamp)
    );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    const itemCount = itemsSnapshot.size;

    // Total listings created today
    const totalListings = roomCount + itemCount;

    return totalListings < DAILY_LISTING_LIMIT;
  } catch (error) {
    console.error("Error checking spam limit:", error);
    // In case of error, allow listing creation (fail-safe approach)
    return true;
  }
}

/**
 * Get user's current daily listing count
 * @param userId - The user's ID
 * @returns Promise<number> - Number of listings created today
 */
export async function getUserDailyListingCount(userId: string): Promise<number> {
  try {
    // Get today's start and end timestamps
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const startTimestamp = Timestamp.fromDate(todayStart);
    const endTimestamp = Timestamp.fromDate(todayEnd);

    // Count user's room listings created today
    const roomsQuery = query(
      roomsRef(),
      where("createdBy", "==", userId),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<", endTimestamp)
    );
    
    const roomsSnapshot = await getDocs(roomsQuery);
    const roomCount = roomsSnapshot.size;

    // Count user's item listings created today
    const itemsQuery = query(
      itemsRef(),
      where("createdBy", "==", userId),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<", endTimestamp)
    );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    const itemCount = itemsSnapshot.size;

    return roomCount + itemCount;
  } catch (error) {
    console.error("Error getting daily listing count:", error);
    return 0;
  }
}

/**
 * Validate user can create listing and throw error if limit exceeded
 * @param userId - The user's ID
 * @throws SpamLimitError if user has exceeded daily limit
 */
export async function validateListingCreation(userId: string): Promise<void> {
  const canCreate = await canUserCreateListing(userId);
  
  if (!canCreate) {
    const currentCount = await getUserDailyListingCount(userId);
    throw new SpamLimitError(
      `You can only post ${DAILY_LISTING_LIMIT} listings per day. You have already posted ${currentCount} listings today. Please try again tomorrow.`
    );
  }
}

/**
 * Get remaining listings user can create today
 * @param userId - The user's ID
 * @returns Promise<number> - Number of listings remaining
 */
export async function getRemainingListingsToday(userId: string): Promise<number> {
  const currentCount = await getUserDailyListingCount(userId);
  return Math.max(0, DAILY_LISTING_LIMIT - currentCount);
}
