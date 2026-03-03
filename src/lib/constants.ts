export const DEFAULT_CITY_ID = process.env.NEXT_PUBLIC_CITY_ID || "dharamshala";
export const DEFAULT_CITY_LABEL = process.env.NEXT_PUBLIC_CITY_LABEL || "Dharamshala";
export const REQUIRE_APPROVAL = process.env.NEXT_PUBLIC_REQUIRE_APPROVAL === "1";

export const DHARAMSHALA_AREAS = [
  "HPU Campus",
  "Sidhpur",
  "Kotwali Bazaar",
  "McLeodganj",
  "Dari",
  "Sheela Chowk",
] as const;

export const DEFAULT_INSTITUTION_LABEL = "HPU";
export const INSTITUTIONS = [
  "Himachal Pradesh University (HPU)",
  "Central University of Himachal Pradesh",
  "Govt College Dharamshala",
  "Nursing Colleges",
  "ITI Dharamshala",
] as const;

export const ITEM_CATEGORIES = [
  "Room Heater",
  "Geyser",
  "Mattress",
  "Study Table",
  "Induction",
  "Gas Cylinder",
  "Scooter",
  "Warm Blankets",
  "Snow Boots",
] as const;

export const ROOM_GENDER_ALLOWED = ["Any", "Boys", "Girls"] as const;
export const ITEM_CONDITION = ["New", "Like new", "Good", "Fair"] as const;
