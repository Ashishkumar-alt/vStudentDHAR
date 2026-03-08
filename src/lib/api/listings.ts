import { SpamLimitError } from "@/lib/firebase/anti-spam";

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
  type: "room" | "item",
  listingData: any,
  photos: File[],
  userId: string
): Promise<{ listingId: string; remainingListingsToday: number }> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("listingData", JSON.stringify(listingData));
  
  // Add photos
  photos.forEach((photo, index) => {
    formData.append(`photos`, photo);
  });

  const response = await fetch("/api/listings/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userId}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.code === "SPAM_LIMIT_EXCEEDED") {
      throw new SpamLimitError(data.error);
    }
    throw new ListingAPIError(data.error, data.code, response.status);
  }

  return data;
}

/**
 * Get user's current listing limits
 */
export async function getListingLimits(userId: string): Promise<ListingLimits> {
  const response = await fetch("/api/listings/create", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${userId}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ListingAPIError(data.error, undefined, response.status);
  }

  return data;
}
