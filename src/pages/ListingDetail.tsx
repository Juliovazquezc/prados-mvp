import { useState, useEffect } from "react";
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
  Edit,
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

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
}

const ListingDetail = () => {
  const { id } = useParams();
  const {
    getListingById,
    isLoading: contextLoading,
    deleteListing,
  } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Post | null>(null);
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const post = await getListingById(id || "");
        if (post) {
          setListing(post);
          // Fetch seller profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, phone_number")
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
        <main className="flex-grow flex flex-col justify-center items-center px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Listing Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The listing you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/")} className="flex items-center">
            <ArrowLeft size={18} className="mr-2" /> Go Back Home
          </Button>
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
    user_id,
    created_at,
    updated_at,
  } = listing;

  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
  });
  const isOwner = user && user.id === user_id;
  const wasUpdated = created_at !== updated_at;

  const nextImage = () => {
    if (currentImage < images.length - 1) {
      setCurrentImage(currentImage + 1);
    }
  };

  const prevImage = () => {
    if (currentImage > 0) {
      setCurrentImage(currentImage - 1);
    }
  };

  const handleDeleteListing = async () => {
    setIsDeleting(true);
    try {
      await deleteListing(id || "");
      navigate("/");
    } catch (error) {
      console.error("Error deleting listing:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow marketplace-container pb-20">
        <section className="py-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="mr-1" /> Back
            </Button>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/listings/${id}/edit`)}
                  className="flex items-center"
                >
                  <Edit size={18} className="mr-2" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center"
                >
                  <Trash2 size={18} className="mr-2" /> Delete
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={images[currentImage] || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImage === 0}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 disabled:opacity-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImage === images.length - 1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 disabled:opacity-50"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex mt-4 space-x-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                        idx === currentImage
                          ? "border-marketplace-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${title} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {title}
                  </h1>
                  <span className="bg-marketplace-peach text-marketplace-secondary px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-marketplace-primary mt-2">
                  {formatPrice(price)}
                </p>
                <div className="text-sm text-gray-500 mt-1">
                  <p>Posted {timeAgo}</p>
                  {wasUpdated && (
                    <p className="text-gray-400">
                      Updated{" "}
                      {formatDistanceToNow(new Date(updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {description}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-2">Vendedor</h2>
                  {sellerProfile && (
                    <>
                      <p className="text-gray-700 mb-4">
                        {sellerProfile.full_name}
                      </p>
                      <div className="space-y-3">
                        {sellerProfile.phone_number && (
                          <WhatsAppButton
                            phoneNumber={sellerProfile.phone_number}
                            message={`Hola, me interesa tu publicación "${title}" en Prados Marketplace`}
                          />
                        )}
                      </div>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteListing}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <BottomNavigation />
    </div>
  );
};

export default ListingDetail;
