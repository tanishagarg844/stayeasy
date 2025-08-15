import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../redux/hotelsSlice";
import { PropertyCard } from "../components/Hotels/PropertyCard";
import { DetailsDrawer } from "../components/Hotels/DetailsDrawer";
import { Filters } from "../components/Filters/Filters";
import { SearchForm } from "../components/Search/SearchForm";
import { 
  Building, 
  Bed, 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Filter,
  X,
  Search,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { list: hotels, status, error } = useSelector((state) => state.hotels);
  const { filters, sort, nameQuery } = useSelector((state) => state.hotels);
  
  const [openIdx, setOpenIdx] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const destination = searchParams.get("destination") || "";
  const destinationId = searchParams.get("destinationId") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const occParam = searchParams.get("occ") || "";

  const occ = useMemo(() => {
    try {
      return occParam ? JSON.parse(decodeURIComponent(occParam)) : [{ adults: 2, children: 0 }];
    } catch {
      return [{ adults: 2, children: 0 }];
    }
  }, [occParam]);

  useEffect(() => {
    if (destination && from && to) {
      const stay = {
        checkIn: from,
        checkOut: to
      };
      
      const occupancies = occ;
      
      dispatch(fetchHotels({ stay, occupancies, filters, destinationId: destinationId || null }));
    }
  }, [destination, from, to, occ, filters, destinationId, dispatch]);

  const onSearchSubmit = ({ destination, destinationId, from, to, occ }) => {
    const params = new URLSearchParams({
      destination,
      destinationId: destinationId || "",
      from,
      to,
      occ: encodeURIComponent(JSON.stringify(occ)),
    });
    setSearchParams(params);
  };

  const processedHotels = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return [];
    
    return hotels.map(hotel => {
      const displayLowestPrice = hotel.roomResponses?.reduce((min, room) => {
        const price = room.rateKeyResponses?.totalPrice || 0;
        return price > 0 && (min === 0 || price < min) ? price : min;
      }, 0) || 0;

      return {
        ...hotel,
        displayLowestPrice
      };
    });
  }, [hotels]);

  const filtered = useMemo(() => {
    let result = [...processedHotels];

    if (nameQuery) {
      const query = nameQuery.toLowerCase();
      result = result.filter(hotel => 
        hotel.hotelName?.toLowerCase().includes(query) ||
        hotel.address?.toLowerCase().includes(query)
      );
    }

    if (filters.rating) {
      const starCount = parseInt(filters.rating);
      result = result.filter(hotel => {
        const hotelRating = parseInt(hotel.rating?.match(/\d+/)?.[0] || "0");
        return hotelRating === starCount;
      });
    }

    if (filters.segment) {
      result = result.filter(hotel => 
        hotel.segments?.includes(filters.segment)
      );
    }

    if (filters.accommodationType) {
      result = result.filter(hotel => 
        hotel.hotelAccommodation === filters.accommodationType
      );
    }

    if (filters.facilities?.length > 0) {
      result = result.filter(hotel => 
        filters.facilities.every(facility => 
          hotel.facilityResponses?.some(f => f.name === facility)
        )
      );
    }

    if (filters.minPrice > 0 || filters.maxPrice < 100000) {
      result = result.filter(hotel => {
        const price = hotel.displayLowestPrice;
        return price >= filters.minPrice && price <= filters.maxPrice;
      });
    }

    if (sort === "asc") {
      result.sort((a, b) => a.displayLowestPrice - b.displayLowestPrice);
    } else if (sort === "desc") {
      result.sort((a, b) => b.displayLowestPrice - a.displayLowestPrice);
    }

    return result;
  }, [processedHotels, filters, sort, nameQuery]);

  const resultsStats = useMemo(() => {
    if (filtered.length === 0) return null;
    
    const prices = filtered.map(h => h.displayLowestPrice).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgRating = filtered.reduce((sum, h) => {
      const rating = parseInt(h.rating?.match(/\d+/)?.[0] || "0");
      return sum + rating;
    }, 0) / filtered.length;
    
    return {
      total: filtered.length,
      priceRange: { min: minPrice, max: maxPrice },
      avgRating: Math.round(avgRating)
    };
  }, [filtered]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800">Searching for Hotels...</h2>
          <p className="text-gray-600">Finding the best options for your stay</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800">Search Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Search
              </button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Building size={16} />
                <span>{destination}</span>
                <span>•</span>
                <Calendar size={16} />
                <span>{from} - {to}</span>
                <span>•</span>
                <Bed size={16} />
                <span>{occ.reduce((sum, o) => sum + o.adults + o.children, 0)} guests</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearchForm(!showSearchForm)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search size={20} className="text-gray-600" />
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Filter size={16} />
                Filters
                {Object.values(filters).some(v => v !== null && v !== 0 && v !== 100000 && (!Array.isArray(v) || v.length > 0)) && (
                  <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-bold">
                    {Object.values(filters).filter(v => v !== null && v !== 0 && v !== 100000 && (!Array.isArray(v) || v.length > 0)).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showSearchForm && (
            <div className="pb-4 border-t border-gray-200">
              <SearchForm onSubmit={onSearchSubmit} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {showFilters && (
            <div className="lg:w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <Filters />
              </div>
            </div>
          )}

          <div className="flex-1">
            {resultsStats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{resultsStats.total}</div>
                      <div className="text-sm text-gray-600">Properties</div>
                    </div>
                    
                    {resultsStats.priceRange.min > 0 && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800">
                          ₹{resultsStats.priceRange.min.toLocaleString()} - ₹{resultsStats.priceRange.max.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Price Range</div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {Array.from({ length: resultsStats.avgRating }).map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      value={sort || ""}
                      onChange={(e) => dispatch({ type: "hotels/setSort", payload: e.target.value || null })}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Recommended</option>
                      <option value="asc">Price: Low to High</option>
                      <option value="desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Building size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find more options.
                </p>
                <button
                  onClick={() => setShowFilters(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Adjust Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((hotel, idx) => (
                  <PropertyCard
                    key={hotel.id || idx}
                    item={hotel}
                    onOpen={() => setOpenIdx(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {openIdx !== null && (
        <DetailsDrawer
          open={openIdx !== null}
          onClose={() => setOpenIdx(null)}
          data={filtered[openIdx]}
        />
      )}
    </div>
  );
}
