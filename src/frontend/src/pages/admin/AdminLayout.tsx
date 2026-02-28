import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/offers", label: "Offers", icon: Tag },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const { identity, login, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      void navigate({ to: "/" });
    }
  }, [isAdmin, isLoading, navigate]);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground font-body mb-6">
            Please sign in with admin credentials
          </p>
          <Button onClick={login} className="btn-ripple font-body">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const isActive = (to: string, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-sidebar-foreground leading-none">
                SADIYA
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 font-body leading-none tracking-wider">
                Admin
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <Link key={to} to={to}>
                <div
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-body font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-sidebar-primary/10 text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator />
        <div className="p-3">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 font-body text-xs"
            >
              ← Back to Store
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="w-full justify-start gap-2 font-body text-xs text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        <div className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
