import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { listings, isLoading, categories } = useListings();
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof categories)[number] | "All"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts by category and search query
  const filteredPosts = listings
    .filter(
      (post) => selectedCategory === "All" || post.category === selectedCategory
    )
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow marketplace-container pb-20">
        <section className="py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Prados MVP
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
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              onClick={() => setSelectedCategory("All")}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Spinner />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/listings/${post.id}`}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {post.images[0] && (
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-green-600 font-medium">
                      {formatPrice(post.price)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                </Link>
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
