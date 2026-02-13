import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Bike, MapPin, Clock, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLocationContext } from "../context/LocationContext";

/**
 * LiveOrderTracker
 * - Lightweight map using OpenStreetMap embed (no extra deps / keys)
 * - Animated delivery bike overlay (CSS keyframes)
 * - Compact status stepper: Preparing → Picked → On the way → Delivered
 *
 * Props:
 * - order: populated order object (at least {_id, status, restaurant?.name, createdAt, deliveryTime})
 */
export default function LiveOrderTracker({ order }) {
  const { coords } = useLocationContext();

  const hasOrder = !!order?._id;

  const status = String(order?.status || "").toLowerCase();

  const uiSteps = [
    { key: "preparing", label: "Preparing" },
    { key: "picked", label: "Picked" },
    { key: "on-the-way", label: "On the way" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStepIndex = useMemo(() => {
    if (status === "cancelled") return -1;
    if (status === "delivered") return 3;
    if (status === "out-for-delivery") return 2;
    if (status === "preparing") return 0;
    if (status === "confirmed" || status === "placed") return 1;
    return 0;
  }, [status]);

  const isCancelled = status === "cancelled";

  const { lat, lng } = useMemo(() => {
    if (coords?.latitude && coords?.longitude) {
      return { lat: coords.latitude, lng: coords.longitude };
    }
    // Fallback – somewhere in India
    return { lat: 20.5937, lng: 78.9629 };
  }, [coords]);

  const bbox = useMemo(() => {
    const d = 0.08;
    const south = lat - d;
    const west = lng - d;
    const north = lat + d;
    const east = lng + d;
    return { south, west, north, east };
  }, [lat, lng]);

  const mapUrl = useMemo(() => {
    const { south, west, north, east } = bbox;
    const bboxParam = `${west}%2C${south}%2C${east}%2C${north}`;
    const markerParam = `${lat}%2C${lng}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bboxParam}&layer=mapnik&marker=${markerParam}`;
  }, [bbox, lat, lng]);

  if (!hasOrder) return null;

  return (
    <section className="mb-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 shadow-2xl">
        {/* Glass gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-amber-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40">
              <Bike className="w-5 h-5 text-white" />
              <motion.span
                className="absolute inset-0 rounded-xl border border-emerald-300/50"
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
                Live Order Tracking
              </p>
              <p className="text-sm font-medium text-slate-50">
                {order?.restaurant?.name || "Your restaurant"} •{" "}
                <span className="text-emerald-200">
                  #{String(order._id).slice(-6).toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs text-slate-300">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                ETA{" "}
                <span className="font-semibold">
                  {order?.deliveryTime ? `${order.deliveryTime} min` : "30-45 min"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Live updates via Socket
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Map + animated bike */}
          <div className="relative overflow-hidden rounded-xl border border-white/8 bg-slate-900/70 shadow-inner">
            <div className="relative h-52 sm:h-56">
              <iframe
                title="Live delivery map"
                src={mapUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Destination pin */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative -translate-y-2">
                  <motion.div
                    className="absolute -top-6 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-md"
                    animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative flex h-9 w-9 -translate-x-1/2 items-center justify-center">
                    <div className="h-7 w-7 rounded-full bg-slate-900/90 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400/80">
                      <div className="flex h-full w-full items-center justify-center">
                        <MapPin className="h-4 w-4 text-emerald-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated bike path – horizontal oscillation, shown while on the way */}
              {status !== "delivered" && !isCancelled && (
                <div className="pointer-events-none absolute inset-x-6 bottom-4 flex items-center justify-between gap-3">
                  <div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-emerald-400/40 via-cyan-400/40 to-emerald-400/10" />
                  <motion.div
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50"
                    animate={
                      status === "out-for-delivery"
                        ? { x: ["-40%", "40%", "-40%"] }
                        : { x: 0 }
                    }
                    transition={
                      status === "out-for-delivery"
                        ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.4 }
                    }
                  >
                    <Bike className="h-5 w-5 text-white" />
                    <motion.span
                      className="absolute inset-0 rounded-full border border-emerald-200/40"
                      animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.12, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Status stepper + meta */}
          <div className="space-y-3 rounded-xl bg-slate-900/70 p-3 sm:p-4 border border-white/6 shadow-inner">
            {isCancelled ? (
              <div className="flex items-center gap-3 rounded-xl bg-rose-900/40 border border-rose-500/40 px-3 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/80">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-100">Order cancelled</p>
                  <p className="text-xs text-rose-200/80">
                    Reach out to support if this was not expected.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Status
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <span className="inline-flex h-2 w-2">
                      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                    </span>
                    Live
                  </div>
                </div>

                <div className="flex items-start justify-between gap-1">
                  {uiSteps.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isDone = idx < currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-1 flex-col items-center">
                        <div className="relative mb-1 flex items-center justify-center">
                          <motion.div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold ${
                              isDone || isActive
                                ? "bg-emerald-500/90 border-emerald-300 text-white shadow-md shadow-emerald-500/40"
                                : "bg-slate-800 border-slate-600 text-slate-300"
                            }`}
                            animate={
                              isActive
                                ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 rgba(16,185,129,0.7)", "0 0 0 8px rgba(16,185,129,0)", "0 0 0 0 rgba(16,185,129,0)"] }
                                : {}
                            }
                            transition={
                              isActive
                                ? { duration: 1.4, repeat: Infinity, ease: "easeOut" }
                                : { duration: 0.2 }
                            }
                          >
                            {idx + 1}
                          </motion.div>
                          {isDone && (
                            <CheckCircle2 className="absolute -bottom-1 -right-1 h-3 w-3 text-emerald-300" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] font-medium text-center ${
                            isDone || isActive ? "text-slate-50" : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Meta row */}
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-900/70 p-2 text-[11px] text-slate-300">
              <div>
                <p className="text-slate-500">Placed</p>
                <p className="font-semibold">
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Total</p>
                <p className="font-semibold">
                  ₹{Number(order?.total || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

