import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Tag } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../contexts/CartContext";
import { formatPrice, getDiscountedPrice } from "../data/sampleProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, isLoading } = useCart();
  const { identity, login } = useInternetIdentity();

  const finalPrice = getDiscountedPrice(product.price, product.discountPercent);
  const hasDiscount = product.discountPercent > 0n;
  const imageUrl =
    product.imageUrls[0] || "/assets/generated/bag-handbag.dim_600x600.jpg";
  const isOutOfStock = product.stockQuantity === 0n;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!identity) {
      login();
      return;
    }
    if (isOutOfStock) return;
    try {
      await addItem(product.id);
      toast.success("Added to cart!", {
        description: product.name,
        duration: 2000,
      });
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card"
    >
      <Link to="/product/$id" params={{ id: product.id }}>
        <article className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer">
          {/* Image — taller aspect for editorial feel */}
          <div
            className="relative overflow-hidden bg-muted"
            style={{ aspectRatio: "4/5" }}
          >
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              loading="lazy"
            />

            {/* Discount pill — stark black-on-gold for punch */}
            {hasDiscount && (
              <div
                className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-body font-bold tracking-wider animate-pop-in"
                style={{
                  background: "oklch(0.78 0.12 70)",
                  color: "oklch(0.12 0.02 25)",
                }}
              >
                <Tag className="w-2.5 h-2.5" />
                {product.discountPercent.toString()}% OFF
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <span className="font-body text-xs uppercase tracking-widest text-foreground/60 border border-foreground/20 px-3 py-1 rounded-sm">
                  Sold Out
                </span>
              </div>
            )}

            {/* Slide-up add-to-cart bar — dramatic reveal on hover */}
            {!isOutOfStock && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 font-body text-xs font-semibold uppercase tracking-widest transition-colors"
                  style={{
                    background: "oklch(0.15 0.02 25 / 0.92)",
                    backdropFilter: "blur(8px)",
                    color: "oklch(0.97 0.005 30)",
                    border: "none",
                  }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {!identity ? "Sign In to Add" : "Add to Cart"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Info — minimal, hierarchy-driven */}
          <div className="p-3.5">
            {/* Category */}
            <p className="font-body text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
              {product.category}
            </p>

            {/* Product name */}
            <h3 className="font-display text-sm font-semibold text-card-foreground leading-snug line-clamp-1 mb-2">
              {product.name}
            </h3>

            {/* Thin rule */}
            <div className="h-px bg-border mb-2.5" />

            {/* Price row */}
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-bold text-foreground">
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="font-body text-[11px] text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
