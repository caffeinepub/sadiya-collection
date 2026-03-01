import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ContactInfo,
  MaskedPaymentGateway,
  MaskedShippingPartner,
  Offer,
  Order,
  PaymentGateway,
  Product,
  Review,
  ShippingPartner,
  SiteSettings,
} from "../backend.d";

// ─── localStorage helpers ─────────────────────────────────────────

function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Products (localStorage-based) ───────────────────────────────
const PRODUCTS_KEY = "sadiya_products";

function serializeProduct(p: Product): Record<string, unknown> {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price.toString(),
    stockQuantity: p.stockQuantity.toString(),
    discountPercent: p.discountPercent.toString(),
    createdAt: p.createdAt.toString(),
    imageUrls: p.imageUrls,
    isActive: p.isActive,
  };
}

function deserializeProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    category: raw.category as string,
    price: BigInt(raw.price as string),
    stockQuantity: BigInt(raw.stockQuantity as string),
    discountPercent: BigInt(raw.discountPercent as string),
    createdAt: BigInt(raw.createdAt as string),
    imageUrls: raw.imageUrls as string[],
    isActive: raw.isActive as boolean,
  };
}

function getLocalProducts(): Product[] {
  try {
    const raw = JSON.parse(
      localStorage.getItem(PRODUCTS_KEY) || "[]",
    ) as Record<string, unknown>[];
    return raw.map(deserializeProduct);
  } catch {
    return [];
  }
}

function saveLocalProducts(products: Product[]) {
  localStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(products.map(serializeProduct)),
  );
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => getLocalProducts(),
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      const products = getLocalProducts();
      products.push(product);
      saveLocalProducts(products);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      const products = getLocalProducts();
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        products[idx] = product;
        saveLocalProducts(products);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const products = getLocalProducts().filter((p) => p.id !== productId);
      saveLocalProducts(products);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ─── Orders (localStorage-based) ─────────────────────────────────
const ORDERS_KEY = "sadiya_orders";
const MY_ORDERS_PREFIX = "sadiya_my_orders_";

interface SerializedOrder {
  id: string;
  status: string;
  trackingNumber: string;
  deliveredAt: string;
  createdAt: string;
  user: string;
  totalAmount: string;
  items: Array<{ productId: string; quantity: string }>;
  shippingCarrier: string;
  paymentIntentId: string;
}

function serializeOrder(o: Order): SerializedOrder {
  return {
    id: o.id,
    status: o.status,
    trackingNumber: o.trackingNumber,
    deliveredAt: o.deliveredAt.toString(),
    createdAt: o.createdAt.toString(),
    user: typeof o.user === "string" ? o.user : String(o.user),
    totalAmount: o.totalAmount.toString(),
    items: o.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity.toString(),
    })),
    shippingCarrier: o.shippingCarrier,
    paymentIntentId: o.paymentIntentId,
  };
}

function deserializeOrder(raw: SerializedOrder): Order {
  return {
    id: raw.id,
    status: raw.status,
    trackingNumber: raw.trackingNumber || "",
    deliveredAt: BigInt(raw.deliveredAt || "0"),
    createdAt: BigInt(raw.createdAt || "0"),
    user: raw.user as unknown as import("../backend.d").Order["user"],
    totalAmount: BigInt(raw.totalAmount || "0"),
    items: (raw.items || []).map((i) => ({
      productId: i.productId,
      quantity: BigInt(i.quantity || "1"),
    })),
    shippingCarrier: raw.shippingCarrier || "",
    paymentIntentId: raw.paymentIntentId || "",
  };
}

function getAllLocalOrders(): Order[] {
  try {
    const raw = getLocalItem<SerializedOrder[]>(ORDERS_KEY, []);
    return raw.map(deserializeOrder);
  } catch {
    return [];
  }
}

function saveAllLocalOrders(orders: Order[]) {
  setLocalItem(ORDERS_KEY, orders.map(serializeOrder));
}

function getMyLocalOrders(userEmail: string): Order[] {
  try {
    const raw = getLocalItem<SerializedOrder[]>(
      MY_ORDERS_PREFIX + userEmail,
      [],
    );
    return raw.map(deserializeOrder);
  } catch {
    return [];
  }
}

function saveMyLocalOrders(userEmail: string, orders: Order[]) {
  setLocalItem(MY_ORDERS_PREFIX + userEmail, orders.map(serializeOrder));
}

export function useMyOrders() {
  const userEmail = getCurrentUserEmail();
  return useQuery<Order[]>({
    queryKey: ["myOrders", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return getMyLocalOrders(userEmail);
    },
    enabled: true,
  });
}

