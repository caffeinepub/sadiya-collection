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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Offer } from "../../backend.d";
import {
  useActiveOffers,
  useAddOffer,
  useDeleteOffer,
  useUpdateOffer,
} from "../../hooks/useQueries";

const EMPTY_OFFER: Offer = {
  id: "",
  name: "",
  discountPercent: 10n,
  isActive: true,
};

export default function AdminOffers() {
  const { data: offers } = useActiveOffers();
  const addOffer = useAddOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<Offer>({ ...EMPTY_OFFER });
  const [discountInput, setDiscountInput] = useState("10");

  const allOffers = offers || [];

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_OFFER });
    setDiscountInput("10");
    setDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setForm({ ...offer });
    setDiscountInput(offer.discountPercent.toString());
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Offer name is required");
      return;
    }
    const offerData: Offer = {
      ...form,
      id: editing ? editing.id : `offer-${Date.now()}`,
      discountPercent: BigInt(discountInput || "10"),
    };
    try {
      if (editing) {
        await updateOffer.mutateAsync(offerData);
        toast.success("Offer updated!");
      } else {
        await addOffer.mutateAsync(offerData);
        toast.success("Offer created!");
      }
      setDialogOpen(false);
    } catch {
      toast.error(
        editing ? "Failed to update offer" : "Failed to create offer",
      );
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      await deleteOffer.mutateAsync(offerId);
      toast.success("Offer deleted");
    } catch {
      toast.error("Failed to delete offer");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Offers & Promotions
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            {allOffers.filter((o) => o.isActive).length} active offers
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 btn-ripple font-body">
          <Plus className="w-4 h-4" />
          Create Offer
        </Button>
      </div>

      {allOffers.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Tag className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold mb-1">
            No offers created
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-4">
            Create promotional offers to attract more customers.
          </p>
          <Button onClick={openAdd} className="gap-2 btn-ripple font-body">
            <Plus className="w-4 h-4" />
            Create First Offer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {allOffers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-lg p-4 relative overflow-hidden"
              >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-4 translate-x-4" />

                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <Badge
                    variant={offer.isActive ? "default" : "secondary"}
                    className="text-xs font-body"
                  >
                    {offer.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>

                <h3 className="font-display font-bold text-lg mb-1">
                  {offer.name}
                </h3>
                <p className="font-accent italic text-3xl font-bold text-primary mb-4">
                  {offer.discountPercent.toString()}% OFF
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(offer)}
                    className="flex-1 gap-1 font-body text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground font-body text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display">
                          Delete Offer?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-body">
                          Delete the "{offer.name}" offer permanently?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-body">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(offer.id)}
                          className="bg-destructive text-destructive-foreground font-body"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Offer" : "Create New Offer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="font-body text-sm">Offer Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Summer Sale, Festival Discount"
                className="mt-1 font-body"
                required
              />
            </div>
            <div>
              <Label className="font-body text-sm">Discount Percentage *</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="10"
                  className="font-body pr-8"
                  min="1"
                  max="99"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label className="font-body text-sm cursor-pointer">
                Offer is active
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 font-body"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addOffer.isPending || updateOffer.isPending}
                className="flex-1 gap-2 btn-ripple font-body"
              >
                {(addOffer.isPending || updateOffer.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editing ? "Update Offer" : "Create Offer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
