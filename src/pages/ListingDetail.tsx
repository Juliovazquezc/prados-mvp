
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Phone, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ListingDetail = () => {
  const { id } = useParams();
  const { getListingById, isLoading, deleteListing } = useListings();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentImage, setCurrentImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const listing = getListingById(id || "");
  
  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")} className="flex items-center">
            <ArrowLeft size={18} className="mr-2" /> Go Back Home
          </Button>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const { title, description, price, images, category, sellerName, sellerPhone, createdAt, sellerId } = listing;
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const isOwner = user && user.id === sellerId;
  
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow marketplace-container pb-20">
        <section className="py-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4 flex items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="mr-1" /> Back
          </Button>
          
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
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
                  <span className="bg-marketplace-peach text-marketplace-secondary px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-marketplace-primary mt-2">${price}</p>
                <p className="text-sm text-gray-500 mt-1">Posted {timeAgo}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{description}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-2">Seller</h2>
                  <p className="text-gray-700">{sellerName}</p>
                  
                  {isAuthenticated ? (
                    showContact ? (
                      <div className="mt-3">
                        <p className="font-medium text-marketplace-secondary">Contact Number:</p>
                        <div className="flex items-center mt-1">
                          <Phone size={16} className="mr-2 text-green-600" />
                          <span className="text-xl">{sellerPhone}</span>
                        </div>
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
                      onClick={() => navigate("/login", { state: { from: `/listings/${id}` } })}
                      className="mt-3 w-full"
                    >
                      Login to Contact Seller
                    </Button>
                  )}
                </Card>
              </div>
              
              {isOwner && (
                <div className="border-t border-gray-200 pt-6">
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full"
                  >
                    Delete Listing
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <BottomNavigation />
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingDetail;
