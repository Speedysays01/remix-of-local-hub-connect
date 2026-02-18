import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LogOut, Zap, User, ChevronRight,
  Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: AppRole;
  title: string;
  /** Optional extra actions rendered in the header (e.g. cart button) */
  headerActions?: React.ReactNode;
}

const ROLE_BADGE_COLORS: Record<AppRole, string> = {
  admin: "bg-role-admin/15 text-role-admin",
  vendor: "bg-role-vendor/15 text-role-vendor",
  delivery: "bg-role-delivery/15 text-role-delivery",
  user: "bg-role-user/15 text-role-user",
};

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  vendor: "Vendor",
  delivery: "Delivery Partner",
  user: "Customer",
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems,
  role,
  title,
  headerActions,
}) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white">Deals Nearby</span>
          <div className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ml-2",
            ROLE_BADGE_COLORS[role]
          )}>
            {ROLE_LABELS[role]}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 sidebar-gradient flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 sidebar-gradient z-50 animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {headerActions}
            <div className={cn(
              "hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              ROLE_BADGE_COLORS[role]
            )}>
              {ROLE_LABELS[role]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
