import React from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Hotel, Star, MapPin } from "lucide-react";

export function PropertyCard({ item, onOpen }) {
  const price = item?.minRate || item?.lowestPrice || item?.price || item?.rate || 0;
  const stars = item?.category || item?.starRating || item?.stars || 0;
  const name = item?.name || item?.hotelName || item?.title || "Hotel";
  const address = item?.address || item?.city || item?.location || "";
  const image = item?.image || item?.thumbnailUrl || item?.images?.[0] || item?.gallery?.[0]?.url;
  const amenities = item?.amenities || item?.features || item?.facilities || [];

  return (
    <Card className="overflow-hidden p-0">
      {image ? (
        <img src={image} alt={name} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
          <Hotel />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: Math.min(5, Number(stars)) }).map((_, i) => (
              <Star key={i} size={16} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} /> <span className="line-clamp-1">{address}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          {(amenities || []).slice(0, 5).map((a, i) => (
            <span key={i} className="px-2 py-1 rounded-full bg-gray-100">{a?.name || a}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold">₹{price}</div>
          <Button onClick={onOpen}>View Details</Button>
        </div>
      </div>
    </Card>
  );
}
