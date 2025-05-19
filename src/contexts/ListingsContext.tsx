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
import { Post, Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type ListingsContextType = {
  listings: Post[];
  userListings: Post[];
  isLoading: boolean;
  categories: string[];
  getListingById: (id: string) => Promise<Post | null>;
  deleteListing: (id: string) => Promise<void>;
  searchListings: (query: string) => Post[];
  filterListingsByCategory: (category: string | "Todos") => Post[];
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

const postCache = new Map<string, CachedPost>();

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return context;
};

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Post[]>([]);
  const [userListings, setUserListings] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data.map((cat) => cat.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Update cache with new data
      const now = Date.now();
      const newCache: Record<string, CachedPost> = {};
      data?.forEach((post) => {
        newCache[post.id] = {
          data: post,
          timestamp: now,
        };
      });
      postCache.clear();
      for (const [id, cachedPost] of Object.entries(newCache)) {
        postCache.set(id, cachedPost);
      }
      setListings(data || []);

      // Update user listings
      if (user) {
        const userPosts =
          data?.filter((post) => post.user_id === user.id) || [];
        setUserListings(userPosts);
      } else {
        setUserListings([]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Error fetching listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getListingById = async (id: string): Promise<Post | null> => {
    try {
      // Check cache first
      const cachedPost = postCache.get(id);
      const now = Date.now();

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
        postCache.set(id, {
          data,
          timestamp: now,
        });
      }

      return data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      return null;
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      setListings((prevListings) =>
        prevListings.filter((listing) => listing.id !== id)
      );
      setUserListings((prevListings) =>
        prevListings.filter((listing) => listing.id !== id)
      );
      postCache.delete(id);

      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Error deleting listing. Please try again.");
    }
  };

  const searchListings = (query: string): Post[] => {
    const searchTerm = query.toLowerCase();
    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
    );
  };

  const filterListingsByCategory = (category: string | "Todos"): Post[] => {
    if (category === "Todos") return listings;
    return listings.filter(
      (listing) =>
        Array.isArray(listing.category) && listing.category.includes(category)
    );
  };

  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, [user]);

  return (
    <ListingsContext.Provider
      value={{
        listings,
        userListings,
        isLoading,
        categories,
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
