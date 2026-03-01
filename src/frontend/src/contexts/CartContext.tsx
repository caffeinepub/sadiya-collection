import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

export interface LocalCartItem {
  productId: string;
  quantity: bigint;
}

interface CartContextType {
  items: LocalCartItem[];
  totalItems: number;
  addItem: (productId: string, quantity?: bigint) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  refetch: () => Promise<void>;
  justAdded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_PREFIX = "sadiya_cart_";

function getCartKey(email: string): string {
  return `${CART_PREFIX}${email}`;
}

function serializeCart(items: LocalCartItem[]): string {
  return JSON.stringify(
    items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity.toString(),
    })),
  );
}

function deserializeCart(raw: string): LocalCartItem[] {
  try {
    const parsed = JSON.parse(raw) as Array<{
      productId: string;
      quantity: string;
    }>;
    return parsed.map((i) => ({
      productId: i.productId,
      quantity: BigInt(i.quantity),
    }));
  } catch {
    return [];
  }
}

function loadCart(email: string): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(getCartKey(email));
    if (!raw) return [];
    return deserializeCart(raw);
  } catch {
    return [];
  }
}

function saveCart(email: string, items: LocalCartItem[]) {
  localStorage.setItem(getCartKey(email), serializeCart(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Load cart whenever the logged-in user changes
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      const loaded = loadCart(currentUser.email);
      setItems(loaded);
    } else {
      setItems([]);
    }
  }, [currentUser]);

  const fetchCart = useCallback(async () => {
    if (!currentUser || currentUser.isAdmin) {
      setItems([]);
      return;
    }
    const loaded = loadCart(currentUser.email);
    setItems(loaded);
  }, [currentUser]);

  const addItem = useCallback(
    async (productId: string, quantity = 1n) => {
      if (!currentUser || currentUser.isAdmin) return;
      setIsLoading(true);
      try {
        const current = loadCart(currentUser.email);
        const existingIdx = current.findIndex((i) => i.productId === productId);

        let updated: LocalCartItem[];
        if (existingIdx !== -1) {
          // Replace quantity (not accumulate) if quantity passed in, else add 1
          updated = current.map((item, idx) =>
            idx === existingIdx
              ? {
                  ...item,
                  quantity: quantity === 1n ? item.quantity + 1n : quantity,
                }
              : item,
          );
        } else {
          updated = [...current, { productId, quantity }];
        }

        saveCart(currentUser.email, updated);
        setItems(updated);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 600);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!currentUser || currentUser.isAdmin) return;
      setIsLoading(true);
      try {
        const updated = loadCart(currentUser.email).filter(
          (i) => i.productId !== productId,
        );
        saveCart(currentUser.email, updated);
        setItems(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser],
  );

  const clearCart = useCallback(async () => {
    if (!currentUser || currentUser.isAdmin) return;
    setIsLoading(true);
    try {
      saveCart(currentUser.email, []);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

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
