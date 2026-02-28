import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../contexts/CartContext";
import { formatPrice, getDiscountedPrice } from "../data/sampleProducts";
import { useActor } from "../hooks/useActor";
import {
  useActivePaymentGateways,
  useIsStripeConfigured,
  useProducts,
} from "../hooks/useQueries";

export default function CartPage() {
  const { items, removeItem, addItem, isLoading, clearCart } = useCart();
  const { data: products } = useProducts();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const { data: activeGateways } = useActivePaymentGateways();
  const { actor } = useActor();

  const allProducts = products || [];

  const cartProducts = items
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return { item, product };
    })
    .filter((cp) => cp.product !== undefined);

  const subtotal = cartProducts.reduce((acc, { item, product }) => {
    if (!product) return acc;
    const finalPrice = getDiscountedPrice(
      product.price,
      product.discountPercent,
    );
    return acc + finalPrice * item.quantity;
  }, 0n);

  const shippingFee = subtotal >= 99900n ? 0n : 9900n; // Free shipping above ₹999
  const total = subtotal + shippingFee;

  // Payment method selection
  const stripeOption = stripeConfigured ? "stripe" : null;
  const gatewayOptions = (activeGateways || []).filter((g) => g.isActive);
  const allPaymentOptions = [
    ...(stripeOption ? [{ id: "stripe", name: "Stripe" }] : []),
    ...gatewayOptions.map((g) => ({ id: g.id, name: g.name })),
  ];

  const [selectedPayment, setSelectedPayment] = useState<string>(
    stripeOption ?? gatewayOptions[0]?.id ?? "",
  );

  const handleCheckout = async () => {
    if (!actor) {
      toast.error("Please sign in to checkout");
      return;
    }

    if (!stripeConfigured && gatewayOptions.length === 0) {
      toast.error("Payment gateway not configured. Please contact support.");
      return;
    }

    // If a manual gateway is selected, show info toast then proceed
    const isManualGateway =
      selectedPayment !== "stripe" &&
      gatewayOptions.some((g) => g.id === selectedPayment);

    if (isManualGateway) {
      const gw = gatewayOptions.find((g) => g.id === selectedPayment);
      toast.info(
        `Payment gateway selected: ${gw?.name}. Redirecting to checkout…`,
      );
    }

    if (!stripeConfigured) {
      toast.error("Stripe is not configured yet. Please contact support.");
      return;
    }

    try {
      const shoppingItems = cartProducts.map(({ item, product }) => {
        const p = product!;
        const finalPrice = getDiscountedPrice(p.price, p.discountPercent);
        return {
          productName: p.name,
          productDescription: p.description,
          currency: "inr",
          quantity: item.quantity,
          priceInCents: finalPrice,
        };
      });

      const successUrl = `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/cart`;

      toast.loading("Redirecting to payment...");
      const sessionUrl = await actor.createCheckoutSession(
        shoppingItems,
        successUrl,
        cancelUrl,
      );
      window.location.href = sessionUrl;
    } catch (err) {
      toast.dismiss();
      toast.error("Checkout failed. Please try again.");
      console.error(err);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground font-body mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/shop">
            <Button size="lg" className="gap-2 btn-ripple font-body">
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold mb-6">
            Shopping Cart
            <span className="ml-2 text-lg text-muted-foreground font-body font-normal">
              ({items.length} item{items.length !== 1 ? "s" : ""})
            </span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {cartProducts.map(({ item, product }) => {
                  if (!product) return null;
                  const finalPrice = getDiscountedPrice(
                    product.price,
                    product.discountPercent,
                  );
                  const lineTotal = finalPrice * item.quantity;

                  return (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="bg-card border border-border rounded-lg p-4 flex gap-4"
                    >
                      {/* Image */}
                      <Link
                        to="/product/$id"
                        params={{ id: product.id }}
                        className="shrink-0"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-muted">
                          <img
                            src={
                              product.imageUrls[0] ||
                              "/assets/generated/bag-handbag.dim_600x600.jpg"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link to="/product/$id" params={{ id: product.id }}>
                          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-0.5">
                            {product.category}
                          </p>
                          <h3 className="font-display font-semibold text-card-foreground text-sm line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center border border-border rounded-md">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity <= 1n) {
                                  removeItem(item.productId);
                                } else {
                                  void addItem(
                                    item.productId,
                                    item.quantity - 1n,
                                  );
                                }
                              }}
                              disabled={isLoading}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 text-sm font-body font-medium">
                              {item.quantity.toString()}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                addItem(item.productId, item.quantity + 1n)
                              }
                              disabled={isLoading}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-display font-bold text-foreground">
                              {formatPrice(lineTotal)}
                            </p>
                            {item.quantity > 1n && (
                              <p className="text-xs text-muted-foreground font-body">
                                {formatPrice(finalPrice)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        disabled={isLoading}
                        className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-2">
                <Link to="/shop">
                  <Button variant="ghost" size="sm" className="font-body gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-destructive font-body"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
                <h2 className="font-display text-lg font-bold mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span
                      className={
                        shippingFee === 0n
                          ? "text-green-600 font-medium"
                          : "font-medium"
                      }
                    >
                      {shippingFee === 0n ? "FREE" : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {shippingFee > 0n && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(99900n - subtotal)} more for free
                      shipping
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-display font-bold text-lg">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                {allPaymentOptions.length > 0 && (
                  <div className="mt-4">
                    <p className="font-body text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-primary" />
                      Select Payment Method
                    </p>
                    <div className="space-y-2">
                      {allPaymentOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                            selectedPayment === opt.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={opt.id}
                            checked={selectedPayment === opt.id}
                            onChange={() => setSelectedPayment(opt.id)}
                            className="accent-primary"
                          />
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="font-body text-sm font-medium">
                              {opt.name}
                            </span>
                          </div>
                          {selectedPayment === opt.id && (
                            <Badge className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
                              Selected
                            </Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleCheckout}
                  className="w-full mt-5 gap-2 btn-ripple font-body"
                >
                  {selectedPayment && selectedPayment !== "stripe"
                    ? `Pay with ${allPaymentOptions.find((o) => o.id === selectedPayment)?.name ?? "Gateway"}`
                    : "Proceed to Checkout"}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3 font-body">
                  {selectedPayment === "stripe" || !selectedPayment
                    ? "Secure checkout powered by Stripe"
                    : `Payment via ${allPaymentOptions.find((o) => o.id === selectedPayment)?.name ?? "selected gateway"}`}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