export function useAllOrders() {
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => getAllLocalOrders(),
    enabled: true,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: string }) => {
      const orders = getAllLocalOrders();
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = status;
        if (status === "delivered") {
          orders[idx].deliveredAt = BigInt(Date.now()) * 1_000_000n;
        }
        saveAllLocalOrders(orders);
        // Also update in user's personal orders
        updateOrderInUserStore(orders[idx]);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

function updateOrderInUserStore(order: Order) {
  const userKey =
    typeof order.user === "string" ? order.user : String(order.user);
  const myOrders = getMyLocalOrders(userKey);
  const idx = myOrders.findIndex((o) => o.id === order.id);
  if (idx !== -1) {
    myOrders[idx] = order;
    saveMyLocalOrders(userKey, myOrders);
  }
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userEmail,
      cart,
      totalAmount,
      paymentIntentId,
      gatewayName,
    }: {
      userEmail: string;
      cart: Array<{ productId: string; quantity: bigint }>;
      totalAmount: bigint;
      paymentIntentId: string;
      gatewayName?: string;
    }) => {
      const order: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: "pending",
        trackingNumber: "",
        deliveredAt: 0n,
        createdAt: BigInt(Date.now()) * 1_000_000n,
        user: userEmail as unknown as Order["user"],
        totalAmount,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingCarrier: "",
        paymentIntentId: gatewayName
          ? `gateway:${gatewayName}:${paymentIntentId}`
          : paymentIntentId,
      };
      // Save in all-orders (admin view)
      const allOrders = getAllLocalOrders();
      allOrders.unshift(order);
      saveAllLocalOrders(allOrders);
      // Save in user's personal orders
      const myOrders = getMyLocalOrders(userEmail);
      myOrders.unshift(order);
      saveMyLocalOrders(userEmail, myOrders);
      return order;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["myOrders", vars.userEmail] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ─── Offers (localStorage-based) ─────────────────────────────────
const OFFERS_KEY = "sadiya_offers";

function getLocalOffers(): Offer[] {
  return getLocalItem<Offer[]>(OFFERS_KEY, []);
}

function saveLocalOffers(offers: Offer[]) {
  setLocalItem(OFFERS_KEY, offers);
}

export function useActiveOffers() {
  return useQuery<Offer[]>({
    queryKey: ["activeOffers"],
    queryFn: async () => getLocalOffers().filter((o) => o.isActive !== false),
    enabled: true,
  });
}

export function useAddOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: Offer) => {
      const offers = getLocalOffers();
      offers.push(offer);
      saveLocalOffers(offers);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeOffers"] }),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: Offer) => {
      const offers = getLocalOffers();
      const idx = offers.findIndex((o) => o.id === offer.id);
      if (idx !== -1) {
        offers[idx] = offer;
        saveLocalOffers(offers);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeOffers"] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      const offers = getLocalOffers().filter((o) => o.id !== offerId);
      saveLocalOffers(offers);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeOffers"] }),
  });
}

// ─── Reviews (localStorage-based) ────────────────────────────────
const REVIEWS_KEY = "sadiya_reviews";

interface SerializedReview {
  id: string;
  userName: string;
  userId: string;
  createdAt: string;
  productId: string;
  comment: string;
  rating: string;
}

function serializeReview(r: Review): SerializedReview {
  return {
    id: r.id,
    userName: r.userName,
    userId: typeof r.userId === "string" ? r.userId : String(r.userId),
    createdAt: r.createdAt.toString(),
    productId: r.productId,
    comment: r.comment,
    rating: r.rating.toString(),
  };
}

function deserializeReview(raw: SerializedReview): Review {
  return {
    id: raw.id,
    userName: raw.userName,
    userId: raw.userId as unknown as Review["userId"],
    createdAt: BigInt(raw.createdAt || "0"),
    productId: raw.productId,
    comment: raw.comment,
    rating: BigInt(raw.rating || "5"),
  };
}

function getAllLocalReviews(): Review[] {
  try {
    const raw = getLocalItem<SerializedReview[]>(REVIEWS_KEY, []);
    return raw.map(deserializeReview);
  } catch {
    return [];
  }
}

function saveAllLocalReviews(reviews: Review[]) {
  setLocalItem(REVIEWS_KEY, reviews.map(serializeReview));
}

export function useProductReviews(productId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      return getAllLocalReviews().filter((r) => r.productId === productId);
    },
    enabled: !!productId,
  });
}

export function useAllReviews() {
  return useQuery<Review[]>({
    queryKey: ["allReviews"],
    queryFn: async () => getAllLocalReviews(),
    enabled: true,
  });
}

