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
import {
  uploadImage as supabaseUploadImage,
  deleteImage as supabaseDeleteImage,
} from "@/lib/supabaseImages";

import { toast } from "sonner";
import ListingEditForm, {
  ListingEditFormState,
} from "@/components/ListingEditForm";

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
  const [editFormState, setEditFormState] =
    useState<ListingEditFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categorySelectRef = useRef<HTMLDivElement>(null);
  const isRunningFetch = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isRunningFetch.current) return;
        isRunningFetch.current = true;
        setIsLoading(true);
        const post = await getListingById(id || "");
        if (post) {
          setListing(post);
          setEditFormState({
            title: post.title || "",
            description: post.description || "",
            price: (post.price || 0).toString(),
            categories: Array.isArray(post.category) ? [...post.category] : [],
            showInHomepage: post.show_in_homepage || false,
            newImages: [],
            imagesToDelete: [],
            images: post.images || [],
            showCategoryDropdown: false,
          });

          if (!sellerProfile || sellerProfile.id !== post.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, full_name, phone_number, street, house_number")
              .eq("id", post.user_id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              setSellerProfile(null);
            } else if (profileData) {
              setSellerProfile(profileData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setIsLoading(false);
        isRunningFetch.current = false;
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

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

  const handleEditSave = async (formState: ListingEditFormState) => {
    if (!formState.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!formState.description.trim()) {
      toast.error("La descripción es requerida");
      return;
    }
    if (
      !formState.price ||
      isNaN(parseFloat(formState.price)) ||
      parseFloat(formState.price) <= 0
    ) {
      toast.error("El precio debe ser un número válido mayor a 0");
      return;
    }
    if (
      !Array.isArray(formState.categories) ||
      formState.categories.length === 0
    ) {
      toast.error("Debes seleccionar al menos una categoría");
      return;
    }
    const remainingImages = (listing?.images || []).filter(
      (img) => !formState.imagesToDelete.includes(img)
    );
    if (remainingImages.length + formState.newImages.length === 0) {
      toast.error("Debes incluir al menos una imagen");
      return;
    }
    setIsSaving(true);
    try {
      const uploadPromises = formState.newImages.map((image) =>
        supabaseUploadImage(image, user!.id)
      );
      const newImageUrls = await Promise.all(uploadPromises);

      const deletePromises = formState.imagesToDelete.map((imageUrl) =>
        supabaseDeleteImage(imageUrl, user!.id)
      );
      await Promise.all(deletePromises);

      const updatedImages = [...remainingImages, ...newImageUrls];

      const { error } = await supabase
        .from("posts")
        .update({
          title: formState.title,
          description: formState.description,
          price: parseFloat(formState.price),
          category: Array.isArray(formState.categories)
            ? formState.categories
            : [],
          images: updatedImages,
          show_in_homepage: formState.showInHomepage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Publicación actualizada exitosamente");
      setIsEditMode(false);
      refreshListings();

      const updatedListing = await getListingById(id || "");
      if (updatedListing) {
        setListing(updatedListing);
        setEditFormState({
          title: updatedListing.title,
          description: updatedListing.description,
          price: updatedListing.price.toString(),
          categories: Array.isArray(updatedListing.category)
            ? updatedListing.category
            : [],
          showInHomepage: updatedListing.show_in_homepage,
          newImages: [],
          imagesToDelete: [],
          images: updatedListing.images || [],
          showCategoryDropdown: false,
        });
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
                  {isEditMode ? null : (
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
              <div
                className="relative aspect-video bg-gray-100"
                onClick={() => setIsImageViewerOpen(true)}
              >
                {images.length > 0 && (
                  <>
                    <img
                      src={images[currentImage]}
                      alt={title}
                      className="w-full h-full object-contain cursor-pointer"
                    />
                    {images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between p-4">
                        <Button
                          variant="default"
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
                          variant="default"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImage(
                              (prev) => (prev + 1) % images.length
                            );
                          }}
                        >
                          <ChevronRight className="h-4 w-4 " />
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
                      {isEditMode && editFormState ? (
                        <ListingEditForm
                          initialState={editFormState}
                          categories={categories}
                          isSaving={isSaving}
                          onSave={handleEditSave}
                          onCancel={() => setIsEditMode(false)}
                        />
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
                  {!isEditMode && (
                    <div className="border-t border-gray-200 pt-6">
                      <>
                        <h2 className="text-xl font-semibold mb-3">
                          Descripción
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                          {description}
                        </p>
                      </>
                    </div>
                  )}

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
