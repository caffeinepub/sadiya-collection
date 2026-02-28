import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import {
  useAddPaymentGateway,
  useAllPaymentGateways,
  useDeletePaymentGateway,
  useIsStripeConfigured,
} from "../../hooks/useQueries";

export default function AdminSettings() {
  const { data: stripeConfigured } = useIsStripeConfigured();
  const { data: gateways, isLoading: gatewaysLoading } =
    useAllPaymentGateways();
  const addGateway = useAddPaymentGateway();
  const deleteGateway = useDeletePaymentGateway();
  const { actor } = useActor();

  // Stripe state
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("IN,US,GB,AU,CA");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  // New gateway form state
  const [gwName, setGwName] = useState("");
  const [gwApiKey, setGwApiKey] = useState("");
  const [gwSecretKey, setGwSecretKey] = useState("");
  const [gwActive, setGwActive] = useState(true);
  const [showGwApiKey, setShowGwApiKey] = useState(false);
  const [showGwSecretKey, setShowGwSecretKey] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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

  const handleAddGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwName.trim()) {
      toast.error("Gateway name is required");
      return;
    }
    if (!gwApiKey.trim()) {
      toast.error("API key is required");
      return;
    }
    try {
      await addGateway.mutateAsync({
        id: `gateway-${Date.now()}`,
        name: gwName.trim(),
        apiKey: gwApiKey.trim(),
        secretKey: gwSecretKey.trim(),
        isActive: gwActive,
      });
      toast.success(`${gwName} gateway added!`);
      setGwName("");
      setGwApiKey("");
      setGwSecretKey("");
      setGwActive(true);
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add payment gateway");
    }
  };

  const handleDeleteGateway = async (gatewayId: string, name: string) => {
    try {
      await deleteGateway.mutateAsync(gatewayId);
      toast.success(`${name} removed`);
    } catch {
      toast.error("Failed to delete gateway");
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
        {/* ── Manual Payment Gateways ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Manual Payment Gateways
              </h2>
            </div>
            <Badge variant="outline" className="text-xs font-body">
              {gateways?.length ?? 0} configured
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground font-body mb-4">
            Add payment gateways like Razorpay, PayTM, PayU, or any custom
            provider. The gateway name will appear as a payment option at
            checkout.
          </p>

          {/* Gateway list */}
          {gatewaysLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading gateways…
            </div>
          ) : gateways && gateways.length > 0 ? (
            <div className="space-y-2 mb-4">
              {gateways.map((gw) => (
                <div
                  key={gw.id}
                  className="flex items-center justify-between p-3 bg-muted/40 rounded-md border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div>
                      <p className="font-body text-sm font-medium">{gw.name}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                        Key:{" "}
                        {gw.apiKey
                          ? `${gw.apiKey.slice(0, 8)}••••`
                          : "••••••••"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`text-xs font-body ${
                        gw.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {gw.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        "Inactive"
                      )}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Remove Gateway?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-body">
                            This will remove "{gw.name}" from your payment
                            options. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-body">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGateway(gw.id, gw.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground font-body py-2 mb-4">
              No payment gateways configured yet.
            </div>
          )}

          {/* Add new gateway form toggle */}
          {!showAddForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-2 font-body text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Gateway
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border border-border rounded-md p-4 bg-muted/20"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-body font-semibold text-sm">
                  New Payment Gateway
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddGateway} className="space-y-3">
                <div>
                  <Label className="font-body text-xs">Gateway Name *</Label>
                  <Input
                    value={gwName}
                    onChange={(e) => setGwName(e.target.value)}
                    placeholder="e.g. Razorpay, PayTM, PayU"
                    className="mt-1 font-body text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">API Key *</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showGwApiKey ? "text" : "password"}
                      value={gwApiKey}
                      onChange={(e) => setGwApiKey(e.target.value)}
                      placeholder="Your API key"
                      className="font-mono text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowGwApiKey((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showGwApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="font-body text-xs">
                    Secret Key{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type={showGwSecretKey ? "text" : "password"}
                      value={gwSecretKey}
                      onChange={(e) => setGwSecretKey(e.target.value)}
                      placeholder="Your secret key"
                      className="font-mono text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGwSecretKey((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showGwSecretKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={gwActive}
                    onCheckedChange={setGwActive}
                    id="gw-active"
                  />
                  <Label
                    htmlFor="gw-active"
                    className="font-body text-xs cursor-pointer"
                  >
                    Active (show at checkout)
                  </Label>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 font-body text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addGateway.isPending}
                    className="flex-1 gap-2 font-body text-sm btn-ripple"
                  >
                    {addGateway.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {addGateway.isPending ? "Adding…" : "Add Gateway"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>

        {/* ── Stripe Configuration ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
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
