import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Tag, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { SAMPLE_PRODUCTS, formatPrice } from "../../data/sampleProducts";
import {
  useActiveOffers,
  useAllOrders,
  useProducts,
} from "../../hooks/useQueries";

export default function AdminDashboard() {
  const { data: products } = useProducts();
  const { data: orders } = useAllOrders();
  const { data: offers } = useActiveOffers();

  const allProducts = products || SAMPLE_PRODUCTS;
  const allOrders = orders || [];
  const activeOffers = offers || [];

  const totalRevenue = allOrders.reduce((acc, o) => acc + o.totalAmount, 0n);
  const activeProducts = allProducts.filter((p) => p.isActive).length;
  const pendingOrders = allOrders.filter(
    (o) => o.status === "processing",
  ).length;

  const stats = [
    {
      title: "Total Products",
      value: allProducts.length,
      icon: ShoppingBag,
      sub: `${activeProducts} active`,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Total Orders",
      value: allOrders.length,
      icon: Package,
      sub: `${pendingOrders} processing`,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Offers",
      value: activeOffers.filter((o) => o.isActive).length,
      icon: Tag,
      sub: `${activeOffers.length} total`,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      sub: "All time",
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground font-body text-sm">
          Welcome back to SADIYA Collection Admin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ title, value, icon: Icon, sub, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allOrders.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm">
                No orders yet
              </p>
            ) : (
              <div className="space-y-2">
                {allOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-body text-sm font-medium">
                        #{order.id.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-semibold text-sm">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span
                        className={`text-xs font-body px-1.5 py-0.5 rounded ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 py-1.5"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={
                        product.imageUrls[0] ||
                        "/assets/generated/bag-handbag.dim_600x600.jpg"
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {product.category}
                    </p>
                  </div>
                  <p className="font-display font-semibold text-sm shrink-0">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
