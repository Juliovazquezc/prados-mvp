
import { useState } from "react";
import { useListings } from "@/contexts/ListingsContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import ListingCard from "@/components/ListingCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const { listings, isLoading } = useListings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showResults, setShowResults] = useState(false);
  
  // Filter listings by category and search query
  const filteredListings = listings
    .filter(listing => selectedCategory === "All" || listing.category === selectedCategory)
    .filter(listing =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (searchQuery) {
      setShowResults(true);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow marketplace-container pb-20">
        <section className="py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Find Items & Services
          </h1>
          
          <div className="mb-6">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </div>
            </form>
          </div>
          
          <CategoryFilter
            onSelectCategory={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Spinner />
            </div>
          ) : showResults && searchQuery ? (
            <>
              <div className="text-sm text-gray-500 my-4">
                Found {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'} 
                {selectedCategory !== "All" && ` in ${selectedCategory}`} for "{searchQuery}"
              </div>
              
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center my-12">
                  <p className="text-gray-500">No listings found matching your search criteria</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center my-12 text-gray-500">
              <p>Enter search terms to find listings</p>
            </div>
          )}
        </section>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Search;
