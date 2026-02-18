import React, { useState } from "react";
import {
  useVendorProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
  type ProductFormData,
} from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import ProductForm from "./components/ProductForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package, Plus, Pencil, Trash2, ImageOff, Loader2, ShieldOff,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const ProductsPage: React.FC = () => {
  const { isVendorActive } = useAuth();
  const { data: products, isLoading } = useVendorProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (data: ProductFormData) => {
    await createProduct.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!editingProduct) return;
    await updateProduct.mutateAsync({ id: editingProduct.id, data });
    setEditingProduct(null);
  };

  const handleToggleActive = (product: Product) => {
    updateProduct.mutate({
      id: product.id,
      data: { is_active: !product.is_active },
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteProduct.mutateAsync(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {!isVendorActive && (
        <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
          <ShieldOff className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Your account has been suspended by the platform. Product management is disabled. Contact support to resolve this.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products?.length ?? 0} product{products?.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          disabled={!isVendorActive}
          className="brand-gradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !products?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold text-lg">No products yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Start listing products to make them visible to customers.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            disabled={!isVendorActive}
            className="brand-gradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add your first product
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 bg-muted shrink-0">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Active badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    className={
                      product.is_active
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    }
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold leading-snug line-clamp-2">{product.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{product.category}</p>

                <div className="flex items-center justify-between mb-3 mt-auto">
                  <span className="text-lg font-bold text-role-vendor">₹{product.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">
                    Stock: {product.stock_quantity}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 mr-auto">
                    <Switch
                      checked={product.is_active}
                      disabled={!isVendorActive}
                      onCheckedChange={() => handleToggleActive(product)}
                      className="scale-90"
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.is_active ? "Live" : "Hidden"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!isVendorActive}
                    onClick={() => setEditingProduct(product)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={!isVendorActive}
                    onClick={() => setDeletingId(product.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={createProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(o) => !o && setEditingProduct(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initial={editingProduct}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProduct(null)}
              loading={updateProduct.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;
