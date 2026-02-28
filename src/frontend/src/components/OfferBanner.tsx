import { motion } from "motion/react";
import type { Offer } from "../backend.d";

interface OfferBannerProps {
  offers: Offer[];
}

export default function OfferBanner({ offers }: OfferBannerProps) {
  if (!offers || offers.length === 0) return null;

  const activeOffers = offers.filter((o) => o.isActive);
  if (activeOffers.length === 0) return null;

  const offerText = activeOffers
    .map((o) => `🎉 ${o.name} — ${o.discountPercent.toString()}% OFF`)
    .join("   ✦   ");

  // Single string repeated for marquee — no array index keys needed
  const marqueeLine = `${offerText}   ✦   ${offerText}   ✦   ${offerText}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="offer-banner animate-offer-pulse overflow-hidden py-2 relative"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />

      {/* Marquee text */}
      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 px-4">
          <span className="text-primary-foreground font-body text-sm font-semibold tracking-wide">
            {marqueeLine}
          </span>
          <span className="text-primary-foreground font-body text-sm font-semibold tracking-wide">
            {marqueeLine}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
