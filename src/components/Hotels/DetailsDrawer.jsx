import React, { useState, useMemo } from "react";
import { 
  XCircle, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Wifi, 
  Waves, 
  UtensilsCrossed, 
  Car, 
  Zap, 
  Bed, 
  Clock, 
  CheckCircle, 
  Users,
  Shield,
  Building,
  Navigation
} from "lucide-react";

export function DetailsDrawer({ open, onClose, data }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  const hotelName = data?.hotelName || data?.name || "Hotel";
  const hotelCode = data?.hotelCode || "";
  const rating = data?.rating || "0 STARS";
  
  const description = data?.description || "";
  const address = data?.address || "";
  const postalCode = data?.postalCode || "";
  const email = data?.email || "";
  const phoneNumbers = data?.phoneResponses || [];
  const website = data?.website || "";
  
  const roomResponses = useMemo(() => data?.roomResponses || [], [data?.roomResponses]);
  const facilityResponses = useMemo(() => data?.facilityResponses || [], [data?.facilityResponses]);
  const hotelImageLinks = useMemo(() => data?.hotelImageLinks || [], [data?.hotelImageLinks]);
  
  const interestPoints = data?.interestPoints || [];

  const roomTypes = useMemo(() => {
    if (!roomResponses.length) return [];
    
    const roomMap = new Map();
    
    roomResponses.forEach(room => {
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
        roomRateKey: room.rateKeyResponses?.rateKeys?.[0]?.roomRateKey,
        allotment: room.allotment,
        facilities: room.facilityResponses || []
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
  }, [roomResponses]);

  const facilitiesByCategory = useMemo(() => {
    if (!facilityResponses.length) return {};
    
    return facilityResponses.reduce((acc, facility) => {
      const category = facility.facilityGroup || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(facility);
      return acc;
    }, {});
  }, [facilityResponses]);

  const allImages = useMemo(() => {
    return hotelImageLinks.map(img => img.imageLink);
  }, [hotelImageLinks]);

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
      <Star key={i} size={20} className="text-yellow-500 fill-current" />
    ));
  };

  const formatBoardName = (boardName) => {
    const boardMap = {
      'ROOM ONLY': 'Room Only',
      'BED AND BREAKFAST': 'Bed & Breakfast',
      'HALF BOARD': 'Half Board',
      'FULL BOARD': 'Full Board',
      'ALL INCLUSIVE': 'All Inclusive'
    };
    return boardMap[boardName] || boardName;
  };

  const getFacilityIcon = (facilityName) => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi size={16} />;
    if (name.includes('pool') || name.includes('swimming')) return <Waves size={16} />;
    if (name.includes('restaurant') || name.includes('dining')) return <UtensilsCrossed size={16} />;
    if (name.includes('parking') || name.includes('car')) return <Car size={16} />;
    if (name.includes('gym') || name.includes('fitness')) return <Zap size={16} />;
    if (name.includes('room service')) return <Bed size={16} />;
    if (name.includes('24-hour')) return <Clock size={16} />;
    if (name.includes('safe')) return <Shield size={16} />;
    if (name.includes('air conditioning')) return <Zap size={16} />;
    return <CheckCircle size={16} />;
  };

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-4xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{hotelName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {formatRating(rating)}
                  <span>{rating}</span>
                  {hotelCode && <span className="text-gray-500">#{hotelCode}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {allImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Hotel Gallery</h3>
                  <div className="relative">
                    <img 
                      src={allImages[activeImageIndex]} 
                      alt={`${hotelName} - ${activeImageIndex + 1}`}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Navigation size={20} className="text-gray-700 rotate-180" />
                        </button>
                        <button
                          onClick={() => setActiveImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Navigation size={20} className="text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === activeImageIndex 
                              ? 'border-blue-500 scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                      <p className="text-gray-600 leading-relaxed">{description}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Location & Contact</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-gray-800 font-medium">{address}</p>
                          {postalCode && <p className="text-gray-600 text-sm">{postalCode}</p>}
                        </div>
                      </div>

                      {phoneNumbers.length > 0 && (
                        <div className="flex items-center gap-3">
                          <Phone size={20} className="text-green-500" />
                          <div>
                            {phoneNumbers.map((phone, idx) => (
                              <p key={idx} className="text-gray-800">
                                {phone.phoneType}: {phone.phoneNumber}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {email && (
                        <div className="flex items-center gap-3">
                          <Mail size={20} className="text-blue-500" />
                          <p className="text-gray-800">{email}</p>
                        </div>
                      )}

                      {website && (
                        <div className="flex items-center gap-3">
                          <Globe size={20} className="text-purple-500" />
                          <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {interestPoints.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Nearby Places</h3>
                      <div className="space-y-2">
                        {interestPoints.map((point, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-800 font-medium">{point.pointName}</span>
                            <span className="text-blue-600 font-semibold">{point.distance}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {roomTypes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Rooms</h3>
                      <div className="space-y-4">
                        {roomTypes.map((room, roomIdx) => (
                          <div key={roomIdx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{room.roomName}</h4>
                                <p className="text-sm text-gray-600">
                                  {room.rooms} room • {room.adults} adults • {room.children} children
                                </p>
                                {room.allotment && (
                                  <p className="text-xs text-green-600 font-medium">
                                    {room.allotment} rooms available
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => setSelectedRoomType(selectedRoomType === roomIdx ? null : roomIdx)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                {selectedRoomType === roomIdx ? 'Hide' : 'View'} Options
                              </button>
                            </div>

                            {selectedRoomType === roomIdx && (
                              <div className="space-y-3 pt-3 border-t border-gray-100">
                                {room.boardOptions.map((board, boardIdx) => (
                                  <div key={boardIdx} className="bg-blue-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-gray-800">
                                        {formatBoardName(board.boardName)}
                                      </span>
                                      <span className="text-xl font-bold text-blue-600">
                                        {formatPrice(board.price)}
                                      </span>
                                    </div>
                                    
                                    {board.cancellationPolicy && (
                                      <div className="text-xs text-gray-600">
                                        <span className="font-medium">Cancellation:</span> Free until {new Date(board.cancellationPolicy.from).toLocaleDateString()}
                                      </div>
                                    )}

                                    {room.facilities.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-blue-100">
                                        <p className="text-xs text-gray-600 mb-1">Room features:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {room.facilities.slice(0, 4).map((facility, idx) => (
                                            <span key={idx} className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                                              {facility.name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(facilitiesByCategory).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Hotel Facilities</h3>
                      <div className="space-y-4">
                        {Object.entries(facilitiesByCategory).map(([category, facilities]) => (
                          <div key={category} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {facilities.map((facility, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  {getFacilityIcon(facility.name)}
                                  <span className="text-gray-700">{facility.name}</span>
                                  {facility.feeApplied && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                      Fee applies
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ready to Book?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-2">Choose from multiple room types and board options</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-blue-500" />
                      <span>Multiple occupancy options available</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
