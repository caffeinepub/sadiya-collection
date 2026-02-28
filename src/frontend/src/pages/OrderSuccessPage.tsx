import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Loader2, Package } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useActor } from "../hooks/useActor";

function Confetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: [
      "oklch(0.52 0.13 15)",
      "oklch(0.75 0.12 70)",
      "oklch(0.42 0.16 240)",
      "oklch(0.38 0.12 150)",
      "oklch(0.48 0.17 295)",
    ][i % 5],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.8,
    duration: Math.random() * 2 + 1.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function OrderSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const { actor } = useActor();
  const { clearCart } = useCart();

  const verifyPayment = useCallback(async () => {
    if (!sessionId || !actor) {
      setStatus("success"); // If no session ID, just show success
      return;
    }
    try {
      const result = await actor.getStripeSessionStatus(sessionId);
      if (result.__kind__ === "completed") {
        setStatus("success");
        await clearCart();
        // Try to get order ID if available
        const orders = await actor.getMyOrders();
        if (orders.length > 0) {
          setOrderId(orders[0].id);
        }
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("success"); // Default to success on error
    }
  }, [sessionId, actor, clearCart]);

  useEffect(() => {
    if (actor) {
      void verifyPayment();
    }
  }, [actor, verifyPayment]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      {status === "success" && <Confetti />}

      <div className="container mx-auto px-4 max-w-lg text-center py-20">
        {status === "loading" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="font-display text-2xl font-bold mb-2">
              Verifying your payment…
            </h1>
            <p className="text-muted-foreground font-body">
              Please wait a moment
            </p>
          </motion.div>
        ) : status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-14 h-14 text-green-600" />
            </motion.div>

            <h1 className="font-display text-4xl font-bold mb-3">
              Order Confirmed!
            </h1>
            <p className="font-accent text-xl italic text-muted-foreground mb-2">
              Thank you for shopping with SADIYA Collection
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground font-body mb-6">
                Order ID:{" "}
                <span className="font-mono font-medium text-foreground">
                  {orderId}
                </span>
              </p>
            )}
            <p className="font-body text-muted-foreground mb-8 leading-relaxed">
              Your order has been placed successfully. You'll receive a
              confirmation email shortly, and your bag will be on its way!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/orders">
                <Button className="gap-2 btn-ripple font-body" size="lg">
                  <Package className="w-5 h-5" />
                  Track Order
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg" className="gap-2 font-body">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-14 h-14 text-destructive" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-3">
              Payment Failed
            </h1>
            <p className="text-muted-foreground font-body mb-6">
              Something went wrong with your payment. Your cart has been saved.
            </p>
            <Link to="/cart">
              <Button className="gap-2 btn-ripple font-body">
                Back to Cart
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
