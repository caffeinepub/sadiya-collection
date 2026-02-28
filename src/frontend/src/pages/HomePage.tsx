import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  RotateCcw,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import OfferBanner from "../components/OfferBanner";
import ProductCard from "../components/ProductCard";
import { BAG_CATEGORIES } from "../data/sampleProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useActiveOffers, useProducts } from "../hooks/useQueries";

export default function HomePage() {
  const { data: products, isLoading } = useProducts();
  const { data: offers } = useActiveOffers();
  const { identity, login } = useInternetIdentity();

  const displayProducts = products || [];
  const featuredProducts = displayProducts
    .filter((p) => p.isActive)
    .slice(0, 8);

  return (
    <main className="min-h-screen">
      {/* Offer Banner */}
      {offers && offers.length > 0 && <OfferBanner offers={offers} />}

      {/* ── HERO ── */}
      <section className="hero-gradient relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Photographic texture layer */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bags.dim_1400x600.jpg')",
            opacity: 0.12,
          }}
        />

        {/* Deep scrim — stronger left, fading right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />

        {/* Decorative oversized "S" letterform — signature detail */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none hidden lg:block"
          aria-hidden="true"
        >
          <span
            className="font-display font-bold leading-none"
            style={{
              fontSize: "clamp(280px, 28vw, 480px)",
              color: "oklch(1 0 0 / 0.03)",
              lineHeight: 1,
            }}
          >
            S
          </span>
        </div>

        {/* Bag image — off-grid right panel, diagonal clip */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[45%] hidden lg:block overflow-hidden"
          style={{
            clipPath: "polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        >
          <img
            src="/assets/generated/bag-handbag.dim_600x600.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
          {/* inner scrim so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            {/* Est. label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-8 bg-primary" />
              <span
                className="font-body text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "oklch(0.75 0.06 50)" }}
              >
                Est. 2026 · MT Industries Ltd.
              </span>
            </motion.div>

            {/* Brand name — editorial split */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-2"
            >
              <h1
                className="font-display font-bold leading-[0.9] tracking-tight"
                style={{ color: "oklch(0.97 0.005 30)" }}
              >
                <span
                  style={{
                    fontSize: "clamp(56px, 9vw, 120px)",
                    display: "block",
                  }}
                >
                  SADIYA
                </span>
                <span
                  className="font-accent font-normal italic"
                  style={{
                    fontSize: "clamp(32px, 5.5vw, 72px)",
                    color: "oklch(0.82 0.1 50)",
                    display: "block",
                    marginTop: "-0.1em",
                    letterSpacing: "0.02em",
                  }}
                >
                  Collection
                </span>
              </h1>
            </motion.div>

            {/* Thin rule + tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="h-px flex-1 max-w-[60px]"
                  style={{ background: "oklch(0.82 0.1 50)" }}
                />
                <p
                  className="font-accent italic"
                  style={{
                    fontSize: "clamp(14px, 1.4vw, 18px)",
                    color: "oklch(0.88 0.06 45)",
                    letterSpacing: "0.03em",
                  }}
                >
                  "Your Bags Shopping Ends Here"
                </p>
              </div>
              <p
                className="font-body text-sm"
                style={{ color: "oklch(0.7 0.01 30)" }}
              >
                Premium leather bags, curated for the discerning collector.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  className="gap-2 btn-ripple font-body text-base font-semibold px-7"
                  style={{
                    background: "oklch(0.97 0.005 30)",
                    color: "oklch(0.15 0.02 25)",
                    border: "none",
                  }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              {!identity && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={login}
                  className="gap-2 font-body text-sm px-5"
                  style={{
                    color: "oklch(0.88 0.06 45)",
                    border: "1px solid oklch(0.88 0.06 45 / 0.35)",
                  }}
                >
                  Sign In / Register
                </Button>
              )}
            </motion.div>

            {/* Vertical "scroll" hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 hidden md:flex items-center gap-2"
            >
              <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/30" />
              <span
                className="font-body text-[10px] uppercase tracking-widest"
                style={{ color: "oklch(0.6 0.01 30)" }}
              >
                Scroll to explore
              </span>
            </motion.div>
          </div>
        </div>

        {/* Right-edge vertical brand label */}
        <div
          className="absolute right-4 bottom-10 hidden xl:flex items-center gap-2"
          style={{ writingMode: "vertical-rl" }}
          aria-hidden="true"
        >
          <span
            className="font-body text-[9px] uppercase tracking-[0.35em]"
            style={{ color: "oklch(0.5 0.01 30)" }}
          >
            SADIYA · Premium Bags · 2026
          </span>
        </div>
      </section>

      {/* ── CATEGORY RAIL ── */}
      <section className="py-7 border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {BAG_CATEGORIES.slice(1).map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.035 }}
              >
                <a href={`/shop?category=${encodeURIComponent(cat)}`}>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-full text-xs font-body font-medium border border-border text-foreground/70 hover:border-primary hover:text-primary transition-all duration-200 bg-transparent"
                  >
                    {cat}
                  </button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-7 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {[
              {
                icon: Truck,
                title: "Free Delivery",
                desc: "Orders above ₹999",
              },
              {
                icon: Shield,
                title: "AI Verified",
                desc: "Trademark protected",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "30-day hassle-free",
              },
              { icon: Star, title: "Handpicked", desc: "Premium collections" },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-center gap-3 p-4 bg-background"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-display text-xs font-semibold">{title}</p>
                  <p className="text-[11px] text-muted-foreground font-body">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Editorial section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 relative"
          >
            {/* Oversized ghost label */}
            <div
              className="absolute -top-6 left-0 select-none pointer-events-none hidden md:block"
              aria-hidden="true"
            >
              <span
                className="font-accent font-bold opacity-[0.04] leading-none text-foreground"
                style={{ fontSize: "clamp(80px, 10vw, 140px)" }}
              >
                Bags
              </span>
            </div>

            <div className="relative">
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Our Collections
              </p>
              <div className="flex items-end gap-4 mb-1">
                <h2
                  className="font-accent italic font-normal leading-none text-foreground"
                  style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
                >
                  Featured Bags
                </h2>
                <div className="hidden md:flex items-center gap-2 mb-2">
                  <div className="h-px w-12 bg-primary/40" />
                  <span className="font-body text-[11px] text-muted-foreground uppercase tracking-wider">
                    {featuredProducts.length} pieces
                  </span>
                </div>
              </div>
              {/* Asymmetric accent line */}
              <div className="flex gap-1 mt-2">
                <div className="h-[2px] w-16 bg-primary rounded-full" />
                <div className="h-[2px] w-4 bg-primary/30 rounded-full" />
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-display text-lg font-semibold mb-1">
                New arrivals coming soon
              </p>
              <p className="text-muted-foreground font-body text-sm">
                Products are being added — check back shortly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/shop">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 font-body rounded-full px-8 border-foreground/20 hover:border-primary"
              >
                View All Collections
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE CTA BAND ── */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bags.dim_1400x600.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="font-body text-[10px] uppercase tracking-[0.35em] mb-4"
              style={{ color: "oklch(0.7 0.06 50)" }}
            >
              Limited Time
            </p>
            <h2
              className="font-accent italic font-normal mb-3"
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                color: "oklch(0.97 0.005 30)",
                lineHeight: 1.1,
              }}
            >
              Exclusive Offers Await
            </h2>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-white/20" />
              <p
                className="font-body text-sm opacity-70"
                style={{ color: "oklch(0.97 0.005 30)" }}
              >
                Sign in to unlock special discounts and track your orders
              </p>
              <div className="h-px w-12 bg-white/20" />
            </div>
            {!identity && (
              <Button
                onClick={login}
                size="lg"
                className="btn-ripple font-body gap-2 px-8 rounded-full"
                style={{
                  background: "oklch(0.97 0.005 30)",
                  color: "oklch(0.15 0.02 25)",
                  border: "none",
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Social Proof
            </p>
            <h2
              className="font-accent italic font-normal text-foreground leading-none"
              style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
            >
              What Our Customers Say
            </h2>
            <div className="flex gap-1 mt-2">
              <div className="h-[2px] w-16 bg-primary rounded-full" />
              <div className="h-[2px] w-4 bg-primary/30 rounded-full" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Priya Sharma",
                review:
                  "Absolutely love my tote bag! The quality is exceptional and delivery was so fast. SADIYA Collection is now my go-to.",
                rating: 5,
                product: "Classic Leather Tote",
                avatar: "PS",
              },
              {
                name: "Neha Gupta",
                review:
                  "The evening clutch is stunning. Perfect for parties, the packaging was so elegant. Will definitely order again!",
                rating: 5,
                product: "Evening Sequin Clutch",
                avatar: "NG",
              },
              {
                name: "Anjali Singh",
                review:
                  "My backpack arrived exactly as shown — leather quality is top-notch. Great value and beautiful craftsmanship.",
                rating: 4,
                product: "Burgundy Urban Backpack",
                avatar: "AS",
              },
            ].map(({ name, review, rating, product, avatar }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 relative"
              >
                {/* Large quote mark */}
                <span
                  className="absolute top-4 right-5 font-display text-6xl leading-none text-primary/10 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  "
                </span>

                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="font-body text-sm text-card-foreground/80 leading-relaxed mb-5 italic">
                  {review}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="font-display text-[11px] font-bold text-primary">
                      {avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-xs">{name}</p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {product}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
