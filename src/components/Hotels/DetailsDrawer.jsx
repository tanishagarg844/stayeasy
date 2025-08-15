import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone } from "lucide-react";
import { Card } from "../common/Card";

export function DetailsDrawer({ open, onClose, data }) {
  if (!open) return null;
  const name = data?.name || data?.hotelName || "Hotel";
  const images = data?.images || data?.gallery || [];
  const description = data?.description || data?.shortDescription || data?.longDescription || data?.desc || "";
  const facilities = data?.facilities || data?.amenities || data?.features || [];
  const rooms = data?.rooms || data?.roomTypes || [];
  const poi = data?.pointsOfInterest || data?.nearby || [];
  const email = data?.email || data?.contact?.email;
  const phones = data?.phones || data?.contact?.phones || [];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 h-full w-full md:w-[680px] bg-white shadow-xl overflow-y-auto"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-xl font-semibold">{name}</h3>
            <button className="p-2" onClick={onClose} aria-label="Close">
              <X />
            </button>
          </div>
          <div className="p-4 space-y-6">
            {/* Images */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(images || []).slice(0, 9).map((img, i) => (
                <img key={i} className="aspect-video object-cover w-full rounded-lg" src={img?.url || img} alt="" />
              ))}
            </div>
            {/* Description */}
            {description && (
              <section>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
              </section>
            )}
            {/* Rooms & Rates */}
            {Array.isArray(rooms) && rooms.length > 0 && (
              <section>
                <h4 className="font-semibold mb-2">Rooms & Rates</h4>
                <div className="space-y-2">
                  {rooms.map((r, i) => (
                    <Card key={i} className="border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r?.name || r?.roomName || `Room ${i + 1}`}</div>
                          <div className="text-xs text-gray-600">{r?.board || r?.boardBasis}</div>
                        </div>
                        <div className="text-lg font-semibold">₹{r?.rate || r?.price || r?.amount || 0}</div>
                      </div>
                      {r?.cancellation && (
                        <div className="text-xs text-gray-600 mt-1">Cancellation: {r.cancellation}</div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
            {/* Facilities */}
            {Array.isArray(facilities) && facilities.length > 0 && (
              <section>
                <h4 className="font-semibold mb-2">Facilities</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  {facilities.map((f, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded-full">{f?.name || f}</span>
                  ))}
                </div>
              </section>
            )}
            {/* Points of Interest */}
            {Array.isArray(poi) && poi.length > 0 && (
              <section>
                <h4 className="font-semibold mb-2">Nearby Points</h4>
                <ul className="list-disc ml-6 text-sm text-gray-700">
                  {poi.map((p, i) => (
                    <li key={i}>{p?.name || p?.title || p}</li>
                  ))}
                </ul>
              </section>
            )}
            {/* Contact */}
            {(email || phones.length) && (
              <section>
                <h4 className="font-semibold mb-2">Contact</h4>
                <div className="space-y-1 text-sm">
                  {email && (
                    <div className="flex items-center gap-2"><Mail size={14} /> {email}</div>
                  )}
                  {phones.map((p, i) => (
                    <div key={i} className="flex items-center gap-2"><Phone size={14} /> {p?.number || p}</div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}
