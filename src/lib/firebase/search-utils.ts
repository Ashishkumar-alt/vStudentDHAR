import { where, query, orderBy, limit, collection, getDocs, DocumentData } from "firebase/firestore";
import { roomsRef, itemsRef } from "./refs";

// Search utilities for Firestore
export interface SearchOptions {
  query?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  sortBy?: "newest" | "price_low" | "price_high";
  limit?: number;
}

/**
 * Search rooms with text search and filters
 * Note: Firestore doesn't have native text search, so we'll use a combination of techniques
 */
export async function searchRooms(searchOptions: SearchOptions) {
  const {
    query: searchQuery,
    area,
    minPrice,
    maxPrice,
    gender,
    sortBy = "newest",
    limit: resultLimit = 50,
  } = searchOptions;

  try {
    // Build base query
    let q = query(
      roomsRef(),
      where("status", "==", "active"),
      where("cityId", "==", "dharamshala") // Assuming this is your city ID
    );

    // Add filters
    if (area && area !== "all") {
      q = query(q, where("area", "==", area));
    }

    if (minPrice !== undefined) {
      q = query(q, where("rent", ">=", minPrice));
    }

    if (maxPrice !== undefined) {
      q = query(q, where("rent", "<=", maxPrice));
    }

    if (gender && gender !== "any") {
      q = query(q, where("genderAllowed", "==", gender));
    }

    // Add sorting
    switch (sortBy) {
      case "price_low":
        q = query(q, orderBy("rent", "asc"));
        break;
      case "price_high":
        q = query(q, orderBy("rent", "desc"));
        break;
      case "newest":
      default:
        q = query(q, orderBy("createdAt", "desc"));
        break;
    }

    // Add limit
    q = query(q, limit(resultLimit));

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));

    // Client-side text search filtering
    if (searchQuery && searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      
      results = results.filter(({ data }) => {
        const searchableText = [
          data.title || "",
          data.description || "",
          data.area || "",
          data.address || "",
        ].join(" ").toLowerCase();

        // Check if all search terms are present
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    return results;
  } catch (error) {
    console.error("Error searching rooms:", error);
    return [];
  }
}

/**
 * Search items with text search and filters
 */
export async function searchItems(searchOptions: SearchOptions) {
  const {
    query: searchQuery,
    area,
    minPrice,
    maxPrice,
    sortBy = "newest",
    limit: resultLimit = 50,
  } = searchOptions;

  try {
    // Build base query
    let q = query(
      itemsRef(),
      where("status", "==", "active"),
      where("cityId", "==", "dharamshala")
    );

    // Add filters
    if (area && area !== "all") {
      q = query(q, where("area", "==", area));
    }

    if (minPrice !== undefined) {
      q = query(q, where("price", ">=", minPrice));
    }

    if (maxPrice !== undefined) {
      q = query(q, where("price", "<=", maxPrice));
    }

    // Add sorting
    switch (sortBy) {
      case "price_low":
        q = query(q, orderBy("price", "asc"));
        break;
      case "price_high":
        q = query(q, orderBy("price", "desc"));
        break;
      case "newest":
      default:
        q = query(q, orderBy("createdAt", "desc"));
        break;
    }

    // Add limit
    q = query(q, limit(resultLimit));

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));

    // Client-side text search filtering
    if (searchQuery && searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      
      results = results.filter(({ data }) => {
        const searchableText = [
          data.title || "",
          data.description || "",
          data.category || "",
          data.area || "",
          data.condition || "",
        ].join(" ").toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    return results;
  } catch (error) {
    console.error("Error searching items:", error);
    return [];
  }
}

/**
 * Get search suggestions based on popular areas and terms
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  const suggestions = [
    // Popular areas
    "McLeodganj", "Bhagsu", "Temple Road", "Jogiwara Road",
    "Sidhbari", "Central University", "University Gate",
    "Dharamshala", "Kachcheri", "Sakoh Upper",
    
    // Popular search terms
    "attached bathroom", "veg only", "heater", "winter ready",
    "walking distance", "cheap", "affordable", "premium",
    
    // Common categories for items
    "room heater", "winter essentials", "study table", "chair",
    "laptop", "phone", "bicycle", "scooter",
  ];

  return suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 8);
}

/**
 * Advanced search with multiple criteria
 */
export async function advancedSearch(searchOptions: SearchOptions & {
  amenities?: string[];
  services?: string[];
  postedWithin?: "1day" | "3days" | "1week" | "1month";
}) {
  const { amenities, services, postedWithin, ...basicOptions } = searchOptions;

  // Get basic search results first
  let results = await Promise.all([
    searchRooms(basicOptions),
    searchItems(basicOptions),
  ]);

  // Apply advanced filters
  if (amenities && amenities.length > 0) {
    results[0] = results[0].filter(({ data }) => {
      return amenities.every(amenity => {
        switch (amenity) {
          case "attachedBathroom":
            return data.attachedBathroom === true;
          case "foodIncluded":
            return data.foodIncluded === true;
          case "heaterIncluded":
            return data.heaterIncluded === true;
          case "vegOnly":
            return data.vegOnly === true;
          default:
            return true;
        }
      });
    });
  }

  if (services && services.length > 0) {
    results[0] = results[0].filter(({ data }) => {
      return services.every(service => {
        switch (service) {
          case "wifi":
            return data.wifiIncluded === true;
          case "parking":
            return data.parkingAvailable === true;
          case "laundry":
            return data.laundryService === true;
          default:
            return true;
        }
      });
    });
  }

  // Filter by posting date
  if (postedWithin) {
    const now = new Date();
    let cutoffDate: Date;

    switch (postedWithin) {
      case "1day":
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "3days":
        cutoffDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case "1week":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1month":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    results = results.map(typeResults => 
      typeResults.filter(({ data }) => {
        const createdAt = data.createdAt?.toDate?.();
        return createdAt && createdAt >= cutoffDate;
      })
    );
  }

  return {
    rooms: results[0],
    items: results[1],
  };
}

/**
 * Get popular search terms for analytics
 */
export async function getPopularSearchTerms(): Promise<Array<{term: string; count: number}>> {
  // This would typically come from a search analytics collection
  // For now, return mock data
  return [
    { term: "rooms near university", count: 245 },
    { term: "cheap rooms", count: 189 },
    { term: "attached bathroom", count: 156 },
    { term: "room heater", count: 134 },
    { term: "winter ready", count: 98 },
  ];
}
