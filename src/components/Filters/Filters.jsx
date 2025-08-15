import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../common/Card";
import { Label } from "../common/Label";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { setFilters, setNameQuery, setSort } from "../../redux/hotelsSlice";

export function Filters() {
  const dispatch = useDispatch();
  const { filters, sort, nameQuery } = useSelector((s) => s.hotels);
  const [price, setPrice] = useState([filters.extrafilter.minRate, filters.extrafilter.maxRate]);
  const [stars, setStars] = useState([filters.extrafilter.minCategory, filters.extrafilter.maxCategory]);
  const [ta, setTa] = useState({ min: 0, max: 5 });
  const [boards, setBoards] = useState(filters.boards.board || []);

  useEffect(() => {
  const newFilters = {
    extrafilter: {
      ...filters.extrafilter,
      minRate: price[0],
      maxRate: price[1],
      minCategory: stars[0],
      maxCategory: stars[1]
    },
    reviews:
      ta.min || ta.max
        ? [{ minRate: ta.min, maxRate: ta.max, minReviewCount: 1, type: "TRIPADVISOR" }]
        : [],
    boards: { board: boards, included: true },
  };

  // Only dispatch if filters actually changed
  if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
    dispatch(setFilters(newFilters));
  }
}, [price, stars, ta, boards, filters, dispatch]);


  return (
    <div className="space-y-4">
      <Card>
        <Label>Search by Name</Label>
        <Input value={nameQuery} onChange={(e) => dispatch(setNameQuery(e.target.value))} placeholder="e.g., Marriott" />
      </Card>

      <Card>
        <Label>Sort by Price</Label>
        <div className="flex gap-2">
          <Button className={sort === "asc" ? "bg-blue-600" : "bg-black"} onClick={() => dispatch(setSort("asc"))}>
            Low → High
          </Button>
          <Button className={sort === "desc" ? "bg-blue-600" : "bg-black"} onClick={() => dispatch(setSort("desc"))}>
            High → Low
          </Button>
        </div>
      </Card>

      <Card>
        <Label>Price Range (₹)</Label>
        <div className="flex items-center gap-2">
          <Input type="number" value={price[0]} onChange={(e) => setPrice(([_, hi]) => [Number(e.target.value), hi])} className="w-28" />
          <span>to</span>
          <Input type="number" value={price[1]} onChange={(e) => setPrice(([lo, _]) => [lo, Number(e.target.value)])} className="w-28" />
        </div>
      </Card>

      <Card>
        <Label>Star Category</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={1} max={5} value={stars[0]} onChange={(e) => setStars(([_, b]) => [Number(e.target.value), b])} className="w-20" />
          <span>to</span>
          <Input type="number" min={1} max={5} value={stars[1]} onChange={(e) => setStars(([a, _]) => [a, Number(e.target.value)])} className="w-20" />
        </div>
      </Card>

      <Card>
        <Label>TripAdvisor Rating</Label>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} max={5} value={ta.min} onChange={(e) => setTa((o) => ({ ...o, min: Number(e.target.value) }))} className="w-20" />
          <span>to</span>
          <Input type="number" min={0} max={5} value={ta.max} onChange={(e) => setTa((o) => ({ ...o, max: Number(e.target.value) }))} className="w-20" />
        </div>
      </Card>

      <Card>
        <Label>Board</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { code: "AI", name: "All Inclusive" },
            { code: "BB", name: "Bed & Breakfast" },
            { code: "FB", name: "Full Board" },
            { code: "HB", name: "Half Board" },
            { code: "RO", name: "Room Only" },
          ].map((b) => (
            <label
              key={b.code}
              className={`px-2 py-1 rounded-xl border cursor-pointer ${boards.includes(b.code) ? "bg-black text-white" : "bg-white"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={boards.includes(b.code)}
                onChange={() =>
                  setBoards((prev) => (prev.includes(b.code) ? prev.filter((x) => x !== b.code) : [...prev, b.code]))
                }
              />
              {b.name}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
