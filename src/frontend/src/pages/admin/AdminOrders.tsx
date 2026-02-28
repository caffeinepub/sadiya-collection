import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MapPin,
  Package,
  Save,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "../../data/sampleProducts";
import {
  useAllOrders,
  useProducts,
  useUpdateOrderStatus,
  useUpdateShippingDetails,
} from "../../hooks/useQueries";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const CARRIERS = [
  "DHL",
  "FedEx",
  "BlueDart",
  "DTDC",
  "India Post",
  "Delhivery",
  "Ekart",
  "Xpressbees",
  "Other",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ShippingEditor({
  orderId,
  currentCarrier,
  currentTracking,
}: {
  orderId: string;
  currentCarrier: string;
  currentTracking: string;
}) {
  const updateShipping = useUpdateShippingDetails();
  const [carrier, setCarrier] = useState(currentCarrier || "");
  const [tracking, setTracking] = useState(currentTracking || "");
  const [open, setOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier) {
      toast.error("Please select a carrier");
      return;
    }
    if (!tracking.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }
    try {
      await updateShipping.mutateAsync({
        orderId,
        trackingNumber: tracking.trim(),
        shippingCarrier: carrier,
      });
      toast.success("Shipping details updated!");
      setOpen(false);
    } catch {
      toast.error("Failed to update shipping details");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      {/* Show current tracking info */}
      {currentTracking && (
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-body text-muted-foreground">
            {currentCarrier && (
              <span className="font-medium text-foreground">
                {currentCarrier}
              </span>
            )}
            {currentCarrier && " · "}
            <span className="font-mono">{currentTracking}</span>
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline font-body"
      >
        <MapPin className="w-3.5 h-3.5" />
        {open ? "Hide" : currentTracking ? "Update Shipping" : "Add Tracking"}
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            key="shipping-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSave}
            className="mt-3 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-xs mb-1 block">Carrier</Label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="font-body text-xs h-8">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="font-body text-xs"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-xs mb-1 block">
                  Tracking Number
                </Label>
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="font-mono text-xs h-8"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={updateShipping.isPending}
              className="gap-2 font-body text-xs h-8"
            >
              {updateShipping.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {updateShipping.isPending ? "Saving…" : "Save Tracking"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrders() {
  const { data: orders } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const { data: products } = useProducts();

  const allOrders = orders || [];
  const allProducts = products || [];

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success(`Order status updated to ${status}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground font-body text-sm">
          {allOrders.length} total orders
        </p>
      </div>

      {allOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold mb-1">
            No orders yet
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            Orders will appear here when customers make purchases.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body font-semibold text-sm">
                      Order #{order.id.slice(0, 10)}…
                    </p>
                    <Badge
                      className={`text-xs font-body ${
                        STATUS_COLORS[order.status] ||
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-body mb-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    User: {order.user.toString().slice(0, 20)}…
                  </p>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => {
                      const product = allProducts.find(
                        (p) => p.id === item.productId,
                      );
                      return (
                        <span
                          key={item.productId}
                          className="text-xs bg-muted px-2 py-0.5 rounded font-body"
                        >
                          {product?.name || item.productId.slice(0, 8)} ×
                          {item.quantity.toString()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-display font-bold">
                      {formatPrice(order.totalAmount)}
                    </p>
                    {order.paymentIntentId && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {order.paymentIntentId.slice(0, 12)}…
                      </p>
                    )}
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(v) => handleStatusChange(order.id, v)}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-40 font-body text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="font-body text-xs"
                        >
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Shipping details editor */}
              <ShippingEditor
                orderId={order.id}
                currentCarrier={order.shippingCarrier || ""}
                currentTracking={order.trackingNumber || ""}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
