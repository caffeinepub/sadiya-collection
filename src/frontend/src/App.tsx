import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
// Pages
import HomePage from "./pages/HomePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";

import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSettings from "./pages/admin/AdminSettings";

// Root layout with header and footer
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
        <Toaster richColors position="top-right" />
      </CartProvider>
    </ThemeProvider>
  ),
});

// Main routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-success",
  component: OrderSuccessPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

// Admin routes — uses AdminLayout which has its own sidebar
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminDashboard,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/products",
  component: AdminProducts,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  component: AdminOrders,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/customers",
  component: AdminCustomers,
});

const adminOffersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/offers",
  component: AdminOffers,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: AdminSettings,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopRoute,
  productDetailRoute,
  cartRoute,
  orderSuccessRoute,
  ordersRoute,
  profileRoute,
  contactRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminCustomersRoute,
    adminOffersRoute,
    adminSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
