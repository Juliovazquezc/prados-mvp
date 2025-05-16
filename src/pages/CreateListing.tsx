
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings, ListingCategory, CATEGORIES } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import ImageUpload from "@/components/ImageUpload";
import RequireAuth from "@/components/RequireAuth";
import { Spinner } from "@/components/Spinner";

const CreateListing = () => {
  const { user } = useAuth();
  const { createListing, isLoading } = useListings();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ListingCategory | "">("");
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title) newErrors.title = "Title is required";
    if (!description) newErrors.description = "Description is required";
    if (!price) newErrors.price = "Price is required";
    if (parseFloat(price) < 0) newErrors.price = "Price cannot be negative";
    if (!category) newErrors.category = "Category is required";
    if (images.length === 0) newErrors.images = "At least one image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const newListing = {
        title,
        description,
        price: parseFloat(price),
        category: category as ListingCategory,
        images,
      };
      
      const createdListing = await createListing(newListing);
      navigate(`/listings/${createdListing.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow marketplace-container pb-20">
          <section className="py-6 max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Create Listing
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you selling?"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item or service..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
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
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as ListingCategory)}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Images</Label>
                <ImageUpload
                  images={images}
                  setImages={setImages}
                  maxImages={4}
                />
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={user?.phone || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">
                  This number will be shown to interested buyers
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Create Listing"}
              </Button>
            </form>
          </section>
        </main>
        
        <BottomNavigation />
      </div>
    </RequireAuth>
  );
};

export default CreateListing;
