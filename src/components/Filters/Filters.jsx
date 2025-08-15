import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, resetFilters } from "../../redux/hotelsSlice";
import { Button } from "../common/Button";
import { 
  Star, 
  Building, 
  Wifi, 
  Waves, 
  UtensilsCrossed, 
  Car, 
  Zap, 
  Bed, 
  Clock, 
  Shield,
  X
} from "lucide-react";

export function Filters() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.hotels);
  const { list: hotels, status } = useSelector((state) => state.hotels);

  if (status === "loading" || !hotels) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const filterOptions = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return {};

    const ratings = [...new Set(hotels.map(h => h.rating).filter(Boolean))];
    const segments = [...new Set(hotels.flatMap(h => h.segments || []).filter(Boolean))];
    const accommodationTypes = [...new Set(hotels.map(h => h.hotelAccommodation).filter(Boolean))];
    const facilities = [...new Set(hotels.flatMap(h => h.facilityResponses?.map(f => f.name) || []).filter(Boolean))];

    return {
      ratings: ratings.sort(),
      segments: segments.sort(),
      accommodationTypes: accommodationTypes.sort(),
      facilities: facilities.sort()
    };
  }, [hotels]);

  const overallPriceRange = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return { min: 0, max: 100000 };

    const prices = hotels
      .map(h => h.roomResponses?.reduce((min, room) => {
        const price = room.rateKeyResponses?.totalPrice || 0;
        return price > 0 && (min === 0 || price < min) ? price : min;
      }, 0) || 0)
      .filter(p => p > 0);

    if (prices.length === 0) return { min: 0, max: 100000 };
    
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100
    };
  }, [hotels]);

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== null && v !== 0 && v !== 100000 && (!Array.isArray(v) || v.length > 0)
  ).length;

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const toggleFacility = (facility) => {
    const currentFacilities = filters.facilities || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility];
    handleFilterChange('facilities', newFacilities);
  };

  const handleReset = () => {
    dispatch(resetFilters());
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
    return <Building size={16} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {filterOptions.ratings && filterOptions.ratings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Star Rating</h4>
          <div className="space-y-2">
            {filterOptions.ratings.map((rating) => {
              const starCount = parseInt(rating.match(/\d+/)?.[0] || "0");
              return (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={filters.rating === rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, starCount) }).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{rating}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {filterOptions.segments && filterOptions.segments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hotel Segment</h4>
          <select
            value={filters.segment || ""}
            onChange={(e) => handleFilterChange('segment', e.target.value || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Segments</option>
            {filterOptions.segments.map((segment) => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
        </div>
      )}

      {filterOptions.accommodationTypes && filterOptions.accommodationTypes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Accommodation Type</h4>
          <select
            value={filters.accommodationType || ""}
            onChange={(e) => handleFilterChange('accommodationType', e.target.value || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {filterOptions.accommodationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice === 100000 ? "" : filters.maxPrice || ""}
              onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 100000)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            Range: ₹{overallPriceRange.min.toLocaleString()} - ₹{overallPriceRange.max.toLocaleString()}
          </div>
        </div>
      </div>

      {filterOptions.facilities && filterOptions.facilities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Key Facilities</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filterOptions.facilities.slice(0, 20).map((facility) => (
              <label key={facility} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.facilities?.includes(facility) || false}
                  onChange={() => toggleFacility(facility)}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getFacilityIcon(facility)}
                  <span className="line-clamp-1">{facility}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
          >
            <X size={16} className="mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
