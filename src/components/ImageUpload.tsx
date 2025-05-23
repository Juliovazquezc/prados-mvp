import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { useIntl } from "react-intl";
import imageCompression from "browser-image-compression";

type ImageUploadProps = {
  images: string[];
  setImages: (images: string[]) => void;
  maxImages?: number;
  error?: string;
};

const ImageUpload = ({
  images,
  setImages,
  maxImages = 4,
  error,
}: ImageUploadProps) => {
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.7,
      alwaysKeepResolution: false,
      preserveExif: false,
      strict: true,
    };

    try {
      let compressedFile = await imageCompression(file, options);

      if (compressedFile.size > 500000) {
        const secondPassOptions = {
          ...options,
          maxSizeMB: 0.3,
          initialQuality: 0.5,
          maxWidthOrHeight: 1024,
        };
        compressedFile = await imageCompression(
          compressedFile,
          secondPassOptions
        );
      }

      return URL.createObjectURL(compressedFile);
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);

      return URL.createObjectURL(file);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const compressPromises = Array.from(files).map(compressImage);
    const newImages = await Promise.all(compressPromises);

    if (images.length + newImages.length <= maxImages) {
      setImages([...images, ...newImages]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newImages[index]);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
          >
            <img
              src={image}
              alt={intl.formatMessage(
                { id: "imageUpload.imageAlt" },
                { number: index + 1 }
              )}
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label={intl.formatMessage({ id: "imageUpload.removeImage" })}
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed ${
              error
                ? "border-red-500"
                : "border-gray-300 hover:border-marketplace-primary"
            } bg-gray-50 hover:bg-gray-100 transition-colors p-4`}
            aria-label={intl.formatMessage({ id: "imageUpload.addImage" })}
          >
            <Plus
              className={`h-6 w-6 ${error ? "text-red-500" : "text-gray-600"}`}
            />
            <span
              className={`text-sm mt-1 ${
                error ? "text-red-500" : "text-gray-600"
              }`}
            >
              Agregar imagen
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label={intl.formatMessage({ id: "imageUpload.uploadImages" })}
      />

      <div className="text-sm text-gray-500">
        {`${images.length} de ${maxImages} imágenes`}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUpload;
