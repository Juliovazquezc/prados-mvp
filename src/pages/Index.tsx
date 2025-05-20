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
    (typeof categories)[number] | "Todos"
  >("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts by category and search query
  const filteredPosts = listings
    .filter((post) => post.show_in_homepage)
    .filter(
      (post) =>
        selectedCategory === "Todos" ||
        (Array.isArray(post.category) &&
          post.category.includes(selectedCategory))
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

      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto">
          <section className="py-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-4">
              {isAuthenticated && (
                <Button size="sm" className="sm:h-10" asChild>
                  <Link to="/create" className="flex items-center">
                    <Plus size={16} className="mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Crear Anuncio</span>
                    <span className="sm:hidden">Vender</span>
                  </Link>
                </Button>
              )}
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  type="text"
                  placeholder="Buscar anuncios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
              <Button
                variant={selectedCategory === "Todos" ? "default" : "outline"}
                onClick={() => setSelectedCategory("Todos")}
                className="whitespace-nowrap text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                size="sm"
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                  size="sm"
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/listings/${post.id}`}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 flex flex-col"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {post.images[0] && (
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                    </div>
                    <div className="p-2 sm:p-3 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800 mb-0.5 line-clamp-1 text-xs sm:text-sm">
                          {post.title}
                        </h3>
                        <p className="text-green-600 font-semibold text-xs sm:text-sm">
                          {formatPrice(post.price)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 sm:line-clamp-1">
                          {post.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center my-12">
                <p className="text-gray-500 mb-4">No se encontraron anuncios</p>
                {isAuthenticated && (
                  <Button asChild>
                    <Link to="/create">Crear un anuncio</Link>
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
