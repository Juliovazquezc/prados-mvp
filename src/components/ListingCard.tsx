import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Listing } from "@/contexts/ListingsContext";

type ListingCardProps = {
  listing: Listing;
};

const ListingCard = ({ listing }: ListingCardProps) => {
  const { id, title, price, images, category, createdAt } = listing;

  // Format the creation date
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Link to={`/listings/${id}`}>
      <div className="listing-card">
        <div className="image-container">
          <img
            src={images[0] || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
            {title}
          </h3>
          <div className="flex justify-between items-center mt-2">
            <p className="text-lg font-semibold text-marketplace-primary">
              ${price}
            </p>
            <span className="bg-marketplace-peach text-marketplace-secondary text-xs px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{timeAgo}</p>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
