import type { Timestamp } from "firebase/firestore";

export type ListingStatus = "active" | "sold";

export type RoomListing = {
  type: "room";
  cityId: string;
  areaId?: string;
  institution?: string;
  title: string;
  rent: number;
  deposit: number;
  area: string;
  address: string;
  genderAllowed: "Any" | "Boys" | "Girls";
  vegOnly?: boolean;
  attachedBathroom: boolean;
  foodIncluded: boolean;
  heaterIncluded?: boolean;
  walkMinutesToHPU?: number;
  sunFacing?: boolean;
  mountainView?: boolean;
  description: string;
  photoUrls: string[];
  contactPhone: string;
  status: ListingStatus;
  approved: boolean;
  createdBy: string;
  createdByMemberSinceYear?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ItemListing = {
  type: "item";
  cityId: string;
  areaId?: string;
  institution?: string;
  title: string;
  category: string;
  price: number;
  condition: string;
  area: string;
  description: string;
  photoUrls: string[];
  contactPhone: string;
  status: ListingStatus;
  approved: boolean;
  createdBy: string;
  createdByMemberSinceYear?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Favorite = {
  listingType: "room" | "item";
  listingId: string;
  createdAt: Timestamp;
};

export type ReportStatus = "open" | "resolved" | "ignored";

export type Report = {
  listingType: "room" | "item";
  listingId: string;
  reason: "Spam" | "Fake" | "Wrong info" | "Other";
  details?: string;
  status?: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
};

export type UserProfile = {
  uid: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  name?: string;
  college?: string;
  institution?: string;
  userType?: "student" | "landlord";
  photoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
