import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  addItem: (productId: string, quantity?: bigint) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  refetch: () => Promise<void>;
  justAdded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!actor || !identity) return;
    try {
      const cart = await actor.getMyCart();
      setItems(cart);
    } catch {
      // silently fail for guests
    }
  }, [actor, identity]);

  useEffect(() => {
    if (actor && !isFetching && identity) {
      void fetchCart();
    }
  }, [actor, isFetching, identity, fetchCart]);

  const addItem = useCallback(
    async (productId: string, quantity = 1n) => {
      if (!actor) return;
      setIsLoading(true);
      try {
        await actor.addToCart({ productId, quantity });
        await fetchCart();
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 600);
      } finally {
        setIsLoading(false);
      }
    },
    [actor, fetchCart],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!actor) return;
      setIsLoading(true);
      try {
        await actor.removeFromCart(productId);
        await fetchCart();
      } finally {
        setIsLoading(false);
      }
    },
    [actor, fetchCart],
  );

  const clearCart = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      await actor.clearCart();
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const totalItems = items.reduce(
    (acc, item) => acc + Number(item.quantity),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addItem,
        removeItem,
        clearCart,
        isLoading,
        refetch: fetchCart,
        justAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
