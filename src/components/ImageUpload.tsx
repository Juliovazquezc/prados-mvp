
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Image } from "lucide-react";

type ImageUploadProps = {
  images: string[];
  setImages: (images: string[]) => void;
  maxImages?: number;
};

const ImageUpload = ({
  images,
  setImages,
  maxImages = 4,
}: ImageUploadProps) => {
  const addImage = () => {
    // In a real app, we would upload to storage
    // For this example, we'll use placeholder images
    if (images.length < maxImages) {
      setImages([...images, "/placeholder.svg"]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
            <img
              src={image}
              alt={`Product image ${index + 1}`}
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <button
            type="button"
            onClick={addImage}
            className="aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-marketplace-primary bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Plus />
            <span className="text-sm mt-1">Add Image</span>
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        {images.length} of {maxImages} images added
      </div>
    </div>
  );
};

export default ImageUpload;
