import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "../data/sampleProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelOrder,
  useMyOrders,
  useProducts,
  useRequestReturn,
} from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  return_requested: "bg-amber-100 text-amber-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
};

// Shipping timeline steps (excluding cancelled)
const TIMELINE_STEPS = [
  { key: "pending", label: "Ordered" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const STEP_ORDER = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const RETURN_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCarrierTrackingUrl(
  carrier: string,
  trackingNumber: string,
): string | null {
  const t = encodeURIComponent(trackingNumber);
  switch (carrier) {
    case "DHL":
      return `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${t}`;
    case "FedEx":
      return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${t}`;
    case "BlueDart":
      return `https://www.bluedart.com/tracking?trackFor=0&track=${t}`;
    case "DTDC":
      return `https://www.dtdc.in/tracking/shipment-detail?AWB=${t}`;
    case "India Post":
      return "https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx";
    case "Delhivery":
      return `https://www.delhivery.com/track/package/${t}`;
    case "Ekart":
      return `https://ekartlogistics.com/shipmenttrack/${t}`;
    case "Xpressbees":
      return `https://www.xpressbees.com/shipment/tracking?awb=${t}`;
    default:
      return null;
  }
}

function ShippingTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-red-600 font-body font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Order Cancelled
        </p>
      </div>
    );
  }

  if (status === "return_requested") {
    return (
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-amber-600 font-body font-medium flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Return Requested — Our team will contact you shortly
        </p>
      </div>
    );
  }

  const currentIdx = STEP_ORDER.indexOf(status);

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs font-body text-muted-foreground mb-3 flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5" />
        Shipping Status
      </p>
      <div className="flex items-center gap-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === TIMELINE_STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? isCurrent
                        ? "bg-primary ring-2 ring-primary/30"
                        : "bg-primary/80"
                      : "bg-muted border-2 border-border"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <p
                  className={`text-[9px] font-body mt-1 text-center leading-tight max-w-[48px] ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : isDone
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-3 transition-all ${
                    idx < currentIdx ? "bg-primary/60" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return "Less than a minute left";
}

// Countdown hook that re-renders every minute
function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, targetMs - Date.now()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, targetMs - Date.now());
      setRemaining(r);
      if (r === 0) clearInterval(interval);
    }, 60000);
    return () => clearInterval(interval);
  }, [targetMs]);

  return remaining;
}

function ReturnCountdown({ deliveredAtMs }: { deliveredAtMs: number }) {
  const windowEnd = deliveredAtMs + RETURN_WINDOW_MS;
  const remaining = useCountdown(windowEnd);

  if (remaining <= 0) return null;

  return (
    <span className="text-xs text-amber-600 font-body font-medium flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Return window: {formatCountdown(remaining)}
    </span>
  );
}

function OrderActions({
  orderId,
  status,
  deliveredAt,
}: {
  orderId: string;
  status: string;
  deliveredAt: bigint;
}) {
  const cancelOrder = useCancelOrder();
  const requestReturn = useRequestReturn();

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("Order cancelled successfully.");
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const handleReturn = async () => {
    try {
      await requestReturn.mutateAsync(orderId);
      toast.success("Return requested! Our team will contact you shortly.");
    } catch {
      toast.error(
        "Failed to request return. The return window may have expired.",
      );
    }
  };

  // Cancel button for pending/processing orders
  if (status === "pending" || status === "processing") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-body text-xs h-7 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="w-3 h-3" />
            Cancel Order
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Cancel this order?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Are you sure you want to cancel order #{orderId.slice(0, 8)}? This
              action cannot be undone. If you paid online, refunds are processed
              within 5–7 business days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
            >
              {cancelOrder.isPending ? "Cancelling…" : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Return button for delivered orders within 24-hour window
  if (status === "delivered" && deliveredAt > 0n) {
    const deliveredAtMs = Number(deliveredAt) / 1_000_000;
    const windowEnd = deliveredAtMs + RETURN_WINDOW_MS;
    const isWithinWindow = Date.now() < windowEnd;

    if (isWithinWindow) {
      return (
        <div className="flex flex-col items-end gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 font-body text-xs h-7 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              >
                <RefreshCw className="w-3 h-3" />
                Request Return
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">
                  Request a Return?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-body">
                  You have 24 hours from delivery to request a return. Items
                  must be unused and in original packaging. Our team will
                  contact you with return instructions after you submit this
                  request.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-body">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleReturn} className="font-body">
                  {requestReturn.isPending ? "Submitting…" : "Request Return"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ReturnCountdown deliveredAtMs={deliveredAtMs} />
        </div>
      );
    }

    // Window expired
    return (
      <p className="text-xs text-muted-foreground font-body italic">
        Return window expired
      </p>
    );
  }

  return null;
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
          <h1 className="font-display text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground font-body mb-8">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>

          <div className="space-y-4">
            {orders.map((order, i) => {
              const hasTracking = !!order.trackingNumber;
              const trackingUrl = hasTracking
                ? getCarrierTrackingUrl(
                    order.shippingCarrier,
                    order.trackingNumber,
                  )
                : null;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-lg p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
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
                    <div className="flex flex-col sm:items-end gap-2">
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
                      {/* Order actions */}
                      <OrderActions
                        orderId={order.id}
                        status={order.status}
                        deliveredAt={order.deliveredAt}
                      />
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

                  {/* Tracking info */}
                  {hasTracking && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            {order.shippingCarrier && (
                              <span className="text-xs font-body font-semibold text-foreground mr-2">
                                {order.shippingCarrier}
                              </span>
                            )}
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              {order.trackingNumber}
                            </Badge>
                          </div>
                        </div>
                        {trackingUrl ? (
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 font-body text-xs h-7"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Track Shipment
                            </Button>
                          </a>
                        ) : (
                          <p className="text-xs text-muted-foreground font-body">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shipping timeline */}
                  <ShippingTimeline status={order.status} />

                  {order.paymentIntentId && (
                    <p className="text-xs text-muted-foreground font-body mt-3 pt-3 border-t border-border">
                      Payment ID:{" "}
                      <span className="font-mono">
                        {order.paymentIntentId.slice(0, 20)}…
                      </span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Return policy note */}
          <div className="mt-6 p-4 bg-muted/40 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <strong>Return Policy:</strong> You have 24 hours from delivery
                to request a return. Items must be unused and in original
                packaging.{" "}
                <Link to="/returns" className="text-primary hover:underline">
                  View full return policy →
                </Link>
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