export function useAddReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: Review) => {
      const reviews = getAllLocalReviews();
      reviews.push(review);
      saveAllLocalReviews(reviews);
    },
    onSuccess: (_data, review) => {
      qc.invalidateQueries({ queryKey: ["reviews", review.productId] });
      qc.invalidateQueries({ queryKey: ["allReviews"] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const reviews = getAllLocalReviews().filter((r) => r.id !== reviewId);
      saveAllLocalReviews(reviews);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allReviews"] }),
  });
}

// ─── Cancel/Return Order ──────────────────────────────────────────

export function useCancelOrder() {
  const qc = useQueryClient();
  const userEmail = getCurrentUserEmail();
  return useMutation({
    mutationFn: async (orderId: string) => {
      // Update all-orders
      const allOrders = getAllLocalOrders();
      const idx = allOrders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        allOrders[idx].status = "cancelled";
        saveAllLocalOrders(allOrders);
      }
      // Update user orders
      if (userEmail) {
        const myOrders = getMyLocalOrders(userEmail);
        const mIdx = myOrders.findIndex((o) => o.id === orderId);
        if (mIdx !== -1) {
          myOrders[mIdx].status = "cancelled";
          saveMyLocalOrders(userEmail, myOrders);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders", userEmail] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useRequestReturn() {
  const qc = useQueryClient();
  const userEmail = getCurrentUserEmail();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const allOrders = getAllLocalOrders();
      const idx = allOrders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        allOrders[idx].status = "return_requested";
        saveAllLocalOrders(allOrders);
      }
      if (userEmail) {
        const myOrders = getMyLocalOrders(userEmail);
        const mIdx = myOrders.findIndex((o) => o.id === orderId);
        if (mIdx !== -1) {
          myOrders[mIdx].status = "return_requested";
          saveMyLocalOrders(userEmail, myOrders);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders", userEmail] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ─── Update Shipping Details ──────────────────────────────────────
export function useUpdateShippingDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      trackingNumber,
      shippingCarrier,
    }: {
      orderId: string;
      trackingNumber: string;
      shippingCarrier: string;
    }) => {
      const allOrders = getAllLocalOrders();
      const idx = allOrders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        allOrders[idx].trackingNumber = trackingNumber;
        allOrders[idx].shippingCarrier = shippingCarrier;
        saveAllLocalOrders(allOrders);
        updateOrderInUserStore(allOrders[idx]);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ─── Payment Gateways (localStorage-based) ───────────────────────
const GATEWAYS_KEY = "sadiya_payment_gateways";

function getLocalGateways(): PaymentGateway[] {
  try {
    return JSON.parse(
      localStorage.getItem(GATEWAYS_KEY) || "[]",
    ) as PaymentGateway[];
  } catch {
    return [];
  }
}

function saveLocalGateways(gateways: PaymentGateway[]) {
  localStorage.setItem(GATEWAYS_KEY, JSON.stringify(gateways));
}

export function useActivePaymentGateways() {
  return useQuery<MaskedPaymentGateway[]>({
    queryKey: ["activePaymentGateways"],
    queryFn: async () => {
      const gateways = getLocalGateways();
      return gateways
        .filter((g) => g.isActive)
        .map((g) => ({
          id: g.id,
          name: g.name,
          isActive: g.isActive,
          maskedApiKey: g.apiKey ? `${g.apiKey.slice(0, 8)}••••` : "••••••••",
          maskedSecretKey: "••••",
        }));
    },
  });
}

export function useAllPaymentGateways() {
  return useQuery<PaymentGateway[]>({
    queryKey: ["paymentGateways"],
    queryFn: async () => getLocalGateways(),
  });
}

export function useAddPaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gateway: PaymentGateway) => {
      const gateways = getLocalGateways();
      gateways.push(gateway);
      saveLocalGateways(gateways);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paymentGateways"] });
      qc.invalidateQueries({ queryKey: ["activePaymentGateways"] });
    },
  });
}

export function useUpdatePaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gateway: PaymentGateway) => {
      const gateways = getLocalGateways();
      const idx = gateways.findIndex((g) => g.id === gateway.id);
      if (idx !== -1) {
        gateways[idx] = gateway;
        saveLocalGateways(gateways);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paymentGateways"] });
      qc.invalidateQueries({ queryKey: ["activePaymentGateways"] });
    },
  });
}

export function useDeletePaymentGateway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gatewayId: string) => {
      const gateways = getLocalGateways().filter((g) => g.id !== gatewayId);
      saveLocalGateways(gateways);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paymentGateways"] });
      qc.invalidateQueries({ queryKey: ["activePaymentGateways"] });
    },
  });
}

