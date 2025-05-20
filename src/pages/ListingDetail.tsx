import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  X,
  Plus,
} from "lucide-react";
import { Spinner } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Post } from "@/types/database.types";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { supabase } from "@/lib/supabase";
import ImageViewer from "@/components/ImageViewer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  street: string;
  house_number: string;
}

const ListingDetail = () => {
  const { id } = useParams();
  const {
    getListingById,
    isLoading: contextLoading,
    deleteListing,
    refreshListings,
    categories,
  } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Post | null>(null);
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [editedCategories, setEditedCategories] = useState<string[]>([]);
  const [editedShowInHomepage, setEditedShowInHomepage] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categorySelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const post = await getListingById(id || "");
        if (post) {
          setListing(post);
          // Initialize edit form with current values
          setEditedTitle(post.title || "");
          setEditedDescription(post.description || "");
          setEditedPrice((post.price || 0).toString());
          setEditedCategories(
            Array.isArray(post.category) ? [...post.category] : []
          );
          setEditedShowInHomepage(post.show_in_homepage || false);

          // Fetch seller profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, phone_number, street, house_number")
            .eq("id", post.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else if (profileData) {
            setSellerProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, getListingById]);

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

  const isOwner = user && listing && user.id === listing.user_id;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleImageToDelete = (imageUrl: string) => {
    setImagesToDelete((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const validateForm = () => {
    if (!editedTitle.trim()) {
      toast.error("El título es requerido");
      return false;
    }

    if (!editedDescription.trim()) {
      toast.error("La descripción es requerida");
      return false;
    }

    if (
      !editedPrice ||
      isNaN(parseFloat(editedPrice)) ||
      parseFloat(editedPrice) <= 0
    ) {
      toast.error("El precio debe ser un número válido mayor a 0");
      return false;
    }

    if (!Array.isArray(editedCategories) || editedCategories.length === 0) {
      toast.error("Debes seleccionar al menos una categoría");
      return false;
    }

    const remainingImages = (listing?.images || []).filter(
      (img) => !imagesToDelete.includes(img)
    );
    if (remainingImages.length + newImages.length === 0) {
      toast.error("Debes incluir al menos una imagen");
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const deleteImage = async (imageUrl: string) => {
    const path = imageUrl.split("/").pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from("post-images")
      .remove([`${user!.id}/${path}`]);

    if (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      // Upload new images
      const uploadPromises = newImages.map((image) => uploadImage(image));
      const newImageUrls = await Promise.all(uploadPromises);

      // Delete marked images
      const deletePromises = imagesToDelete.map((imageUrl) =>
        deleteImage(imageUrl)
      );
      await Promise.all(deletePromises);

      // Get remaining images
      const remainingImages = (listing?.images || []).filter(
        (img) => !imagesToDelete.includes(img)
      );
      const updatedImages = [...remainingImages, ...newImageUrls];

      // Update post in database
      const { error } = await supabase
        .from("posts")
        .update({
          title: editedTitle,
          description: editedDescription,
          price: parseFloat(editedPrice),
          category: Array.isArray(editedCategories) ? editedCategories : [],
          images: updatedImages,
          show_in_homepage: editedShowInHomepage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Publicación actualizada exitosamente");
      setIsEditMode(false);
      refreshListings();

      // Refresh the listing data
      const updatedListing = await getListingById(id || "");
      if (updatedListing) {
        setListing(updatedListing);
        // Re-initialize edit form with updated values
        setEditedTitle(updatedListing.title);
        setEditedDescription(updatedListing.description);
        setEditedPrice(updatedListing.price.toString());
        setEditedCategories(
          Array.isArray(updatedListing.category) ? updatedListing.category : []
        );
        setEditedShowInHomepage(updatedListing.show_in_homepage);
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Error al actualizar la publicación");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || contextLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <Spinner />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <p className="text-center text-gray-500">
              Publicación no encontrada
            </p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const {
    title,
    description,
    price,
    images,
    category,
    created_at,
    updated_at,
  } = listing;

  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
  });

  const wasUpdated = created_at !== updated_at;

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
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              {isOwner && (
                <div className="flex gap-2">
                  {isEditMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditMode(false)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Spinner className="h-4 w-4 mr-1" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Guardar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {images.length > 0 && (
                  <>
                    <img
                      src={images[currentImage]}
                      alt={title}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => setIsImageViewerOpen(true)}
                    />
                    {images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between p-4">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImage(
                              (prev) =>
                                (prev - 1 + images.length) % images.length
                            );
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImage(
                              (prev) => (prev + 1) % images.length
                            );
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImage ? "bg-white" : "bg-white/50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImage(index);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-start">
                      {isEditMode ? (
                        <div className="w-full space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                              id="title"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              placeholder="Título"
                              className="text-2xl font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Precio ($)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={editedPrice}
                              onChange={(e) => setEditedPrice(e.target.value)}
                              placeholder="Precio"
                              className="text-xl font-semibold text-marketplace-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Categorías</Label>
                            <div className="relative" ref={categorySelectRef}>
                              <button
                                type="button"
                                className="w-full border rounded-md px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-marketplace-primary border-gray-300"
                                aria-haspopup="listbox"
                                aria-expanded={showCategoryDropdown}
                                tabIndex={0}
                                aria-label="Seleccionar categorías"
                                onClick={() =>
                                  setShowCategoryDropdown((prev) => !prev)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ")
                                    setShowCategoryDropdown((prev) => !prev);
                                }}
                              >
                                {editedCategories.length === 0 ? (
                                  <span className="text-gray-400">
                                    Seleccionar categorías
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {editedCategories.map((cat) => (
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
                                            setEditedCategories(
                                              editedCategories.filter(
                                                (c) => c !== cat
                                              )
                                            );
                                          }}
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" ||
                                              e.key === " "
                                            ) {
                                              e.stopPropagation();
                                              setEditedCategories(
                                                editedCategories.filter(
                                                  (c) => c !== cat
                                                )
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
                                      aria-selected={editedCategories.includes(
                                        cat
                                      )}
                                      tabIndex={0}
                                      onClick={() => {
                                        setEditedCategories((prev) =>
                                          prev.includes(cat)
                                            ? prev.filter((c) => c !== cat)
                                            : [...prev, cat]
                                        );
                                      }}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          setEditedCategories((prev) =>
                                            prev.includes(cat)
                                              ? prev.filter((c) => c !== cat)
                                              : [...prev, cat]
                                          );
                                        }
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={editedCategories.includes(cat)}
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
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="show-homepage"
                              checked={editedShowInHomepage}
                              onCheckedChange={setEditedShowInHomepage}
                            />
                            <Label
                              htmlFor="show-homepage"
                              className="cursor-pointer"
                            >
                              Mostrar en inicio
                            </Label>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Imágenes</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {listing.images
                                .filter((img) => !imagesToDelete.includes(img))
                                .map((img, index) => (
                                  <div
                                    key={img}
                                    className="relative group aspect-square"
                                  >
                                    <img
                                      src={img}
                                      alt={`Imagen ${index + 1}`}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleImageToDelete(img);
                                      }}
                                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-6 w-6 text-white" />
                                    </button>
                                  </div>
                                ))}
                              {newImages.map((file, index) => (
                                <div
                                  key={index}
                                  className="relative group aspect-square"
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Nueva imagen ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNewImage(index);
                                    }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-6 w-6 text-white" />
                                  </button>
                                </div>
                              ))}
                              {listing.images.length -
                                imagesToDelete.length +
                                newImages.length <
                                5 && (
                                <label className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                  />
                                  <Plus className="h-6 w-6 text-gray-400" />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            {title}
                          </h1>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(category) &&
                              category.map((cat) => (
                                <span
                                  key={cat}
                                  className="bg-marketplace-primary text-white px-3 py-1 rounded-full text-sm"
                                >
                                  {cat}
                                </span>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                    {!isEditMode && (
                      <>
                        <p className="text-2xl font-semibold text-marketplace-primary mt-2">
                          {formatPrice(price)}
                        </p>
                        <div className="text-sm text-gray-500 mt-1">
                          <p>Publicado {timeAgo}</p>
                          {wasUpdated && (
                            <p className="text-gray-400">
                              Actualizado{" "}
                              {formatDistanceToNow(new Date(updated_at), {
                                addSuffix: true,
                              })}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                    {isEditMode ? (
                      <div className="space-y-2">
                        <Textarea
                          id="description"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Descripción"
                          className="min-h-[200px]"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>

                  {!isEditMode && sellerProfile && (
                    <div className="border-t border-gray-200 pt-6">
                      <h2 className="text-xl font-semibold mb-4">Contacto</h2>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Nombre: </span>
                          {sellerProfile.full_name}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Dirección: </span>
                          {sellerProfile.street} {sellerProfile.house_number}
                        </p>
                        <div className="pt-4">
                          <WhatsAppButton
                            phoneNumber={sellerProfile.phone_number}
                            message={`Hola, me interesa tu publicación "${title}" en Prados del Este`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <BottomNavigation />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar publicación?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La publicación será eliminada
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await deleteListing(id || "");
                  toast.success("Publicación eliminada exitosamente");
                  navigate("/my-listings");
                } catch (error) {
                  console.error("Error deleting listing:", error);
                  toast.error(
                    "Error al eliminar la publicación. Por favor intenta de nuevo."
                  );
                } finally {
                  setIsDeleting(false);
                  setShowDeleteDialog(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Spinner className="mr-2" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageViewer
        images={images}
        currentImage={currentImage}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        onNext={() => setCurrentImage((prev) => (prev + 1) % images.length)}
        onPrev={() =>
          setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
        }
      />
    </div>
  );
};

export default ListingDetail;
