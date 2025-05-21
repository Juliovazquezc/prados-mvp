import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import ImageUpload from "@/components/ImageUpload";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const MAX_LISTINGS_PER_USER =
  Number(import.meta.env.VITE_MAX_LISTINGS_PER_USER) || 5;

const CreateListing = () => {
  const { refreshListings, categories } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showInHomepage, setShowInHomepage] = useState(true);
  const categorySelectRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!showCategoryDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categorySelectRef.current &&
        !categorySelectRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdown]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title) newErrors.title = "El título es requerido";
    if (!description) newErrors.description = "La descripción es requerida";
    if (!price) newErrors.price = "El precio es requerido";
    if (parseFloat(price) < 0)
      newErrors.price = "El precio no puede ser negativo";
    if (selectedCategories.length === 0)
      newErrors.category = "Se requiere al menos una categoría";
    if (images.length === 0)
      newErrors.images = "Se requiere al menos una imagen";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (imageFile: string): Promise<string> => {
    try {
      // Convert base64 to blob
      const blob = await fetch(imageFile).then((res) => res.blob());

      const fileName = `${uuidv4()}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    // Verificar el número de publicaciones del usuario antes de crear una nueva
    const { count, error: countError } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (countError) {
      toast.error("No se pudo verificar el límite de publicaciones");
      return;
    }
    if ((count ?? 0) >= MAX_LISTINGS_PER_USER) {
      toast.error(
        `Has alcanzado el máximo de ${MAX_LISTINGS_PER_USER} publicaciones permitidas.`
      );
      return;
    }

    setIsLoading(true);

    try {
      // Upload all images to Supabase Storage
      const uploadPromises = images.map((image) => uploadImage(image));
      const imageUrls = await Promise.all(uploadPromises);

      // Create the post in the database
      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          title,
          description,
          price: parseFloat(price),
          category: selectedCategories,
          images: imageUrls,
          user_id: user.id,
          show_in_homepage: showInHomepage,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("¡Anuncio creado exitosamente!");
      refreshListings();
      navigate(`/listings/${post.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Error al crear el anuncio. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow marketplace-container pb-20 mx-0 md:mx-auto">
        <section className="py-6 max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Crear Anuncio
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="¿Qué estás vendiendo?"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu artículo o servicio..."
                rows={7}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorías</Label>
              <div className="relative" ref={categorySelectRef}>
                <button
                  type="button"
                  className={`w-full border rounded-md px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-marketplace-primary ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={showCategoryDropdown}
                  tabIndex={0}
                  aria-label="Seleccionar categorías"
                  onClick={() => setShowCategoryDropdown((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setShowCategoryDropdown((prev) => !prev);
                  }}
                >
                  {selectedCategories.length === 0 ? (
                    <span className="text-gray-400">
                      Seleccionar categorías
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-marketplace-primary text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border border-marketplace-primary shadow-sm"
                        >
                          {cat}
                          <button
                            type="button"
                            className="ml-1 text-white hover:text-red-200 focus:outline-none"
                            aria-label={`Eliminar ${cat}`}
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== cat)
                              );
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                setSelectedCategories(
                                  selectedCategories.filter((c) => c !== cat)
                                );
                              }
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </button>
                {showCategoryDropdown && (
                  <ul
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                    role="listbox"
                  >
                    {categories.map((cat) => (
                      <li
                        key={cat}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-marketplace-primary/10"
                        role="option"
                        aria-selected={selectedCategories.includes(cat)}
                        tabIndex={0}
                        onClick={() => {
                          setSelectedCategories((prev) =>
                            prev.includes(cat)
                              ? prev.filter((c) => c !== cat)
                              : [...prev, cat]
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedCategories((prev) =>
                              prev.includes(cat)
                                ? prev.filter((c) => c !== cat)
                                : [...prev, cat]
                            );
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          readOnly
                          className="mr-2"
                          tabIndex={-1}
                        />
                        {cat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Imágenes</Label>
              <ImageUpload
                images={images}
                setImages={setImages}
                maxImages={5}
                error={errors.images}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-in-homepage"
                checked={showInHomepage}
                onCheckedChange={setShowInHomepage}
              />
              <Label htmlFor="show-in-homepage">
                Mostrar en la página principal
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              Crear Anuncio
            </Button>
          </form>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CreateListing;
