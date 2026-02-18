import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LayoutDashboard, Package, ClipboardList, BarChart3, Store, Settings, Star,
} from "lucide-react";
import ProductsPage from "@/pages/vendor/ProductsPage";
import VendorOrdersPage from "@/pages/vendor/VendorOrdersPage";
import { Route, Routes } from "react-router-dom";

const navItems = [
  { label: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { label: "Products", href: "/vendor/products", icon: Package },
  { label: "Orders", href: "/vendor/orders", icon: ClipboardList },
  { label: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { label: "Store Profile", href: "/vendor/store", icon: Store },
  { label: "Reviews", href: "/vendor/reviews", icon: Star },
  { label: "Settings", href: "/vendor/settings", icon: Settings },
];

import { useAuth } from "@/contexts/AuthContext";

const StatCard: React.FC<{ label: string; value: string; sub: string; color: string }> = ({
  label, value, sub, color,
}) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-bold" style={{ color }}>{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
  </div>
);

const VendorHome: React.FC = () => {
  const { profile } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Welcome, {profile?.full_name?.split(" ")[0] || "Vendor"} 🏪
        </h2>
        <p className="mt-1 text-muted-foreground">
          Manage your store, products, and incoming orders.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value="0" sub="Add your first product" color="hsl(var(--role-vendor))" />
        <StatCard label="Active Orders" value="0" sub="No pending orders" color="hsl(var(--brand))" />
        <StatCard label="Today's Revenue" value="₹0" sub="Sales start here" color="hsl(var(--role-user))" />
        <StatCard label="Avg. Rating" value="—" sub="No reviews yet" color="hsl(var(--role-admin))" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Pending Orders</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No pending orders</p>
            <p className="text-xs text-muted-foreground mt-1">
              Incoming orders from customers will appear here.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: "Add new product", icon: Package, desc: "List items in your catalog" },
              { label: "Update store hours", icon: Store, desc: "Set your availability" },
              { label: "View analytics", icon: BarChart3, desc: "Track your performance" },
            ].map((action) => (
              <div
                key={action.label}
                className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-role-vendor/10 shrink-0">
                  <action.icon className="h-4 w-4 text-role-vendor" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const VendorDashboard: React.FC = () => {
  return (
    <DashboardLayout navItems={navItems} role="vendor" title="Vendor Dashboard">
      <Routes>
        <Route index element={<VendorHome />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="*" element={<VendorHome />} />
      </Routes>
    </DashboardLayout>
  );
};

export default VendorDashboard;
