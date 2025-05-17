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
  Phone,
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

const ListingDetail = () => {
  const { id } = useParams();
  const {
    getListingById,
    isLoading: contextLoading,
    deleteListing,
  } = useListings();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const post = await getListingById(id || "");
        if (post) setListing(post);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleWhatsAppClick = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, ""); // Remove non-digits
    const whatsappUrl = `https://wa.me/${formattedPhone}`;
    window.open(whatsappUrl, "_blank");
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
                  <h2 className="text-lg font-semibold mb-2">Seller</h2>
                  {/* <p className="text-gray-700">{sellerDetails?.full_name}</p> */}

                  {isAuthenticated ? (
                    showContact ? (
                      <div className="mt-3 space-y-4">
                        <p className="font-medium text-marketplace-secondary">
                          Contact Options:
                        </p>
                        {/* {sellerDetails?.phone && (
                          <>
                            <div className="flex items-center">
                              <Phone
                                size={16}
                                className="mr-2 text-green-600"
                              />
                              <span className="text-xl">
                                {sellerDetails.phone}
                              </span>
                            </div>
                            <Button
                              onClick={() =>
                                handleWhatsAppClick(sellerDetails.phone)
                              }
                              className="w-full bg-green-500 hover:bg-green-600 text-white"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Chat on WhatsApp
                            </Button>
                          </>
                        )} */}
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowContact(true)}
                        className="mt-3 w-full"
                      >
                        <Phone size={18} className="mr-2" />
                        Contact Seller
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={() =>
                        navigate("/login", {
                          state: { from: `/listings/${id}` },
                        })
                      }
                      className="mt-3 w-full"
                    >
                      Login to Contact Seller
                    </Button>
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
