import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicProducts } from "@/hooks/useProducts";
import { CATEGORIES } from "@/pages/vendor/components/ProductForm";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ImageOff, Loader2, Store } from "lucide-react";

const BrowsePage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(val), 350);
  };

  const { data: products, isLoading } = usePublicProducts(selectedCategory, debouncedSearch);

  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Browse Products</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Discover deals from local vendors near you
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9 h-10"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
              selectedCategory === cat
                ? "brand-gradient text-white border-transparent"
                : "border-border hover:border-brand/50 hover:bg-muted/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !products?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No products found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different category or search term.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {products.length} result{products.length !== 1 ? "s" : ""}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/browse/${product.id}`}
                className="group rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-brand/30 transition-all"
              >
                {/* Image */}
                <div className="relative h-44 bg-muted shrink-0 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-background/90 text-foreground border-border text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-role-vendor transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Store className="h-3 w-3" />
                    <span className="truncate">
                      {product.vendor_store_name || product.vendor_name || "Local Store"}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-role-vendor">
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.stock_quantity === 0 && (
                      <span className="text-xs text-destructive font-medium">Out of stock</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowsePage;
