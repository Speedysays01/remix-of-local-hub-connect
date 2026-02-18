import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LayoutDashboard, Users, Store, Bike, ShoppingBag, BarChart3,
  AlertTriangle, Settings, Shield,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Vendors", href: "/admin/vendors", icon: Store },
  { label: "Delivery Partners", href: "/admin/delivery", icon: Bike },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const StatCard: React.FC<{
  label: string; value: string; sub: string; color: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = ({ label, value, sub, color, icon: Icon }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout navItems={navItems} role="admin" title="Platform Overview">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Platform Overview</h2>
          <p className="mt-1 text-muted-foreground">
            Monitor and manage the entire SwiftLocal ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value="0"
            sub="Registered customers"
            color="hsl(var(--role-user))"
            icon={Users}
          />
          <StatCard
            label="Active Vendors"
            value="0"
            sub="Listed stores"
            color="hsl(var(--role-vendor))"
            icon={Store}
          />
          <StatCard
            label="Delivery Partners"
            value="0"
            sub="Active riders"
            color="hsl(var(--role-delivery))"
            icon={Bike}
          />
          <StatCard
            label="Total Orders"
            value="0"
            sub="All time"
            color="hsl(var(--role-admin))"
            icon={ShoppingBag}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Platform Activity</h3>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Order and revenue charts will appear here.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            {[
              { label: "Approve vendors", icon: Store, color: "hsl(var(--role-vendor))" },
              { label: "Manage users", icon: Users, color: "hsl(var(--role-user))" },
              { label: "Review reports", icon: AlertTriangle, color: "hsl(var(--destructive))" },
              { label: "Platform settings", icon: Settings, color: "hsl(var(--role-admin))" },
            ].map((action) => (
              <div
                key={action.label}
                className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={{ background: `${action.color}15` }}
                >
                  <action.icon className="h-4 w-4" style={{ color: action.color }} />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-role-vendor" />
            <h3 className="font-semibold">System Status</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Auth Service", status: "Operational" },
              { label: "Database", status: "Operational" },
              { label: "Payment Gateway", status: "Not configured" },
              { label: "Notifications", status: "Not configured" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full shrink-0 ${
                  s.status === "Operational" ? "bg-role-vendor" : "bg-muted-foreground/40"
                }`} />
                <div>
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className={`text-xs ${
                    s.status === "Operational" ? "text-role-vendor" : "text-muted-foreground"
                  }`}>{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
