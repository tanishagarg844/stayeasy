import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../components/common/Card";
import { SearchForm } from "../components/Search/SearchForm";
import { Filters } from "../components/Filters/Filters";
import { PropertyCard } from "../components/Hotels/PropertyCard";
import { DetailsDrawer } from "../components/Hotels/DetailsDrawer";
import { fetchHotels } from "../redux/hotelsSlice";

export default function ResultsPage() {
  const dispatch = useDispatch();
  const hotels = useSelector((s) => s.hotels.list);
  const status = useSelector((s) => s.hotels.status);
  const error = useSelector((s) => s.hotels.error);
  const filters = useSelector((s) => s.hotels.filters);
  const sort = useSelector((s) => s.hotels.sort);
  const nameQuery = useSelector((s) => s.hotels.nameQuery);

  const [sp] = useSearchParams();
  const destination = sp.get("destination") || "";
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";
  let occ = [];
  try {
    occ = JSON.parse(decodeURIComponent(sp.get("occ") || "")) || [];
  } catch {
    occ = [];
  }

  // On load + whenever filters change -> fetch
  useEffect(() => {
    if (!from || !to) return;
    dispatch(
      fetchHotels({
        stay: { checkIn: from, checkOut: to },
        occupancies: occ?.length ? occ : [{ rooms: 1, adults: 2, children: 0 }],
        filters,
      })
    );
  }, [from, to, JSON.stringify(filters), dispatch]);

  // Local detail drawer
  const [openIdx, setOpenIdx] = useState(null);

  // Apply client-side sort & name filter
  const filtered = useMemo(() => {
    let arr = hotels || [];
    if (nameQuery) arr = arr.filter((h) => (h?.name || h?.hotelName || "").toLowerCase().includes(nameQuery.toLowerCase()));
    if (sort === "asc") arr = [...arr].sort((a, b) => (a.minRate || a.price || 0) - (b.minRate || b.price || 0));
    if (sort === "desc") arr = [...arr].sort((a, b) => (b.minRate || b.price || 0) - (a.minRate || a.price || 0));
    return arr;
  }, [hotels, sort, nameQuery]);

  const nav = useNavigate();
  const onSearchSubmit = ({ destination, from, to, occ }) => {
    const params = new URLSearchParams({ destination, from, to, occ: encodeURIComponent(JSON.stringify(occ)) });
    nav(`/results?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid md:grid-cols-[280px,1fr] gap-4">
      <div className="md:col-span-2">
        <SearchForm compact initial={{ destination, from, to, occ }} onSubmit={onSearchSubmit} />
      </div>

      {/* Left Filters */}
      <div className="space-y-4">
        <Filters />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {status === "loading" && <Card>Loading results…</Card>}
        {status === "failed" && <Card className="text-red-600">Error: {String(error)}</Card>}
        {status === "succeeded" && filtered.length === 0 && <Card>No properties match the current search.</Card>}
        {status === "succeeded" && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item, idx) => (
              <div key={idx}>
                <PropertyCard item={item} onOpen={() => setOpenIdx(idx)} />
                <DetailsDrawer open={openIdx === idx} onClose={() => setOpenIdx(null)} data={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
