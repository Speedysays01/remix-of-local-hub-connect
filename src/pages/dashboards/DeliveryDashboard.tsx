import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LayoutDashboard, Bike, MapPin, Clock, CheckCircle, DollarSign, Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/delivery", icon: LayoutDashboard },
  { label: "Active Delivery", href: "/delivery/active", icon: Bike },
  { label: "History", href: "/delivery/history", icon: Clock },
  { label: "Earnings", href: "/delivery/earnings", icon: DollarSign },
  { label: "Live Map", href: "/delivery/map", icon: MapPin },
  { label: "Settings", href: "/delivery/settings", icon: Settings },
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

const DeliveryDashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout navItems={navItems} role="delivery" title="Delivery Dashboard">
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Ready to ride, {profile?.full_name?.split(" ")[0] || "Partner"} 🏍️
            </h2>
            <p className="mt-1 text-muted-foreground">
              Go online to start receiving delivery requests.
            </p>
          </div>
          {/* Online/Offline Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            <span className="text-sm font-medium text-muted-foreground">Offline</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Deliveries" value="0" sub="Go online to start" color="hsl(var(--role-delivery))" />
          <StatCard label="Today's Earnings" value="₹0" sub="Earn per delivery" color="hsl(var(--role-vendor))" />
          <StatCard label="Acceptance Rate" value="—" sub="No data yet" color="hsl(var(--role-user))" />
          <StatCard label="Avg. Delivery Time" value="—" sub="Complete deliveries first" color="hsl(var(--role-admin))" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Current Delivery</h3>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bike className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No active delivery</p>
              <p className="text-xs text-muted-foreground mt-1">
                Go online to receive delivery assignments.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Recent Deliveries</h3>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No deliveries yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your delivery history will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
