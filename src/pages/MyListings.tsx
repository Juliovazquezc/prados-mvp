import { useState } from "react";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const MyListings = () => {
  const { userListings, refreshListings, isLoading } = useListings();
  const { user } = useAuth();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleToggleVisibility = async (
    postId: string,
    currentValue: boolean
  ) => {
    if (!user) return;

    setUpdatingId(postId);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ show_in_homepage: !currentValue })
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshListings();
      toast.success("Visibilidad actualizada exitosamente");
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Error al actualizar la visibilidad");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto">
          <section className="py-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Mis Publicaciones
              </h1>
              <Link to="/create">
                <Button>Crear Nuevo</Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center my-12">
                <Spinner />
              </div>
            ) : userListings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {userListings.map((post) => (
                  <div
                    key={post.id}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 flex flex-col"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {post.images[0] && (
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          loading="lazy"
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
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {post.category.map((cat) => (
                            <span
                              key={cat}
                              className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 mt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-600">
                          Visible en inicio
                        </span>
                        {updatingId === post.id ? (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <Spinner className="h-3 w-3" />
                          </div>
                        ) : (
                          <Switch
                            checked={post.show_in_homepage}
                            onCheckedChange={() =>
                              handleToggleVisibility(
                                post.id,
                                post.show_in_homepage
                              )
                            }
                            disabled={updatingId === post.id}
                          />
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Link to={`/listings/${post.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            Ver
                          </Button>
                        </Link>
                        {/* <Link to={`/edit/${post.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            Editar
                          </Button>
                        </Link> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No tienes publicaciones todavía
                </p>
                <Link to="/create">
                  <Button>Crear Primera Publicación</Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default MyListings;
