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
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Plus,
  Save,
  Trash2,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ShippingPartner } from "../../backend.d";
import {
  useAddShippingPartner,
  useDeleteShippingPartner,
  useShippingPartners,
  useUpdateShippingPartner,
} from "../../hooks/useQueries";

const QUICK_ADD_CARRIERS = [
  {
    name: "DHL Express",
    trackingUrlTemplate:
      "https://www.dhl.com/in-en/home/tracking.html?tracking-id={trackingNumber}",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Express_logo_2014.svg/200px-DHL_Express_logo_2014.svg.png",
  },
  {
    name: "FedEx",
    trackingUrlTemplate:
      "https://www.fedex.com/apps/fedextrack/?tracknumbers={trackingNumber}",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/FedEx_Corporation_-_2016_Logo.svg/200px-FedEx_Corporation_-_2016_Logo.svg.png",
  },
  {
    name: "BlueDart",
    trackingUrlTemplate:
      "https://www.bluedart.com/tracking?trackFor=0&track={trackingNumber}",
    logoUrl: "",
  },
  {
    name: "DTDC",
    trackingUrlTemplate:
      "https://www.dtdc.in/tracking/shipment-detail?AWB={trackingNumber}",
    logoUrl: "",
  },
  {
    name: "Delhivery",
    trackingUrlTemplate:
      "https://www.delhivery.com/track/package/{trackingNumber}",
    logoUrl: "",
  },
  {
    name: "Ekart",
    trackingUrlTemplate:
      "https://ekartlogistics.com/shipmenttrack/{trackingNumber}",
    logoUrl: "",
  },
  {
    name: "Xpressbees",
    trackingUrlTemplate:
      "https://www.xpressbees.com/shipment/tracking?awb={trackingNumber}",
    logoUrl: "",
  },
  {
    name: "India Post",
    trackingUrlTemplate:
      "https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx",
    logoUrl: "",
  },
];

interface PartnerFormData {
  name: string;
  trackingUrlTemplate: string;
  apiKey: string;
  logoUrl: string;
  isActive: boolean;
}

const EMPTY_FORM: PartnerFormData = {
  name: "",
  trackingUrlTemplate: "",
  apiKey: "",
  logoUrl: "",
  isActive: true,
};

