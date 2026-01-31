import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MarketplaceFilters {
  keyword?: string;
  category?: string;
  hsCode?: string;
  priceMin?: number;
  priceMax?: number;
  region?: string;
  maxDistanceKm?: number;
}

interface MarketplaceState {
  // Search filters
  filters: MarketplaceFilters;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  resetFilters: () => void;

  // Sorting
  sortBy: 'createdAt' | 'price' | 'distance' | 'viewCount';
  sortOrder: 'ASC' | 'DESC';
  setSortBy: (sort: 'createdAt' | 'price' | 'distance' | 'viewCount') => void;
  setSortOrder: (order: 'ASC' | 'DESC') => void;

  // View mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // User location (for distance-based search)
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;

  // Active tab for marketplace
  activeTab: 'products' | 'rfqs';
  setActiveTab: (tab: 'products' | 'rfqs') => void;
}

const defaultFilters: MarketplaceFilters = {
  keyword: undefined,
  category: undefined,
  hsCode: undefined,
  priceMin: undefined,
  priceMax: undefined,
  region: undefined,
  maxDistanceKm: undefined,
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set) => ({
      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Sorting
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),

      // View mode
      viewMode: 'grid',
      setViewMode: (viewMode) => set({ viewMode }),

      // User location
      userLocation: null,
      setUserLocation: (userLocation) => set({ userLocation }),

      // Active tab
      activeTab: 'products',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        userLocation: state.userLocation,
      }),
    }
  )
);
