import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Package } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { formatPrice } from "../../data/sampleProducts";
import {
  useAllOrders,
  useProducts,
  useUpdateOrderStatus,
} from "../../hooks/useQueries";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
