import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Settings,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { useIsStripeConfigured } from "../../hooks/useQueries";

export default function AdminSettings() {
  const { data: stripeConfigured } = useIsStripeConfigured();
  const { actor } = useActor();

  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN,US,GB,AU,CA");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    if (!secretKey.trim()) {
      toast.error("Stripe secret key is required");
      return;
    }
    setSaving(true);
    try {
      await actor.setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries: countries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      });
      toast.success("Stripe configuration saved!");
      setSecretKey("");
    } catch {
      toast.error("Failed to save Stripe configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground font-body text-sm">
          Configure payment and store settings
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Stripe Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Stripe Payment Gateway
              </h2>
            </div>
            <Badge
              className={`text-xs font-body ${
                stripeConfigured
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {stripeConfigured ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configured
                </>
              ) : (
                "Not Configured"
              )}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground font-body mb-4">
            Configure your Stripe secret key to enable payment processing. Get
            your keys from the{" "}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Stripe Dashboard
            </a>
            .
          </p>

          <form onSubmit={handleSaveStripe} className="space-y-4">
            <div>
              <Label className="font-body text-sm">Stripe Secret Key *</Label>
              <div className="relative mt-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_live_... or sk_test_..."
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Use test keys for development, live keys for production.
              </p>
            </div>

            <div>
              <Label className="font-body text-sm">
                Allowed Countries (comma-separated)
              </Label>
              <Input
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="IN,US,GB,AU,CA"
                className="mt-1 font-mono text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="gap-2 btn-ripple font-body"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving…" : "Save Stripe Configuration"}
            </Button>
          </form>
        </motion.div>

        {/* Store Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              Store Information
            </h2>
          </div>
          <div className="space-y-3 text-sm font-body text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-semibold text-foreground w-32">
                Store Name:
              </span>
              <span>SADIYA Collection</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground w-32">Brand:</span>
              <span>MT Industries Ltd.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground w-32">
                Support:
              </span>
              <span>tanzebmohammad@gmail.com</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground w-32">Phone:</span>
              <span>8750787355</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground w-32">
                Manager:
              </span>
              <span>Mohammad Tanzeb</span>
            </div>
          </div>
        </motion.div>

        {/* AI Trademark Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              AI Trademark Check
            </h2>
          </div>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            When you upload product images in the Products section, the system
            automatically runs an AI-powered trademark analysis. The AI checks
            for registered logos, brand marks, and potential trademark
            violations. Results are shown as badges on each product row.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-green-100 text-green-700 text-xs font-body">
              <CheckCircle className="w-3 h-3 mr-1" />
              Safe — No trademark issues
            </Badge>
            <Badge className="bg-red-100 text-red-700 text-xs font-body">
              ⚠️ Warning — Potential issue
            </Badge>
            <Badge variant="outline" className="text-xs font-body">
              Shield — Manual check needed
            </Badge>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
