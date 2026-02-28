import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  ShoppingCart,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../contexts/CartContext";
import {
  SAMPLE_PRODUCTS,
  formatPrice,
  getDiscountedPrice,
} from "../data/sampleProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProducts } from "../hooks/useQueries";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  const { data: products } = useProducts();
  const { addItem, isLoading } = useCart();
  const { identity, login } = useInternetIdentity();

  const allProducts =
    products && products.length > 0 ? products : SAMPLE_PRODUCTS;
  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          Product not found
        </h2>
        <p className="text-muted-foreground font-body mb-6">
          This product may have been removed or the link is invalid.
        </p>
        <Link to="/shop">
          <Button>Browse All Bags</Button>
        </Link>
      </div>
    );
  }

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls
      : ["/assets/generated/bag-handbag.dim_600x600.jpg"];

  const finalPrice = getDiscountedPrice(product.price, product.discountPercent);
  const hasDiscount = product.discountPercent > 0n;
  const savings = product.price - finalPrice;
  const isOutOfStock = product.stockQuantity === 0n;

  const handleAddToCart = async () => {
    if (!identity) {
      login();
      return;
    }
    if (isOutOfStock) return;
    try {
      await addItem(product.id, BigInt(quantity));
      setAddedAnim(true);
      setTimeout(() => setAddedAnim(false), 1000);
      toast.success(`${product.name} added to cart!`, { duration: 2000 });
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[150px]">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-3">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        (i) => (i - 1 + images.length) % images.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((i) => (i + 1) % images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {hasDiscount && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground animate-pop-in">
                  <Tag className="w-3 h-3 mr-1" />
                  {product.discountPercent.toString()}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    // biome-ignore lint/suspicious/noArrayIndexKey: image array index is stable
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-2 font-body text-xs uppercase tracking-wider"
            >
              {product.category}
            </Badge>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= 4 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-body">
                (4.0 · 24 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-display text-4xl font-bold text-foreground">
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through font-body">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600 dark:text-green-400 font-body mb-4">
                You save {formatPrice(savings)} (
                {product.discountPercent.toString()}% off)
              </p>
            )}

            <Separator className="my-4" />

            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOutOfStock ? "bg-destructive" : "bg-green-500"
                }`}
              />
              <span className="text-sm font-body text-muted-foreground">
                {isOutOfStock
                  ? "Out of Stock"
                  : `In Stock (${product.stockQuantity.toString()} left)`}
              </span>
            </div>

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3 mb-6">
                <span className="font-body text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-body font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(Number(product.stockQuantity), q + 1),
                      )
                    }
                    className="px-3 py-2 hover:bg-muted transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isLoading}
                className={`w-full gap-2 btn-ripple font-body text-base ${
                  addedAnim ? "bg-green-600" : ""
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : addedAnim ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {addedAnim
                  ? "Added to Cart!"
                  : isOutOfStock
                    ? "Out of Stock"
                    : !identity
                      ? "Sign In to Add"
                      : "Add to Cart"}
              </Button>
            </motion.div>

            {/* AI Trademark Badge */}
            <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground font-body">
                <span className="font-semibold text-foreground">
                  AI Verified
                </span>{" "}
                — Product images are automatically scanned for trademark
                compliance.
              </p>
            </div>

            {/* Perks */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: Truck, text: "Free delivery above ₹999" },
                { icon: Shield, text: "Authentic product guarantee" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-xs text-muted-foreground font-body"
                >
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