function PartnerForm({
  initial,
  onSave,
  onCancel,
  isPending,
  title,
}: {
  initial: PartnerFormData;
  onSave: (data: PartnerFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  title: string;
}) {
  const [form, setForm] = useState<PartnerFormData>(initial);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleQuickAdd = (carrier: (typeof QUICK_ADD_CARRIERS)[0]) => {
    setForm((f) => ({
      ...f,
      name: carrier.name,
      trackingUrlTemplate: carrier.trackingUrlTemplate,
      logoUrl: carrier.logoUrl,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Partner name is required");
      return;
    }
    if (!form.trackingUrlTemplate.trim()) {
      toast.error("Tracking URL template is required");
      return;
    }
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-border rounded-lg p-5 bg-muted/20"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-display font-semibold text-sm">{title}</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick-add suggestions */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground font-body mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Quick Add — click to fill form
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ADD_CARRIERS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleQuickAdd(c)}
              className="px-2.5 py-1 text-xs font-body bg-background border border-border rounded-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="font-body text-xs">
              Partner Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. DHL Express"
              className="mt-1 font-body text-sm"
              required
            />
          </div>
          <div>
            <Label className="font-body text-xs">Logo URL (optional)</Label>
            <Input
              value={form.logoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, logoUrl: e.target.value }))
              }
              placeholder="https://..."
              className="mt-1 font-body text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="font-body text-xs">
            Tracking URL Template <span className="text-destructive">*</span>
          </Label>
          <Input
            value={form.trackingUrlTemplate}
            onChange={(e) =>
              setForm((f) => ({ ...f, trackingUrlTemplate: e.target.value }))
            }
            placeholder="https://carrier.com/track/{trackingNumber}"
            className="mt-1 font-body text-sm font-mono"
            required
          />
          <p className="text-xs text-muted-foreground font-body mt-1">
            Use{" "}
            <code className="bg-muted px-1 rounded text-xs">
              {"{trackingNumber}"}
            </code>{" "}
            as a placeholder — it will be replaced with the actual tracking
            number.
          </p>
        </div>

        <div>
          <Label className="font-body text-xs">API Key (optional)</Label>
          <div className="relative mt-1">
            <Input
              type={showApiKey ? "text" : "password"}
              value={form.apiKey}
              onChange={(e) =>
                setForm((f) => ({ ...f, apiKey: e.target.value }))
              }
              placeholder="Optional API key for enhanced tracking"
              className="font-mono text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            id="partner-active"
          />
          <Label
            htmlFor="partner-active"
            className="font-body text-xs cursor-pointer"
          >
            Active (available for order tracking)
          </Label>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 font-body text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="flex-1 gap-2 font-body text-sm btn-ripple"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isPending ? "Saving…" : "Save Partner"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

function PartnerRow({
  partner,
  onDelete,
  onEdit,
}: {
  partner: ShippingPartner;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-md border border-border gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt=""
            className="w-8 h-8 object-contain rounded shrink-0 bg-background p-0.5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-body text-sm font-medium truncate">
            {partner.name}
          </p>
          <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
            <Globe className="w-3 h-3 inline mr-1 shrink-0" />
            {partner.trackingUrlTemplate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          className={`text-xs font-body ${
            partner.isActive
              ? "bg-green-100 text-green-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {partner.isActive ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            "Inactive"
          )}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
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
                Remove Shipping Partner?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                This will remove "{partner.name}" from your shipping options.
                Existing orders with this carrier will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-body">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function AdminShipping() {
  const { data: partners, isLoading } = useShippingPartners();
  const addPartner = useAddShippingPartner();
  const updatePartner = useUpdateShippingPartner();
  const deletePartner = useDeleteShippingPartner();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async (data: PartnerFormData) => {
    try {
      await addPartner.mutateAsync({
        id: `partner-${Date.now()}`,
        name: data.name.trim(),
        trackingUrlTemplate: data.trackingUrlTemplate.trim(),
        apiKey: data.apiKey.trim(),
        logoUrl: data.logoUrl.trim(),
        isActive: data.isActive,
      });
      toast.success(`${data.name} added successfully!`);
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add shipping partner");
    }
  };

  const handleUpdate = async (partnerId: string, data: PartnerFormData) => {
    try {
      await updatePartner.mutateAsync({
        id: partnerId,
        name: data.name.trim(),
        trackingUrlTemplate: data.trackingUrlTemplate.trim(),
        apiKey: data.apiKey.trim(),
        logoUrl: data.logoUrl.trim(),
        isActive: data.isActive,
      });
      toast.success(`${data.name} updated!`);
      setEditingId(null);
    } catch {
      toast.error("Failed to update shipping partner");
    }
  };

  const handleDelete = async (partnerId: string, name: string) => {
    try {
      await deletePartner.mutateAsync(partnerId);
      toast.success(`${name} removed`);
    } catch {
      toast.error("Failed to delete shipping partner");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Shipping Partners</h1>
        <p className="text-muted-foreground font-body text-sm">
          Manage carriers for order tracking and delivery
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Partners list */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Configured Partners
              </h2>
            </div>
            <Badge variant="outline" className="text-xs font-body">
              {partners?.length ?? 0} configured
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground font-body mb-5">
            Add shipping carriers to enable real-time order tracking. Customers
            will see a "Track Shipment" button for orders with tracking numbers
            from these carriers.
          </p>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading shipping partners…
            </div>
          )}

          {/* Partners list */}
          {!isLoading && partners && partners.length > 0 && (
            <div className="space-y-2 mb-5">
              {partners.map((partner) =>
                editingId === partner.id ? (
                  <AnimatePresence key={partner.id}>
                    <PartnerForm
                      key={`edit-${partner.id}`}
                      title={`Edit ${partner.name}`}
                      initial={{
                        name: partner.name,
                        trackingUrlTemplate: partner.trackingUrlTemplate,
                        apiKey: partner.apiKey,
                        logoUrl: partner.logoUrl,
                        isActive: partner.isActive,
                      }}
                      onSave={(data) => handleUpdate(partner.id, data)}
                      onCancel={() => setEditingId(null)}
                      isPending={updatePartner.isPending}
                    />
                  </AnimatePresence>
                ) : (
                  <PartnerRow
                    key={partner.id}
                    partner={partner}
                    onEdit={() => setEditingId(partner.id)}
                    onDelete={() => handleDelete(partner.id, partner.name)}
                  />
                ),
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!partners || partners.length === 0) && (
            <div className="text-sm text-muted-foreground font-body py-4 text-center border-2 border-dashed border-border rounded-lg mb-5">
              <Truck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p>No shipping partners configured yet.</p>
              <p className="text-xs mt-1">
                Add carriers to enable order tracking for your customers.
              </p>
            </div>
          )}

          {/* Add form */}
          <AnimatePresence>
            {showAddForm ? (
              <PartnerForm
                key="add-form"
                title="Add New Shipping Partner"
                initial={EMPTY_FORM}
                onSave={handleAdd}
                onCancel={() => setShowAddForm(false)}
                isPending={addPartner.isPending}
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setShowAddForm(true);
                }}
                className="gap-2 font-body text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Shipping Partner
              </Button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-5"
        >
          <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Tracking URL Template Guide
          </h3>
          <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3">
            When adding a carrier, use{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
              {"{trackingNumber}"}
            </code>{" "}
            in the URL template. This placeholder will automatically be replaced
            with the actual tracking number when generating tracking links for
            customers.
          </p>
          <div className="bg-muted/40 rounded px-3 py-2 font-mono text-xs break-all">
            https://carrier.com/track/<strong>{"{trackingNumber}"}</strong>
          </div>
          <p className="text-xs text-muted-foreground font-body mt-2">
            If a carrier doesn't support URL-based tracking, you can still add
            them — customers will see the tracking number without a clickable
            link.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
