import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Store, Package, ImageOff, Loader2, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id ?? "");
  const [imageIndex, setImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg">Product not found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          This product may be unavailable or no longer listed.
        </p>
        <Link to="/browse">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images ?? [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        to="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image carousel */}
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
            {images[imageIndex] ? (
              <img
                src={images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            {hasMultipleImages && (
              <>
                <button
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  disabled={imageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow disabled:opacity-30 hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={imageIndex === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow disabled:opacity-30 hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setImageIndex(i)}
                  className={`shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === imageIndex ? "border-brand" : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <Badge className="mb-3 bg-brand/10 text-brand border-brand/20 hover:bg-brand/10">
              {product.category}
            </Badge>
            <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4" />
              <span>{product.vendor_store_name || product.vendor_name || "Local Store"}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-role-vendor">
              ₹{product.price.toFixed(2)}
            </span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            {product.stock_quantity > 0 ? (
              <span className="text-sm text-emerald-600 font-medium">
                In stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="text-sm text-destructive font-medium">Out of stock</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold mb-2">About this product</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* CTA placeholder for future cart */}
          <Button
            disabled={product.stock_quantity === 0}
            className="w-full h-11 brand-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart (coming soon)"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
