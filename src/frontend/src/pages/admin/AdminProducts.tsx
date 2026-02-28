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
  Loader2,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
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
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingColors, setGeneratingColors] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [colorsInput, setColorsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadProductIdRef = useRef<string>("");

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
    const pricePaise = BigInt(
      Math.round(Number.parseFloat(priceInput || "0") * 100),
    );
    const productData: Product = {
      ...form,
      id: editing ? editing.id : `product-${Date.now()}`,
      price: pricePaise,
      createdAt: editing ? editing.createdAt : BigInt(Date.now()) * 1_000_000n,
    };
    try {
      if (editing) {
        await updateProduct.mutateAsync(productData);
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync(productData);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    const productId = uploadProductIdRef.current;
    setUploadingFor(productId);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8);
      await actor.addProductImage(productId, blob);

      const url = blob.getDirectURL();
      toast.success("Image uploaded!");

      // Auto-run AI trademark check
      if (url) {
        setAiChecks((prev) => ({
          ...prev,
          [productId]: { productId, result: "", status: "checking" },
        }));
        try {
          const result = await actor.classifyImage(url);
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
          toast.info(`AI Check: ${result}`);
        } catch {
          setAiChecks((prev) => ({
            ...prev,
            [productId]: {
              productId,
              result: "Check failed",
              status: "unknown",
            },
          }));
        }
      }

      // Auto-fill AI fields after image upload
      setForm((f) => {
        const title = generateSmartTitle(f.category, f.name);
        const desc = generateSmartDescription(f.category, f.name);
        const colors = detectProductColors(f.category).join(", ");
        const tags = generateProductTags(f.category, f.name).join(", ");
        setColorsInput(colors);
        setTagsInput(tags);
        return { ...f, name: title, description: desc };
      });
      toast.success("AI fields auto-filled!");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingFor(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
                            <AIBadge productId={product.id} />
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
                          {/* Image upload */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              uploadProductIdRef.current = product.id;
                              fileInputRef.current?.click();
                            }}
                            disabled={uploadingFor === product.id}
                            className="h-7 w-7 p-0"
                            title="Upload Image"
                          >
                            {uploadingFor === product.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                          </Button>
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

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
                        ? "Upload an image first for best results. Generates SEO-optimized title based on category."
                        : "Generate an SEO-optimized title using trending Google keywords for this category."}
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
            {/* Colors — AI helper (UI-only, appended to description on save) */}
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

            {/* Tags — AI helper (UI-only) */}
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

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label className="font-body text-sm cursor-pointer">
                Product is active / visible
              </Label>
            </div>

            {/* Current images */}
            {form.imageUrls.length > 0 && (
              <div>
                <Label className="font-body text-sm">Product Images</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {form.imageUrls.map((url, idx) => (
                    <div
                      key={url}
                      className="relative w-16 h-16 rounded-md overflow-hidden bg-muted border border-border"
                    >
                      <img
                        src={url}
                        alt={`img-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            imageUrls: f.imageUrls.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
