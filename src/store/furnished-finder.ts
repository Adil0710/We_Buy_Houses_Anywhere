import { create } from "zustand";

export interface FurnishedFinderListing {
  url: string;
  scrapedAt: string;
  name: string;
  lastUpdated: string;
  id: string;
  locationAndType: Array<{
    type: string;
    location: string;
  }>;
  paymentDetails: Array<{
    price: string;
    remarks: string[];
    fees: Array<{
      [key: string]: string;
    }>;
  }>;
  propertySpecs: Array<{
    [key: string]: string;
  }>;
  closestFacilities: Array<{
    facility: string;
    distance: string;
  }>;
  description: string;
  roomsAndBeds: Array<{
    [key: string]: string;
  }>;
  amenities: Array<{
    [key: string]: string[] | string;
  }>;
  houseRules: Array<{
    [key: string]: string;
  }>;
  reviews: Array<{
    date: string;
    rating: string;
    review: string;
  }>;
  aboutTheLandlord: Array<{
    areOnlinePaymentsAccepted: boolean;
    isEmailVerified: boolean;
    isPhoneNumberVerified: boolean;
    name: string;
    tenure: string;
    location: string;
    about: string;
    profileLink: string;
  }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: string[];
}

interface FurnishedFinderState {
  listings: FurnishedFinderListing[];
  loadingg: boolean;
  error: string | null;
  fetchListings: (city: string, state: string) => Promise<void>;
}

export const useFurnishedFinderStore = create<FurnishedFinderState>((set) => ({
  listings: [],
  loadingg: false,
  error: null,
  fetchListings: async ( state: string, city: string) => {
    try {
      set({ loadingg: true, error: null });

      // Remove "County" if it exists and replace spaces with hyphens
      const formattedCity = city
        .replace(/\s*County\s*$/i, "")
        .replace(/ /g, "-");

      const response = await fetch("/api/furnishedfinder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: formattedCity, state }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      set({ listings: data.data, loadingg: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loadingg: false,
      });
    }
  },
}));
