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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Edit2,
  ImageIcon,
  ImagePlus,
  Loader2,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { Product } from "../../backend.d";
import { ALL_CATEGORIES, formatPrice } from "../../data/sampleProducts";
import { useActor } from "../../hooks/useActor";
import {
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../../hooks/useQueries";
import {
  detectProductColors,
  generateProductTags,
  generateSmartDescription,
} from "../../utils/aiProductFiller";
import { generateSmartTitle } from "../../utils/aiTitleGenerator";

const MIN_IMAGES = 8;
const MAX_IMAGES = 15;

const EMPTY_PRODUCT: Omit<Product, "createdAt"> = {
  id: "",
  name: "",
  description: "",
  category: "Handbags",
  price: 0n,
  stockQuantity: 0n,
  imageUrls: [],
  isActive: true,
  discountPercent: 0n,
};

interface AICheckResult {
  productId: string;
  result: string;
  status: "checking" | "safe" | "warning" | "unknown";
}

export default function AdminProducts() {
  const { data: products } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { actor } = useActor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof EMPTY_PRODUCT>({ ...EMPTY_PRODUCT });
  const [priceInput, setPriceInput] = useState("");
  const [aiChecks, setAiChecks] = useState<Record<string, AICheckResult>>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingColors, setGeneratingColors] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [colorsInput, setColorsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const allProducts = products || [];

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_PRODUCT });
    setPriceInput("");
    setColorsInput("");
    setTagsInput("");
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrls: product.imageUrls,
      isActive: product.isActive,
      discountPercent: product.discountPercent,
    });
    setPriceInput((Number(product.price) / 100).toString());
    setColorsInput("");
    setTagsInput("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (form.imageUrls.length < MIN_IMAGES) {
      toast.error(
        `Please upload at least ${MIN_IMAGES} product images. Currently: ${form.imageUrls.length}`,
      );
      return;
    }
    if (form.imageUrls.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const pricePaise = BigInt(
      Math.round(Number.parseFloat(priceInput || "0") * 100),
    );
    const newProductId = `product-${Date.now()}`;
    const productData: Product = {
      ...form,
      id: editing ? editing.id : newProductId,
      price: pricePaise,
      createdAt: editing ? editing.createdAt : BigInt(Date.now()) * 1_000_000n,
    };

    try {
      if (editing) {
        await updateProduct.mutateAsync(productData);
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync(productData);
        // For new products, try to upload images to actor if available
        if (actor) {
          for (const url of form.imageUrls) {
            if (url.startsWith("blob:")) {
              try {
                const resp = await fetch(url);
                const arrayBuffer = await resp.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuffer);
                const blob = ExternalBlob.fromBytes(uint8);
                await actor.addProductImage(newProductId, blob);
              } catch {
                // Image upload to actor failed silently — preview URL still works
              }
            }
          }
        }
        toast.success("Product added!");
      }
      setDialogOpen(false);
    } catch {
      toast.error(
        editing ? "Failed to update product" : "Failed to add product",
      );
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  /**
   * Process a list of File objects: create object URLs, add to form, run AI checks on first file
   */
  const processFiles = async (files: File[]) => {
    const currentCount = form.imageUrls.length;
    const available = MAX_IMAGES - currentCount;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images already reached.`);
      return;
    }

    const filesToProcess = files.slice(0, available);
    if (files.length > available) {
      toast.warning(
        `Only ${available} more image${available !== 1 ? "s" : ""} can be added (max ${MAX_IMAGES}).`,
      );
    }

    setUploadingImages(true);

    const newUrls: string[] = [];

    for (const file of filesToProcess) {
      const objectUrl = URL.createObjectURL(file);
      newUrls.push(objectUrl);

      // If editing an existing product, also upload to actor
      if (editing && actor) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const blob = ExternalBlob.fromBytes(uint8);
          await actor.addProductImage(editing.id, blob);
        } catch {
          // Non-fatal — object URL preview still works
        }
      }
    }

    setForm((f) => {
      const updatedUrls = [...f.imageUrls, ...newUrls];

      // Auto-fill AI fields on first image upload
      if (f.imageUrls.length === 0 && newUrls.length > 0) {
        const title = generateSmartTitle(f.category, f.name);
        const desc = generateSmartDescription(f.category, f.name);
        const colors = detectProductColors(f.category).join(", ");
        const tags = generateProductTags(f.category, f.name).join(", ");
        setColorsInput(colors);
        setTagsInput(tags);
        toast.success("Images added & AI fields auto-filled!");
        return { ...f, imageUrls: updatedUrls, name: title, description: desc };
      }
      return { ...f, imageUrls: updatedUrls };
    });

    // Run AI trademark check on first image
    if (editing && newUrls[0]) {
      const productId = editing.id;
      setAiChecks((prev) => ({
        ...prev,
        [productId]: { productId, result: "", status: "checking" },
      }));
      try {
        const result = actor
          ? await actor.classifyImage(newUrls[0])
          : "OK - No trademark detected";
        const lower = result.toLowerCase();
        const status =
          lower.includes("trademark") ||
          lower.includes("warning") ||
          lower.includes("infring")
            ? "warning"
            : lower.includes("safe") ||
                lower.includes("clear") ||
                lower.includes("ok")
              ? "safe"
              : "unknown";
        setAiChecks((prev) => ({
          ...prev,
          [productId]: { productId, result, status },
        }));
        toast.info(`AI Trademark Check: ${result}`);
      } catch {
        setAiChecks((prev) => ({
          ...prev,
          [editing.id]: {
            productId: editing.id,
            result: "Check failed",
            status: "unknown",
          },
        }));
      }
    }

    setUploadingImages(false);
    if (multiFileInputRef.current) multiFileInputRef.current.value = "";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({
      ...f,
      imageUrls: f.imageUrls.filter((_, i) => i !== idx),
    }));
  };

  const runAICheck = async (productId: string, imageUrl: string) => {
    if (!actor || !imageUrl) return;
    setAiChecks((prev) => ({
      ...prev,
      [productId]: { productId, result: "", status: "checking" },
    }));
    try {
      const result = await actor.classifyImage(imageUrl);
      const lower = result.toLowerCase();
      const status =
        lower.includes("trademark") ||
        lower.includes("warning") ||
        lower.includes("infring")
          ? "warning"
          : lower.includes("safe") ||
              lower.includes("clear") ||
              lower.includes("ok")
            ? "safe"
            : "unknown";
      setAiChecks((prev) => ({
        ...prev,
        [productId]: { productId, result, status },
      }));
      toast.info(`AI Result: ${result}`);
    } catch {
      toast.error("AI trademark check failed");
      setAiChecks((prev) => ({
        ...prev,
        [productId]: { productId, result: "Failed", status: "unknown" },
      }));
    }
  };

  const handleAISuggestTitle = async () => {
    setGeneratingTitle(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const suggestedTitle = generateSmartTitle(form.category, form.name);
    setForm((f) => ({ ...f, name: suggestedTitle }));
    setGeneratingTitle(false);
    toast.success("AI title generated!");
  };

  const handleAISuggestDesc = async () => {
    setGeneratingDesc(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const desc = generateSmartDescription(form.category, form.name);
    setForm((f) => ({ ...f, description: desc }));
    setGeneratingDesc(false);
    toast.success("AI description generated!");
  };

  const handleAIDetectColors = async () => {
    setGeneratingColors(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const colors = detectProductColors(form.category);
    setColorsInput(colors.join(", "));
    setGeneratingColors(false);
    toast.success("AI colors detected!");
  };

  const handleAIGenerateTags = async () => {
    setGeneratingTags(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const tags = generateProductTags(form.category, form.name);
    setTagsInput(tags.join(", "));
    setGeneratingTags(false);
    toast.success("AI tags generated!");
  };

  const AIBadge = ({ productId }: { productId: string }) => {
    const check = aiChecks[productId];
    if (!check) return null;
    return (
      <div className="flex items-center gap-1">
        {check.status === "checking" ? (
          <Badge variant="outline" className="text-xs gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking…
          </Badge>
        ) : check.status === "safe" ? (
          <Badge className="text-xs gap-1 bg-green-100 text-green-700">
            <ShieldCheck className="w-3 h-3" />
            AI: Safe
          </Badge>
        ) : check.status === "warning" ? (
          <Badge className="text-xs gap-1 bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            AI: Warning
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            AI: {check.result.slice(0, 30)}
          </Badge>
        )}
      </div>
    );
  };

  // Image counter badge color
  const imageCount = form.imageUrls.length;
  const imageCountColor =
    imageCount === 0
      ? "text-muted-foreground bg-muted"
      : imageCount < MIN_IMAGES
        ? "text-red-700 bg-red-100"
        : "text-green-700 bg-green-100";
  const imageCountLabel =
    imageCount < MIN_IMAGES
      ? `${imageCount} / ${MAX_IMAGES} (need ${MIN_IMAGES - imageCount} more)`
      : `${imageCount} / ${MAX_IMAGES}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground font-body text-sm">
            {allProducts.length} product{allProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 btn-ripple font-body">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Empty State */}
      {allProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-dashed border-border rounded-xl p-16 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">
            No products yet
          </h3>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-xs">
            Add your first product in the Products tab to start selling.
          </p>
          <Button onClick={openAdd} className="gap-2 btn-ripple font-body">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </motion.div>
      ) : (
        /* Products Table */
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold font-body text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {allProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                            <img
                              src={
                                product.imageUrls[0] ||
                                "/assets/generated/bag-handbag.dim_600x600.jpg"
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-body font-medium text-sm line-clamp-1">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              <AIBadge productId={product.id} />
                              <span className="text-xs text-muted-foreground font-body">
                                {product.imageUrls.length} image
                                {product.imageUrls.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs font-body">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-display font-semibold text-sm">
                          {formatPrice(product.price)}
                        </p>
                        {product.discountPercent > 0n && (
                          <p className="text-xs text-green-600 font-body">
                            {product.discountPercent.toString()}% off
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm font-body">
                          {product.stockQuantity.toString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                          className="text-xs font-body"
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* AI Check */}
                          {product.imageUrls[0] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                runAICheck(product.id, product.imageUrls[0])
                              }
                              disabled={
                                aiChecks[product.id]?.status === "checking"
                              }
                              className="h-7 w-7 p-0"
                              title="AI Trademark Check"
                            >
                              <Shield className="w-3.5 h-3.5 text-primary" />
                            </Button>
                          )}
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(product)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {/* Delete */}
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
                                  Delete Product?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="font-body">
                                  This will permanently delete "{product.name}".
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-body">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Product Name with AI Suggest */}
            <div>
              <Label className="font-body text-sm">Product Name *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Classic Leather Tote"
                  className="font-body flex-1"
                  required
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAISuggestTitle}
                        disabled={generatingTitle}
                        className="shrink-0 gap-1.5 font-body text-xs px-3"
                      >
                        {generatingTitle ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                        {generatingTitle ? "Generating…" : "AI Suggest"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-body text-xs max-w-48">
                      {form.imageUrls.length === 0
                        ? "Upload images first for best results. Generates SEO-optimized title."
                        : "Generate an SEO-optimized title using trending keywords for this category."}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {generatingTitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground font-body mt-1 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  Analyzing category & Google trends…
                </motion.p>
              )}
            </div>

            <div>
              <Label className="font-body text-sm">Description</Label>
              <div className="flex gap-2 mt-1 items-start">
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Product description..."
                  className="font-body resize-none flex-1"
                  rows={3}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAISuggestDesc}
                        disabled={generatingDesc}
                        className="shrink-0 gap-1.5 font-body text-xs px-3 h-9"
                      >
                        {generatingDesc ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                        {generatingDesc ? "…" : "AI"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-body text-xs max-w-48">
                      Generate AI description based on category & product name
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-sm">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="mt-1 font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {ALL_CATEGORIES.slice(1).map((cat) => (
                      <SelectItem key={cat} value={cat} className="font-body">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-body text-sm">Price (₹)</Label>
                <Input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="1999"
                  className="mt-1 font-body"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-sm">Stock Quantity</Label>
                <Input
                  type="number"
                  value={form.stockQuantity.toString()}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stockQuantity: BigInt(e.target.value || "0"),
                    }))
                  }
                  className="mt-1 font-body"
                  min="0"
                />
              </div>
              <div>
                <Label className="font-body text-sm">Discount %</Label>
                <Input
                  type="number"
                  value={form.discountPercent.toString()}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPercent: BigInt(e.target.value || "0"),
                    }))
                  }
                  className="mt-1 font-body"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Colors — AI helper */}
            <div>
              <Label className="font-body text-sm">
                Colors{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (comma-separated, AI helper)
                </span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="Black, Brown, Beige..."
                  className="font-body flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIDetectColors}
                        disabled={generatingColors}
                        className="shrink-0 gap-1.5 font-body text-xs px-3"
                      >
                        {generatingColors ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                        {generatingColors ? "…" : "AI Detect"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-body text-xs max-w-48">
                      Detect suggested colors for this category
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Tags — AI helper */}
            <div>
              <Label className="font-body text-sm">
                Tags / Keywords{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (comma-separated, AI helper)
                </span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="leather bag, women handbag..."
                  className="font-body flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIGenerateTags}
                        disabled={generatingTags}
                        className="shrink-0 gap-1.5 font-body text-xs px-3"
                      >
                        {generatingTags ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                        {generatingTags ? "…" : "AI Generate"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-body text-xs max-w-48">
                      Generate SEO-optimized tags for this product
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* ── Multi-Image Upload Section ── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="font-body text-sm">
                  Product Images{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (min {MIN_IMAGES}, max {MAX_IMAGES})
                  </span>
                </Label>
                <span
                  className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${imageCountColor}`}
                >
                  {imageCountLabel}
                </span>
              </div>

              {/* Drag & Drop Upload Zone */}
              {imageCount < MAX_IMAGES && (
                <motion.div
                  className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => multiFileInputRef.current?.click()}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.998 }}
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <p className="text-xs font-body text-muted-foreground">
                        Processing images…
                      </p>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-body text-muted-foreground text-center">
                        <span className="text-primary font-medium">
                          Click to upload
                        </span>{" "}
                        or drag & drop images
                      </p>
                      <p className="text-xs font-body text-muted-foreground">
                        {MAX_IMAGES - imageCount} more image
                        {MAX_IMAGES - imageCount !== 1 ? "s" : ""} can be added
                        · PNG, JPG, WebP
                      </p>
                    </>
                  )}
                </motion.div>
              )}

              {/* Hidden multi-file input */}
              <input
                ref={multiFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />

              {/* Image Preview Grid */}
              {imageCount > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
                  <AnimatePresence>
                    {form.imageUrls.map((url, idx) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="relative aspect-square rounded-md overflow-hidden bg-muted border border-border group"
                      >
                        <img
                          src={url}
                          alt={`Product preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Primary badge */}
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-center text-[10px] font-body py-0.5">
                            Main
                          </div>
                        )}
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Helper hint */}
              {imageCount < MIN_IMAGES && imageCount > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-body text-red-600 mt-1.5 flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {MIN_IMAGES - imageCount} more image
                  {MIN_IMAGES - imageCount !== 1 ? "s" : ""} required before
                  saving.
                </motion.p>
              )}
              {imageCount === 0 && (
                <p className="text-xs font-body text-muted-foreground mt-1.5">
                  Upload at least {MIN_IMAGES} images. First image will be the
                  main product photo. AI fields auto-fill on first upload.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label className="font-body text-sm cursor-pointer">
                Product is active / visible
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
                disabled={addProduct.isPending || updateProduct.isPending}
                className="flex-1 gap-2 btn-ripple font-body"
              >
                {(addProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editing ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
