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
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
// Pages
import HomePage from "./pages/HomePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import PrivacyPage from "./pages/PrivacyPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import ShopPage from "./pages/ShopPage";
import TermsPage from "./pages/TermsPage";

import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminTrends from "./pages/admin/AdminTrends";

// Root layout — wraps ALL routes (provides AuthProvider, ThemeProvider, CartProvider, Toaster)
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  ),
});

// Store layout — header + footer wrapper for public/customer pages
const storeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "store",
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  ),
});

// Main routes — all under store layout
const indexRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/",
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/shop",
  component: ShopPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/product/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/cart",
  component: CartPage,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/order-success",
  component: OrderSuccessPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/orders",
  component: OrdersPage,
});

const profileRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const contactRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const termsRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/terms",
  component: TermsPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/privacy",
  component: PrivacyPage,
});

const returnsRoute = createRoute({
  getParentRoute: () => storeLayoutRoute,
  path: "/returns",
  component: ReturnPolicyPage,
});

// Admin routes — directly under rootRoute (NO header/footer from store layout)
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

const adminTrendsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/trends",
  component: AdminTrends,
});

const adminReviewsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/reviews",
  component: AdminReviews,
});

const adminShippingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/shipping",
  component: AdminShipping,
});

const routeTree = rootRoute.addChildren([
  storeLayoutRoute.addChildren([
    indexRoute,
    shopRoute,
    productDetailRoute,
    cartRoute,
    orderSuccessRoute,
    ordersRoute,
    profileRoute,
    contactRoute,
    termsRoute,
    privacyRoute,
    returnsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminCustomersRoute,
    adminOffersRoute,
    adminSettingsRoute,
    adminTrendsRoute,
    adminReviewsRoute,
    adminShippingRoute,
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
