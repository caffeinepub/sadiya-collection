import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { motion } from "motion/react";
import { useAllOrders } from "../../hooks/useQueries";

export default function AdminCustomers() {
  const { data: orders } = useAllOrders();
  const allOrders = orders || [];

  // Extract unique users from orders
  const customerMap = new Map<
    string,
    { principal: string; orderCount: number; totalSpent: bigint }
  >();
  for (const order of allOrders) {
    const key = order.user.toString();
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += order.totalAmount;
    } else {
      customerMap.set(key, {
        principal: key,
        orderCount: 1,
        totalSpent: order.totalAmount,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  const formatPrice = (paise: bigint) => {
    const rupees = Number(paise) / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(rupees);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground font-body text-sm">
          {customers.length} unique customers
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold mb-1">
            No customers yet
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            Customers will appear here when orders are placed.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                  Orders
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, i) => (
                <motion.tr
                  key={customer.principal}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {customer.principal.slice(0, 20)}…
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body text-sm">
                      {customer.orderCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display font-semibold text-sm">
                      {formatPrice(customer.totalSpent)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-xs font-body ${
                        customer.totalSpent > 100000n
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {customer.totalSpent > 100000n ? "VIP" : "Regular"}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
