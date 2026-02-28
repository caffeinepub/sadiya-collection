import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItem,
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
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Products ───
export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ─── Orders ───
export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allOrders"] }),
  });
}

// ─── Offers ───
export function useActiveOffers() {
  const { actor, isFetching } = useActor();
  return useQuery<Offer[]>({
    queryKey: ["activeOffers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOffer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: Offer) => {
      if (!actor) throw new Error("Not connected");
      return actor.addOffer(offer);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeOffers"] }),
  });
}

export function useUpdateOffer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: Offer) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOffer(offer);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeOffers"] }),
  });
}

export function useDeleteOffer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteOffer(offerId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activeOffers"] }),
  });
}

// ─── Profile ───
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

// ─── Stripe ───
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cart,
      totalAmount,
      paymentIntentId,
    }: {
      cart: CartItem[];
      totalAmount: bigint;
      paymentIntentId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(cart, totalAmount, paymentIntentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// ─── Payment Gateways ───
export function useActivePaymentGateways() {
  const { actor, isFetching } = useActor();
  return useQuery<MaskedPaymentGateway[]>({
    queryKey: ["activePaymentGateways"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivePaymentGateways();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPaymentGateways() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentGateway[]>({
    queryKey: ["paymentGateways"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPaymentGateways();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPaymentGateway() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gateway: PaymentGateway) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPaymentGateway(gateway);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentGateways"] }),
  });
}

export function useUpdatePaymentGateway() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gateway: PaymentGateway) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePaymentGateway(gateway);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentGateways"] }),
  });
}

export function useDeletePaymentGateway() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gatewayId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deletePaymentGateway(gatewayId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["paymentGateways"] }),
  });
}

// ─── Reviews ───
export function useProductReviews(productId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductReviews(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["allReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: Review) => {
      if (!actor) throw new Error("Not connected");
      return actor.addReview(review);
    },
    onSuccess: (_data, review) => {
      qc.invalidateQueries({ queryKey: ["reviews", review.productId] });
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteReview(reviewId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allReviews"] }),
  });
}

// ─── Site Settings ───
export function useSiteSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor)
        return {
          storeName: "SADIYA Collection",
          tagline: "Your Bags Shopping Ends Here",
          brandName: "MT Industries Ltd.",
          supportEmail: "tanzebmohammad@gmail.com",
          supportPhone: "8750787355",
          managerName: "Mohammad Tanzeb",
          whatsappNumber: "8750787355",
        };
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSiteSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveSiteSettings(settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["siteSettings"] }),
  });
}

// ─── Shipping ───
export function useUpdateShippingDetails() {
  const { actor } = useActor();
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
      if (!actor) throw new Error("Not connected");
      return actor.updateShippingDetails(
        orderId,
        trackingNumber,
        shippingCarrier,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// ─── Order Actions ───
export function useCancelOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useRequestReturn() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestReturn(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

// ─── Shipping Partners (Admin) ───
export function useShippingPartners() {
  const { actor, isFetching } = useActor();
  return useQuery<ShippingPartner[]>({
    queryKey: ["shippingPartners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShippingPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddShippingPartner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partner: ShippingPartner) => {
      if (!actor) throw new Error("Not connected");
      return actor.addShippingPartner(partner);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingPartners"] });
      qc.invalidateQueries({ queryKey: ["activeShippingPartners"] });
    },
  });
}

export function useUpdateShippingPartner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partner: ShippingPartner) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateShippingPartner(partner);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingPartners"] });
      qc.invalidateQueries({ queryKey: ["activeShippingPartners"] });
    },
  });
}

export function useDeleteShippingPartner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partnerId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteShippingPartner(partnerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shippingPartners"] });
      qc.invalidateQueries({ queryKey: ["activeShippingPartners"] });
    },
  });
}

// ─── Active Shipping Partners (Public) ───
export function useActiveShippingPartners() {
  const { actor, isFetching } = useActor();
  return useQuery<MaskedShippingPartner[]>({
    queryKey: ["activeShippingPartners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveShippingPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Contact ───
export function useContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactInfo>({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      if (!actor)
        return {
          email: "tanzebmohammad@gmail.com",
          phone: "8750787355",
          address: "MT Industries Ltd.",
        };
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
  });
}
