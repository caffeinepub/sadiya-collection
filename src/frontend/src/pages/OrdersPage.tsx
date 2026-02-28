import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Package, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { formatPrice } from "../data/sampleProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";
import { useProducts } from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrdersPage() {
  const { identity, login } = useInternetIdentity();
  const { data: orders, isLoading } = useMyOrders();
  const { data: products } = useProducts();

  const allProducts = products || [];

  if (!identity) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-display text-3xl font-bold mb-3">My Orders</h1>
          <p className="text-muted-foreground font-body mb-6">
            Sign in to view your order history
          </p>
          <Button
            onClick={login}
            size="lg"
            className="gap-2 font-body btn-ripple"
          >
            Sign In
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </main>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground font-body mb-6">
              Your orders will appear here after you make a purchase.
            </p>
            <Link to="/shop">
              <Button size="lg" className="gap-2 font-body btn-ripple">
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-6">My Orders</h1>
          <p className="text-muted-foreground font-body mb-8">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>

          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">
                      Order #{order.id.slice(0, 8)}…
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-body text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-xs font-body ${
                        STATUS_COLORS[order.status] ||
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                    <span className="font-display font-bold text-lg">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-3">
                  {order.items.map((item) => {
                    const product = allProducts.find(
                      (p) => p.id === item.productId,
                    );
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                          {product?.imageUrls[0] ? (
                            <img
                              src={product.imageUrls[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 m-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-body font-medium line-clamp-1">
                            {product?.name ||
                              `Product ${item.productId.slice(0, 6)}`}
                          </p>
                          <p className="text-xs text-muted-foreground font-body">
                            Qty: {item.quantity.toString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.paymentIntentId && (
                  <p className="text-xs text-muted-foreground font-body mt-3 pt-3 border-t border-border">
                    Payment ID:{" "}
                    <span className="font-mono">
                      {order.paymentIntentId.slice(0, 20)}…
                    </span>
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
