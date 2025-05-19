import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/database.types";

export const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Sports",
  "Tools",
  "Vehicles",
  "Other",
] as const;

export type ListingCategory = (typeof CATEGORIES)[number];

type ListingsContextType = {
  listings: Post[];
  userListings: Post[];
  isLoading: boolean;
  categories: typeof CATEGORIES;
  getListingById: (id: string) => Promise<Post | null>;
  deleteListing: (id: string) => Promise<void>;
  searchListings: (query: string) => Post[];
  filterListingsByCategory: (category: ListingCategory | "All") => Post[];
  refreshListings: () => Promise<void>;
};

const ListingsContext = createContext<ListingsContextType | undefined>(
  undefined
);

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

type CachedPost = {
  data: Post;
  timestamp: number;
};

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postCache, setPostCache] = useState<Record<string, CachedPost>>({});
  const { user } = useAuth();

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Update cache with fresh data
      const newCache: Record<string, CachedPost> = {};
      data?.forEach((post) => {
        newCache[post.id] = {
          data: post,
          timestamp: Date.now(),
        };
      });
      setPostCache(newCache);
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const userListings = listings.filter(
    (listing) => user && listing.user_id === user.id
  );

  const getListingById = async (id: string) => {
    try {
      // Check cache first
      const cachedPost = postCache[id];
      const now = Date.now();

      // If we have a valid cached post that hasn't expired
      if (cachedPost && now - cachedPost.timestamp < CACHE_EXPIRY_TIME) {
        return cachedPost.data;
      }

      // If not in cache or expired, fetch from API
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Update cache with new data
      if (data) {
        setPostCache((prev) => ({
          ...prev,
          [id]: {
            data,
            timestamp: now,
          },
        }));
      }

      return data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
      return null;
    }
  };

  const deleteListing = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

      // Update listings state and cache
      setListings((prevListings) =>
        prevListings.filter((listing) => listing.id !== id)
      );
      setPostCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
      throw error;
    }
  };

  const searchListings = (query: string): Post[] => {
    if (!query) return listings;

    const lowercaseQuery = query.toLowerCase();
    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(lowercaseQuery) ||
        listing.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterListingsByCategory = (
    category: ListingCategory | "All"
  ): Post[] => {
    if (category === "All") return listings;
    return listings.filter(
      (listing) =>
        Array.isArray(listing.category) && listing.category.includes(category)
    );
  };

  return (
    <ListingsContext.Provider
      value={{
        listings,
        userListings,
        isLoading,
        categories: CATEGORIES,
        getListingById,
        deleteListing,
        searchListings,
        filterListingsByCategory,
        refreshListings: fetchListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return context;
};
