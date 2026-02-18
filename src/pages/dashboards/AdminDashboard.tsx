import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Bike, ShoppingBag, Settings, ClipboardCheck,
} from "lucide-react";
import AdminOverviewPage  from "@/pages/admin/AdminOverviewPage";
import AdminVendorsPage   from "@/pages/admin/AdminVendorsPage";
import AdminOrdersPage    from "@/pages/admin/AdminOrdersPage";
import AdminUsersPage     from "@/pages/admin/AdminUsersPage";
import AdminDeliveryPage  from "@/pages/admin/AdminDeliveryPage";
import AdminVendorApprovalsPage from "@/pages/admin/AdminVendorApprovalsPage";

const navItems = [
  { label: "Overview",    href: "/admin",            icon: LayoutDashboard },
  { label: "Approvals",   href: "/admin/approvals",  icon: ClipboardCheck },
  { label: "Users",       href: "/admin/users",       icon: Users },
  { label: "Vendors",     href: "/admin/vendors",    icon: Store },
  { label: "Riders",      href: "/admin/delivery",   icon: Bike },
  { label: "Orders",      href: "/admin/orders",     icon: ShoppingBag },
  { label: "Settings",    href: "/admin/settings",   icon: Settings },
];

const AdminDashboard: React.FC = () => (
  <DashboardLayout navItems={navItems} role="admin" title="Admin">
    <Routes>
      <Route index element={<AdminOverviewPage />} />
      <Route path="approvals" element={<AdminVendorApprovalsPage />} />
      <Route path="users"     element={<AdminUsersPage />} />
      <Route path="vendors"   element={<AdminVendorsPage />} />
      <Route path="delivery"  element={<AdminDeliveryPage />} />
      <Route path="orders"    element={<AdminOrdersPage />} />
      <Route path="*"         element={<AdminOverviewPage />} />
    </Routes>
  </DashboardLayout>
);

export default AdminDashboard;