// ─── Site Settings (localStorage-based) ──────────────────────────
const SITE_SETTINGS_KEY = "sadiya_site_settings";

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: "SADIYA Collection",
  tagline: "Your Bags Shopping Ends Here",
  brandName: "MT Industries Ltd.",
  supportEmail: "tanzebmohammad@gmail.com",
  supportPhone: "8750787355",
  managerName: "Mohammad Tanzeb",
  whatsappNumber: "8750787355",
};

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      return getLocalItem<SiteSettings>(SITE_SETTINGS_KEY, DEFAULT_SETTINGS);
    },
    enabled: true,
  });
}

export function useSaveSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      setLocalItem(SITE_SETTINGS_KEY, settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["siteSettings"] }),
  });
}

// ─── Shipping Partners (localStorage-based) ───────────────────────
const SHIPPING_PARTNERS_KEY = "sadiya_shipping_partners";

function getLocalShippingPartners(): ShippingPartner[] {
  return getLocalItem<ShippingPartner[]>(SHIPPING_PARTNERS_KEY, []);
}

function saveLocalShippingPartners(partners: ShippingPartner[]) {
  setLocalItem(SHIPPING_PARTNERS_KEY, partners);
}

export function useShippingPartners() {
  return useQuery<ShippingPartner[]>({
    queryKey: ["shippingPartners"],
    queryFn: async () => getLocalShippingPartners(),
    enabled: true,
  });
}

export function useAddShippingPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partner: ShippingPartner) => {
      const partners = getLocalShippingPartners();
      partners.push(partner);
      saveLocalShippingPartners(partners);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingPartners"] });
      qc.invalidateQueries({ queryKey: ["activeShippingPartners"] });
    },
  });
}

export function useUpdateShippingPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partner: ShippingPartner) => {
      const partners = getLocalShippingPartners();
      const idx = partners.findIndex((p) => p.id === partner.id);
      if (idx !== -1) {
        partners[idx] = partner;
        saveLocalShippingPartners(partners);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingPartners"] });
      qc.invalidateQueries({ queryKey: ["activeShippingPartners"] });
    },
  });
}

export function useDeleteShippingPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partnerId: string) => {
      const partners = getLocalShippingPartners().filter(
        (p) => p.id !== partnerId,
      );
      saveLocalShippingPartners(partners);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingPartners"] });
      qc.invalidateQueries({ queryKey: ["activeShippingPartners"] });
    },
  });
}

export function useActiveShippingPartners() {
  return useQuery<MaskedShippingPartner[]>({
    queryKey: ["activeShippingPartners"],
    queryFn: async () => {
      return getLocalShippingPartners()
        .filter((p) => p.isActive)
        .map((p) => ({
          id: p.id,
          name: p.name,
          isActive: p.isActive,
          logoUrl: p.logoUrl || "",
          trackingUrlTemplate: p.trackingUrlTemplate || "",
        }));
    },
    enabled: true,
  });
}

// ─── Contact Info ─────────────────────────────────────────────────
export function useContactInfo() {
  return useQuery<ContactInfo>({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      return {
        email: "tanzebmohammad@gmail.com",
        phone: "8750787355",
        address: "MT Industries Ltd.",
      };
    },
    enabled: true,
  });
}

// ─── Profile (stubbed — unused with email auth) ───────────────────
export function useIsAdmin() {
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => false,
    enabled: false,
  });
}

// ─── Stripe (stubbed — use manual gateways instead) ──────────────
export function useIsStripeConfigured() {
  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => false,
    enabled: true,
  });
}

// ─── User Profile (localStorage-based) ───────────────────────────
const PROFILE_PREFIX = "sadiya_profile_";

interface LocalProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function useUserProfile() {
  const userEmail = getCurrentUserEmail();
  return useQuery<LocalProfile | null>({
    queryKey: ["userProfile", userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      return getLocalItem<LocalProfile | null>(
        PROFILE_PREFIX + userEmail,
        null,
      );
    },
    enabled: !!userEmail,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  const userEmail = getCurrentUserEmail();
  return useMutation({
    mutationFn: async (profile: LocalProfile) => {
      if (!userEmail) throw new Error("Not logged in");
      setLocalItem(PROFILE_PREFIX + userEmail, profile);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["userProfile", userEmail] }),
  });
}

// ─── Helper: get current user email from session ─────────────────
function getCurrentUserEmail(): string | null {
  try {
    const SESSION_KEY = "sadiya_session";
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { email: string; isAdmin?: boolean };
    if (session.isAdmin) return null; // Admin doesn't have a cart/orders
    return session.email || null;
  } catch {
    return null;
  }
}
