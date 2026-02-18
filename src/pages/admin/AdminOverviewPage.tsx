import React from "react";
import { useAdminStats } from "@/hooks/useAdmin";
import { useAdminOrders } from "@/hooks/useAdmin";
import { STATUS_LABELS, STATUS_STYLES } from "@/hooks/useOrders";
import type { OrderStatus } from "@/hooks/useOrders";
import {
  Users, Store, Bike, ShoppingBag, TrendingUp, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StatCard: React.FC<{
  label: string; value: string | number; sub: string;
  colorClass: string; bgClass: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ label, value, sub, colorClass, bgClass, icon: Icon }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgClass}`}>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </div>
    </div>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
  </div>
);

const STATUS_ORDER: OrderStatus[] = [
  "pending", "accepted", "ready_for_pickup", "picked_up", "delivered", "cancelled",
];

const AdminOverviewPage: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();
  const { data: recentOrders } = useAdminOrders("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Overview</h2>
        <p className="mt-1 text-muted-foreground">
          Monitor and manage the entire SwiftLocal ecosystem.
        </p>
      </div>

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Customers" value={stats?.totalUsers ?? 0}    sub="Registered users"     colorClass="text-role-user"     bgClass="bg-role-user/10"     icon={Users} />
        <StatCard label="Vendors"   value={stats?.totalVendors ?? 0}  sub="Listed stores"        colorClass="text-role-vendor"   bgClass="bg-role-vendor/10"   icon={Store} />
        <StatCard label="Riders"    value={stats?.totalDelivery ?? 0} sub="Delivery partners"    colorClass="text-role-delivery" bgClass="bg-role-delivery/10" icon={Bike} />
        <StatCard label="Orders"    value={stats?.totalOrders ?? 0}   sub="All time"             colorClass="text-role-admin"    bgClass="bg-role-admin/10"    icon={ShoppingBag} />
        <StatCard
          label="Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          sub="Gross order value"
          colorClass="text-brand"
          bgClass="bg-brand/10"
          icon={TrendingUp}
        />
      </div>

      {/* ── Orders by status ── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          Orders by Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATUS_ORDER.map((status) => {
            const count = stats?.ordersByStatus?.[status] ?? 0;
            return (
              <div
                key={status}
                className="flex flex-col items-center rounded-xl border border-border bg-muted/30 p-4 text-center"
              >
                <span className={`text-2xl font-bold ${count > 0 ? "text-foreground" : "text-muted-foreground/40"}`}>
                  {count}
                </span>
                <Badge className={`mt-2 text-[10px] border ${STATUS_STYLES[status]}`}>
                  {STATUS_LABELS[status]}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        {!recentOrders?.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="font-medium truncate max-w-[140px]">
                    {order.vendor_store_name || order.vendor_name || "Store"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{Number(order.total_amount).toFixed(2)}</span>
                  <Badge className={`border text-xs ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewPage;
