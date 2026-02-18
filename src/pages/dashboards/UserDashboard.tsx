import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LayoutDashboard, ShoppingBag, Heart, MapPin, Settings, Bell,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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

const UserDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout navItems={navItems} role="user" title="My Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">
            Hi, {profile?.full_name?.split(" ")[0] || "there"} 👋
          </h2>
          <p className="mt-1 text-muted-foreground">
            Ready to discover local stores near you?
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value="0" sub="Get ordering!" color="hsl(var(--role-user))" />
          <StatCard label="Active Orders" value="0" sub="Nothing in flight" color="hsl(var(--brand))" />
          <StatCard label="Favourites" value="0" sub="Save stores you love" color="hsl(var(--role-admin))" />
          <StatCard label="Saved Addresses" value="0" sub="Add your locations" color="hsl(var(--role-vendor))" />
        </div>

        {/* Placeholder sections */}
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
            <h3 className="font-semibold mb-4">Nearby Stores</h3>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Location not set</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your address to see stores near you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
