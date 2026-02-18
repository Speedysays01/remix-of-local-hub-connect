import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Bike, Clock, Settings,
} from "lucide-react";
import DeliveryOrdersPage from "@/pages/delivery/DeliveryOrdersPage";
import DeliveryHistoryPage from "@/pages/delivery/DeliveryHistoryPage";
import { useDeliveryOrders, useDeliveryHistory } from "@/hooks/useOrders";

const navItems = [
  { label: "Dashboard", href: "/delivery", icon: LayoutDashboard },
  { label: "Active Orders", href: "/delivery/active", icon: Bike },
  { label: "History", href: "/delivery/history", icon: Clock },
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

const DeliveryHome: React.FC = () => {
  const { profile } = useAuth();
  const { data: activeOrders } = useDeliveryOrders();
  const { data: history } = useDeliveryHistory();

  const todayCount = React.useMemo(() => {
    if (!history) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return history.filter((o) => new Date(o.updated_at) >= today).length;
  }, [history]);

  const activeCount = activeOrders?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Ready to ride, {profile?.full_name?.split(" ")[0] || "Partner"} 🏍️
          </h2>
          <p className="mt-1 text-muted-foreground">
            Check Active Orders to see what needs to be picked up.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Active Orders" value={String(activeCount)} sub="Ready for pickup / in flight" color="hsl(var(--role-delivery))" />
        <StatCard label="Today's Deliveries" value={String(todayCount)} sub="Delivered today" color="hsl(var(--role-vendor))" />
        <StatCard label="Status" value="Online" sub="Receiving orders" color="hsl(var(--role-user))" />
      </div>

      <DeliveryOrdersPage />
    </div>
  );
};

const DeliveryDashboard: React.FC = () => {
  return (
    <DashboardLayout navItems={navItems} role="delivery" title="Delivery Dashboard">
      <Routes>
        <Route index element={<DeliveryHome />} />
        <Route path="active" element={<DeliveryOrdersPage />} />
        <Route path="history" element={<DeliveryHistoryPage />} />
        <Route path="*" element={<DeliveryHome />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
