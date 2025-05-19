import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { useIntl } from "react-intl";
import imageCompression from "browser-image-compression";

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
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.5, // Reducido a 500KB máximo
      maxWidthOrHeight: 1280, // Reducido a 1280px máximo
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.7, // 70% de calidad inicial
      alwaysKeepResolution: false, // Permite reducir la resolución si es necesario
      preserveExif: false, // No preservar metadata EXIF para reducir tamaño
      strict: true, // Fuerza el tamaño máximo
    };

    try {
      let compressedFile = await imageCompression(file, options);

      // Si el archivo sigue siendo muy grande, intentamos una segunda pasada con calidad más baja
      if (compressedFile.size > 500000) {
        // Si es mayor a 500KB
        const secondPassOptions = {
          ...options,
          maxSizeMB: 0.3, // 300KB
          initialQuality: 0.5, // 50% de calidad
          maxWidthOrHeight: 1024, // 1024px máximo
        };
        compressedFile = await imageCompression(
          compressedFile,
          secondPassOptions
        );
      }

      return URL.createObjectURL(compressedFile);
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      // Si hay un error en la compresión, devolvemos la imagen original
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

    // Reset input value to allow uploading the same file again
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
            className="aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-marketplace-primary bg-gray-50 hover:bg-gray-100 transition-colors p-4"
            aria-label={intl.formatMessage({ id: "imageUpload.addImage" })}
          >
            <Plus className="h-6 w-6 text-gray-600" />
            <span className="text-sm mt-1 text-gray-600">
              {intl.formatMessage({ id: "imageUpload.addImage" })}
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
        {intl.formatMessage(
          { id: "imageUpload.counter" },
          {
            current: images.length,
            max: maxImages,
          }
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
