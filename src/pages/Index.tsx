
import { useState } from "react";
import { useListings } from "@/contexts/ListingsContext";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import ListingCard from "@/components/ListingCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const Index = () => {
  const { listings, categories, isLoading } = useListings();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter listings by category and search query
  const filteredListings = listings
    .filter(listing => selectedCategory === "All" || listing.category === selectedCategory)
    .filter(listing =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow marketplace-container pb-20">
        <section className="py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Neighborhood Marketplace
            </h1>
            {isAuthenticated && (
              <Button asChild>
                <Link to="/create" className="flex items-center">
                  <Plus size={18} className="mr-2" /> 
                  <span className="hidden sm:inline">Create Listing</span>
                  <span className="sm:hidden">Sell</span>
                </Link>
              </Button>
            )}
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <CategoryFilter
            onSelectCategory={(category) => setSelectedCategory(category)}
            selectedCategory={selectedCategory}
          />

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Spinner />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center my-12">
              <p className="text-gray-500 mb-4">No listings found</p>
              {isAuthenticated && (
                <Button asChild>
                  <Link to="/create">Create a listing</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
