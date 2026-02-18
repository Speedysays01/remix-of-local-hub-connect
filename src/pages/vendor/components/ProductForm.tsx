import React, { useState, useRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadProductImage } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { ImagePlus, X, Loader2 } from "lucide-react";
import type { Product, ProductFormData } from "@/hooks/useProducts";

export const CATEGORIES = [
  "Groceries",
  "Food & Beverages",
  "Electronics",
  "Clothing",
  "Health & Beauty",
  "Home & Kitchen",
  "Books & Stationery",
  "Sports & Fitness",
  "Toys & Games",
  "Other",
];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(1000).optional(),
  price: z.number({ invalid_type_error: "Enter a valid price" }).min(0, "Price cannot be negative"),
  category: z.string().min(1, "Select a category"),
  stock_quantity: z
    .number({ invalid_type_error: "Enter a valid quantity" })
    .int()
    .min(0, "Stock cannot be negative"),
});

interface Props {
  initial?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const ProductForm: React.FC<Props> = ({ initial, onSubmit, onCancel, loading }) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [stock, setStock] = useState(initial?.stock_quantity?.toString() ?? "0");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !user) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map((f) => uploadProductImage(f, user.id))
      );
      setImages((prev) => [...prev, ...urls].slice(0, 5));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, images: err.message }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (url: string) =>
    setImages((prev) => prev.filter((u) => u !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = schema.safeParse({
      name,
      description,
      price: parseFloat(price),
      category,
      stock_quantity: parseInt(stock, 10),
    });

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errs[err.path[0] as string] = err.message;
      });
      setErrors(errs);
      return;
    }

    await onSubmit({
      name: result.data.name,
      description: result.data.description ?? "",
      price: result.data.price,
      category: result.data.category,
      stock_quantity: result.data.stock_quantity,
      images,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fresh Mango Juice 500ml"
          className="h-10"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product..."
          rows={3}
          maxLength={1000}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="h-10"
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="space-y-1.5">
        <Label htmlFor="stock">Stock Quantity *</Label>
        <Input
          id="stock"
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="0"
          className="h-10 w-40"
        />
        {errors.stock_quantity && (
          <p className="text-xs text-destructive">{errors.stock_quantity}</p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Images (up to 5)</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt="product"
                className="h-20 w-20 rounded-lg object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        {errors.images && (
          <p className="text-xs text-destructive">{errors.images}</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP — max 5MB each</p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium">Active</p>
          <p className="text-xs text-muted-foreground">
            Inactive products are hidden from customers
          </p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 brand-gradient text-white hover:opacity-90"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : initial ? (
            "Save Changes"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
