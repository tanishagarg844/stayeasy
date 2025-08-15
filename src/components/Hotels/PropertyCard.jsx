import React, { useState, useMemo } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { 
  Hotel, 
  Star, 
  MapPin, 
  Wifi, 
  Waves, 
  UtensilsCrossed, 
  Car, 
  Zap, 
  Bed, 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Phone,
  Mail
} from "lucide-react";

export function PropertyCard({ item, onOpen }) {
  const [showMoreRooms, setShowMoreRooms] = useState(false);
  
  const hotelName = item?.hotelName || item?.name || "Hotel";
  const hotelCode = item?.hotelCode || "";
  const rating = item?.rating || "0 STARS";
  const description = item?.description || "";
  const address = item?.address || "";
  const postalCode = item?.postalCode || "";
  const email = item?.email || "";
  const phoneNumbers = item?.phoneResponses || [];
  const segments = item?.segments || [];
  const hotelAccommodation = item?.hotelAccommodation || "";
  
  const mainImage = useMemo(() => {
    if (item?.hotelImageLinks?.length > 0) {
      const generalView = item.hotelImageLinks.find(img => img.imageType === "General view");
      const roomImage = item.hotelImageLinks.find(img => img.imageType === "Room");
      return generalView?.imageLink || roomImage?.imageLink || item.hotelImageLinks[0]?.imageLink;
    }
    return null;
  }, [item?.hotelImageLinks]);

  const roomOptions = useMemo(() => {
    if (!item?.roomResponses) return [];
    
    const roomMap = new Map();
    
    item.roomResponses.forEach(room => {
      const key = `${room.roomName}-${room.roomCode}`;
      if (!roomMap.has(key)) {
        roomMap.set(key, {
          ...room,
          boardOptions: []
        });
      }
      
      const existingRoom = roomMap.get(key);
      existingRoom.boardOptions.push({
        boardName: room.boardNameResponse[0]?.boardName || "ROOM ONLY",
        boardCode: room.boardNameResponse[0]?.boardCode,
        price: room.rateKeyResponses?.totalPrice || 0,
        cancellationPolicy: room.rateKeyResponses?.rateKeys?.[0]?.cancellationPolicy?.[0],
        roomRateKey: room.rateKeyResponses?.rateKeys?.[0]?.roomRateKey
      });
    });
    
    roomMap.forEach(room => {
      room.boardOptions.sort((a, b) => a.price - b.price);
    });
    
    return Array.from(roomMap.values()).sort((a, b) => {
      const aMinPrice = Math.min(...a.boardOptions.map(b => b.price));
      const bMinPrice = Math.min(...b.boardOptions.map(b => b.price));
      return aMinPrice - bMinPrice;
    });
  }, [item?.roomResponses]);

  const lowestPrice = useMemo(() => {
    if (roomOptions.length === 0) return 0;
    return Math.min(...roomOptions.flatMap(room => 
      room.boardOptions.map(board => board.price)
    ));
  }, [roomOptions]);

  const topFacilities = useMemo(() => {
    if (!item?.facilityResponses) return [];
    
    const importantFacilities = item.facilityResponses
      .filter(f => f.facilityGroup === "Facilities" || f.facilityGroup === "Room facilities (Standard room)")
      .slice(0, 8);
    
    return importantFacilities;
  }, [item?.facilityResponses]);

  const interestPoints = item?.interestPoints || [];

  const formatPrice = (price) => {
    if (price === 0) return "Price on request";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatRating = (rating) => {
    const starCount = parseInt(rating.match(/\d+/)?.[0] || "0");
    return Array.from({ length: Math.min(5, starCount) }).map((_, i) => (
      <Star key={i} size={16} className="text-yellow-500 fill-current" />
    ));
  };

  const getFacilityIcon = (amenity) => {
    const amenityName = (amenity?.name || amenity || "").toLowerCase();
    if (amenityName.includes('wifi') || amenityName.includes('internet')) return <Wifi size={14} />;
    if (amenityName.includes('pool') || amenityName.includes('swimming')) return <Waves size={14} />;
    if (amenityName.includes('restaurant') || amenityName.includes('dining')) return <UtensilsCrossed size={14} />;
    if (amenityName.includes('parking') || amenityName.includes('car')) return <Car size={14} />;
    if (amenityName.includes('gym') || amenityName.includes('fitness')) return <Zap size={14} />;
    if (amenityName.includes('room service')) return <Bed size={14} />;
    if (amenityName.includes('24-hour')) return <Clock size={14} />;
    return null;
  };

  const formatBoardName = (boardName) => {
    const boardMap = {
      'ROOM ONLY': 'Room Only',
      'BED AND BREAKFAST': 'B&B',
      'HALF BOARD': 'Half Board',
      'FULL BOARD': 'Full Board',
      'ALL INCLUSIVE': 'All Inclusive'
    };
    return boardMap[boardName] || boardName;
  };

  return (
    <Card className="overflow-hidden p-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col bg-white">
      {mainImage ? (
        <div className="relative">
          <img src={mainImage} alt={hotelName} className="w-full h-64 object-cover" />
          
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm flex items-center gap-1">
            {formatRating(rating)}
            <span className="text-gray-600">{rating}</span>
          </div>

          {hotelAccommodation && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              {hotelAccommodation}
            </div>
          )}

          {segments.length > 0 && (
            <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              {segments[0]}
            </div>
          )}

          {lowestPrice > 0 && (
            <div className="absolute bottom-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              From {formatPrice(lowestPrice)}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
          <Hotel size={48} />
        </div>
      )}

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl text-gray-800 leading-tight flex-1 pr-3">
              {hotelName}
            </h3>
            {hotelCode && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                #{hotelCode}
              </span>
            )}
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <div>
              <span className="line-clamp-2 leading-tight">{address}</span>
              {postalCode && <span className="block text-xs text-gray-500">{postalCode}</span>}
            </div>
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {roomOptions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Bed size={16} className="text-blue-500" />
              Room Options
            </h4>
            
            <div className="space-y-2">
              {roomOptions.slice(0, showMoreRooms ? roomOptions.length : 2).map((room, roomIdx) => (
                <div key={roomIdx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-800 text-sm">{room.roomName}</h5>
                    <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                      {room.rooms} room • {room.adults} adults • {room.children} children
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {room.boardOptions.slice(0, 2).map((board, boardIdx) => (
                      <div key={boardIdx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatBoardName(board.boardName)}</span>
                        <span className="font-semibold text-blue-600">{formatPrice(board.price)}</span>
                      </div>
                    ))}
                    {room.boardOptions.length > 2 && (
                      <span className="text-xs text-gray-500">+{room.boardOptions.length - 2} more options</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {roomOptions.length > 2 && (
              <button
                onClick={() => setShowMoreRooms(!showMoreRooms)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showMoreRooms ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show {roomOptions.length - 2} More Rooms
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {topFacilities.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Key Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {topFacilities.map((facility, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  {getFacilityIcon(facility) || <CheckCircle size={12} className="text-green-500" />}
                  <span className="line-clamp-1">{facility?.name || facility}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interestPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Nearby Places</h4>
            <div className="space-y-1">
              {interestPoints.slice(0, 3).map((point, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                  <span className="line-clamp-1">{point.pointName}</span>
                  <span className="text-blue-600 font-medium">{point.distance}m</span>
                </div>
              ))}
              {interestPoints.length > 3 && (
                <span className="text-xs text-gray-500">+{interestPoints.length - 3} more places</span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={12} className="text-green-500" />
            <span>{phoneNumbers[0]?.phoneNumber || "Phone not available"}</span>
          </div>
          
          {email && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail size={12} className="text-blue-500" />
              <span className="line-clamp-1">{email}</span>
            </div>
          )}
        </div>
        
        <div className="pt-3">
          <Button 
            onClick={onOpen}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
          >
            View Details & Book
          </Button>
        </div>
      </div>
    </Card>
  );
}
