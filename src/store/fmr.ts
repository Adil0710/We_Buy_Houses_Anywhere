import { create } from 'zustand';

interface BasicData {
  zip_code: string;
  Efficiency: number;
  'One-Bedroom': number;
  'Two-Bedroom': number;
  'Three-Bedroom': number;
  'Four-Bedroom': number;
}

interface FMRData {
  data: {
    county_name: string;
    counties_msa: string;
    town_name: string;
    metro_status: string;
    metro_name: string;
    area_name: string;
    smallarea_status: string;
    year: string;
    basicdata: BasicData[];
  };
}

interface State {
  state_code: string;
  state_name: string;
}

interface County {
  county_name: string;
  county_fips: string;
  fips_code: string;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

interface FMRState {
  data: FMRData | null;
  states: State[];
  counties: County[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchFMRData: (year: string, state: string, county: string) => Promise<void>;
  fetchStates: () => Promise<void>;
  fetchCounties: (stateCode: string) => Promise<void>;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
}

export const useFMRStore = create<FMRState>((set, get) => ({
  data: null,
  states: [],
  counties: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
    totalPages: 1,
  },
  fetchFMRData: async (year: string, state: string, county: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(
        `/api/fmr?year=${year}&state=${encodeURIComponent(state)}&county=${encodeURIComponent(county)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch FMR data');
      }
      
      const data = await response.json();
      const totalPages = Math.ceil(data.data.basicdata.length / get().pagination.itemsPerPage);
      
      set({ 
        data, 
        loading: false,
        pagination: {
          ...get().pagination,
          totalPages,
          currentPage: 1 // Reset to first page when new data is loaded
        }
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
    }
  },
  fetchStates: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch('/api/fmr/states');
      
      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }
      
      const states = await response.json();
      set({ states, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
    }
  },
  fetchCounties: async (stateCode: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/fmr/counties/${stateCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch counties');
      }
      
      const counties = await response.json();
      set({ counties, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
    }
  },
  setPage: (page) => {
    const { pagination } = get();
    if (page >= 1 && page <= pagination.totalPages) {
      set({ pagination: { ...pagination, currentPage: page } });
    }
  },
  setItemsPerPage: (itemsPerPage) => {
    const { data, pagination } = get();
    if (data) {
      const totalPages = Math.ceil(data.data.basicdata.length / itemsPerPage);
      const currentPage = Math.min(pagination.currentPage, totalPages);
      set({
        pagination: {
          itemsPerPage,
          totalPages,
          currentPage
        }
      });
    }
  }
}));