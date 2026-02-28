import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CartItem,
  ContactInfo,
  Offer,
  Order,
  Product,
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
