import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

type ImageViewerProps = {
  images: string[];
  currentImage: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const ImageViewer = ({
  images,
  currentImage,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: ImageViewerProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          onPrev();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        aria-label="Close image viewer"
      >
        <X size={24} />
      </button>

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={images[currentImage]}
          alt={`Full size view ${currentImage + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={36} />
          </button>
        </>
      )}

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
        {currentImage + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageViewer;
