
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

// Define types
export type ListingCategory = 
  | "Furniture" 
  | "Electronics" 
  | "Clothing" 
  | "Home Goods" 
  | "Services" 
  | "Other";

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
};

type NewListing = Omit<Listing, "id" | "sellerId" | "sellerName" | "sellerPhone" | "createdAt">;

type ListingsContextType = {
  listings: Listing[];
  userListings: Listing[];
  isLoading: boolean;
  categories: ListingCategory[];
  getListingById: (id: string) => Listing | undefined;
  createListing: (listing: NewListing) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  searchListings: (query: string) => Listing[];
  filterListingsByCategory: (category: ListingCategory | "All") => Listing[];
};

// Create context
const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

// Mock listings data
const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Leather Sofa",
    description: "Beautiful brown leather sofa in excellent condition. Only 2 years old.",
    price: 550,
    category: "Furniture",
    images: ["/placeholder.svg"],
    sellerId: "1",
    sellerName: "John Doe",
    sellerPhone: "555-123-4567",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "iPhone 13",
    description: "Like new iPhone 13 128GB. Includes charger and case.",
    price: 650,
    category: "Electronics",
    images: ["/placeholder.svg"],
    sellerId: "2",
    sellerName: "Jane Smith",
    sellerPhone: "555-987-6543",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Lawn Mowing Service",
    description: "Professional lawn care service. $30 for standard sized lawns.",
    price: 30,
    category: "Services",
    images: ["/placeholder.svg"],
    sellerId: "3",
    sellerName: "Mike Johnson",
    sellerPhone: "555-555-5555",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const CATEGORIES: ListingCategory[] = [
  "Furniture", 
  "Electronics", 
  "Clothing", 
  "Home Goods", 
  "Services", 
  "Other"
];

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const userListings = listings.filter(
    listing => user && listing.sellerId === user.id
  );

  const getListingById = (id: string) => {
    return listings.find(listing => listing.id === id);
  };

  const createListing = async (newListing: NewListing): Promise<Listing> => {
    if (!user) {
      throw new Error("User must be logged in to create a listing");
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const listing: Listing = {
        ...newListing,
        id: Date.now().toString(),
        sellerId: user.id,
        sellerName: user.name,
        sellerPhone: user.phone,
        createdAt: new Date().toISOString()
      };

      setListings(prevListings => [listing, ...prevListings]);
      
      toast({
        title: "Listing created!",
        description: "Your listing has been published successfully",
      });

      return listing;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create listing",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (id: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setListings(prevListings => prevListings.filter(listing => listing.id !== id));
      
      toast({
        title: "Listing deleted",
        description: "Your listing has been removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete listing",
      });
      throw error;
    }
  };

  const searchListings = (query: string): Listing[] => {
    if (!query) return listings;
    
    const lowercaseQuery = query.toLowerCase();
    return listings.filter(
      listing => 
        listing.title.toLowerCase().includes(lowercaseQuery) ||
        listing.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterListingsByCategory = (category: ListingCategory | "All"): Listing[] => {
    if (category === "All") return listings;
    return listings.filter(listing => listing.category === category);
  };

  return (
    <ListingsContext.Provider
      value={{
        listings,
        userListings,
        isLoading,
        categories: CATEGORIES,
        getListingById,
        createListing,
        deleteListing,
        searchListings,
        filterListingsByCategory
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
