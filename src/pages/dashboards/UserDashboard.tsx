import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Heart, MapPin, Settings, Bell, Search,
} from "lucide-react";
import BrowsePage from "@/pages/browse/BrowsePage";
import ProductDetailPage from "@/pages/browse/ProductDetailPage";
import CheckoutPage from "@/pages/user/CheckoutPage";
import UserOrdersPage from "@/pages/user/UserOrdersPage";
import CartDrawer from "@/components/CartDrawer";
import CartButton from "@/components/CartButton";
import { CartProvider } from "@/contexts/CartContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse", href: "/dashboard/browse", icon: Search },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Favourites", href: "/dashboard/favourites", icon: Heart },
  { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const StatCard: React.FC<{ label: string; value: string; sub: string; color: string }> = ({
  label, value, sub, color,
}) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-bold" style={{ color }}>{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
  </div>
);

const UserHome: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Hi, {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h2>
        <p className="mt-1 text-muted-foreground">
          Ready to discover local stores near you?
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value="0" sub="Get ordering!" color="hsl(var(--role-user))" />
        <StatCard label="Active Orders" value="0" sub="Nothing in flight" color="hsl(var(--brand))" />
        <StatCard label="Favourites" value="0" sub="Save stores you love" color="hsl(var(--role-admin))" />
        <StatCard label="Saved Addresses" value="0" sub="Add your locations" color="hsl(var(--role-vendor))" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Once you place your first order, it'll show up here.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div
              onClick={() => navigate("/dashboard/browse")}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-role-user/10 shrink-0">
                <Search className="h-4 w-4 text-role-user" />
              </div>
              <div>
                <p className="text-sm font-medium">Browse products</p>
                <p className="text-xs text-muted-foreground">Discover deals from local vendors</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-role-vendor/10 shrink-0">
                <MapPin className="h-4 w-4 text-role-vendor" />
              </div>
              <div>
                <p className="text-sm font-medium">Add delivery address</p>
                <p className="text-xs text-muted-foreground">Set your location for faster delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  return (
    <CartProvider>
      <DashboardLayout navItems={navItems} role="user" title="My Dashboard" headerActions={<CartButton />}>
        <CartDrawer />
        <Routes>
          <Route index element={<UserHome />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="browse/:id" element={<ProductDetailPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<UserOrdersPage />} />
          <Route path="*" element={<UserHome />} />
        </Routes>
      </DashboardLayout>
    </CartProvider>
  );
};

export default UserDashboard;
