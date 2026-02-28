import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import OfferBanner from "../components/OfferBanner";
import ProductCard from "../components/ProductCard";
import { BAG_CATEGORIES, SAMPLE_PRODUCTS } from "../data/sampleProducts";
import { useActiveOffers, useProducts } from "../hooks/useQueries";

export default function ShopPage() {
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useProducts();
  const { data: offers } = useActiveOffers();

  const displayProducts =
    products && products.length > 0 ? products : SAMPLE_PRODUCTS;

  const filtered = useMemo(() => {
    let result = displayProducts.filter((p) => p.isActive);

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => Number(a.price - b.price));
        break;
      case "price-desc":
        result = [...result].sort((a, b) => Number(b.price - a.price));
        break;
      case "newest":
        result = [...result].sort((a, b) => Number(b.createdAt - a.createdAt));
        break;
      case "discount":
        result = [...result].sort(
          (a, b) => Number(b.discountPercent) - Number(a.discountPercent),
        );
        break;
    }

    return result;
  }, [displayProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <main className="min-h-screen">
      {offers && <OfferBanner offers={offers} />}

      {/* Header */}
      <div className="bg-muted/30 py-10 border-b border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-body mb-1">
              Browse
            </p>
            <h1 className="font-display text-4xl font-bold text-foreground">
              All Bags
            </h1>
            <p className="font-accent italic text-muted-foreground mt-1">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bags..."
              className="pl-9 font-body"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44 font-body">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="discount">Best Discount</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowFilters((f) => !f)}
            className="gap-2 font-body sm:w-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Category filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {BAG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-body text-xs py-1 px-3"
                  >
                    {cat}
                  </Badge>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category quick pills (always visible, horizontal scroll) */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {BAG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground border-border hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              No bags found
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
