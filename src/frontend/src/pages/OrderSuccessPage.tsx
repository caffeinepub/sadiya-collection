import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Package } from "lucide-react";
import { motion } from "motion/react";

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
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Confetti />

      <div className="container mx-auto px-4 max-w-lg text-center py-20">
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
          <p className="font-body text-muted-foreground mb-8 leading-relaxed">
            Your order has been placed successfully. You can track it from My
            Orders.
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
      </div>
    </main>
  );
}
