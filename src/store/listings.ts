import { create } from 'zustand';
import { getListings } from '@/lib/api';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Rating {
  accuracy?: number;
  checking?: number;
  cleanliness?: number;
  communication?: number;
  location?: number;
  value?: number;
  guestSatisfaction?: number;
  reviewsCount?: number;
}

interface Host {
  id: string;
  name: string;
  profileImage: string;
  isSuperHost: boolean;
}

interface Price {
  label: string;
  price: string;
}

interface ImageItem {
  caption: string;
  imageUrl: string;
  orientation?: string;
}

export interface Listing {
  id: string;
  coordinates: Coordinates;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  propertyType: string;
  roomType: string;
  personCapacity: number;
  rating: Rating;
  location: string;
  locationSubtitle: string;
  host: Host;
  price: Price;
  images: ImageItem[];
  distance?: number;
  amenities?: { title: string; values: { title: string; icon: string; available: boolean }[] }[];
  latitude: number;
  longitude:number
}

interface ApiResponse {
  success: boolean;
  listings: Listing[];
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

interface ListingState {
  location: string;
  listings: Listing[];
  allListings: Listing[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  setLocation: (location: string) => void;
  searchListings: () => Promise<void>;
  resetListings: () => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  location: '',
  listings: [],
  allListings: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
    totalPages: 1,
  },
  
  setLocation: (location) => set({ location }),
  
  searchListings: async () => {
    const { location, pagination } = get();
    
    if (!location.trim()) {
      set({ error: 'Location is required' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const data = await getListings(location);
      const allListings = data.listings;
      const totalPages = Math.ceil(allListings.length / pagination.itemsPerPage);
      
      // Get current page listings
      const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const endIndex = startIndex + pagination.itemsPerPage;
      const currentPageListings = allListings.slice(startIndex, endIndex);
      
      set({ 
        allListings,
        listings: currentPageListings,
        loading: false,
        pagination: {
          ...pagination,
          totalPages
        }
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false 
      });
    }
  },
  
  resetListings: () => set({ 
    listings: [], 
    allListings: [], 
    error: null,
    pagination: {
      currentPage: 1,
      itemsPerPage: 5,
      totalPages: 1,
    }
  }),
  
  setPage: (page) => {
    const { pagination, allListings } = get();
    
    if (page < 1 || page > pagination.totalPages) {
      return;
    }
    
    const startIndex = (page - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const currentPageListings = allListings.slice(startIndex, endIndex);
    
    set({
      listings: currentPageListings,
      pagination: {
        ...pagination,
        currentPage: page
      }
    });
  },
  
  setItemsPerPage: (itemsPerPage) => {
    const { pagination, allListings } = get();
    const totalPages = Math.ceil(allListings.length / itemsPerPage);
    const newCurrentPage = Math.min(pagination.currentPage, totalPages);
    
    const startIndex = (newCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageListings = allListings.slice(startIndex, endIndex);
    
    set({
      listings: currentPageListings,
      pagination: {
        currentPage: newCurrentPage,
        itemsPerPage,
        totalPages
      }
    });
  }
}));