import { getDocs, query, where } from "firebase/firestore";
import { roomsRef, itemsRef } from "./refs";

export const DAILY_LISTING_LIMIT = 4;

export class SpamLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpamLimitError";
  }
}

function isCreatedToday(value: unknown): boolean {
  if (!value || typeof value !== "object" || !("toDate" in value) || typeof value.toDate !== "function") {
    return false;
  }

  const createdAt = value.toDate() as Date;
  const now = new Date();

  return (
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth() &&
    createdAt.getDate() === now.getDate()
  );
}

async function countListingsCreatedToday(userId: string): Promise<number> {
  const roomsQuery = query(roomsRef(), where("createdBy", "==", userId));
  const itemsQuery = query(itemsRef(), where("createdBy", "==", userId));

  const [roomsSnapshot, itemsSnapshot] = await Promise.all([
    getDocs(roomsQuery),
    getDocs(itemsQuery),
  ]);

  const roomCount = roomsSnapshot.docs.filter((doc) => isCreatedToday(doc.data().createdAt)).length;
  const itemCount = itemsSnapshot.docs.filter((doc) => isCreatedToday(doc.data().createdAt)).length;

  return roomCount + itemCount;
}

/**
 * Check if user has exceeded daily listing limit
 * @param userId - The user's ID
 * @returns Promise<boolean> - True if user can create more listings
 */
export async function canUserCreateListing(userId: string): Promise<boolean> {
  try {
    const totalListings = await countListingsCreatedToday(userId);
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
    return await countListingsCreatedToday(userId);
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
