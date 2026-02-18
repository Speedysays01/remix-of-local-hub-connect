import React from "react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Loader2, Users, Phone, Calendar } from "lucide-react";

const AdminUsersPage: React.FC = () => {
  const { data: users, isLoading } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Customers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{users?.length ?? 0} registered users</p>
      </div>

      {!users?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 px-5 py-3 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
            <span>Name</span>
            <span>Phone</span>
            <span>Joined</span>
          </div>
          {/* Rows */}
          {users.map((u, i) => (
            <div
              key={u.user_id}
              className={`grid grid-cols-3 px-5 py-3.5 items-center text-sm ${
                i < users.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-role-user/10 shrink-0">
                  <Users className="h-3.5 w-3.5 text-role-user" />
                </div>
                <span className="font-medium truncate">{u.full_name || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {u.phone ? (
                  <>
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{u.phone}</span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>
                  {new Date(u.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
