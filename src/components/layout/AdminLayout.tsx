import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout, useGetDashboardStats, getGetDashboardStatsQueryKey } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  IndianRupee,
  Users,
  Crown,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: stats } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const pendingApplications =
    stats
      ? Math.max(
          0,
          stats.totalApplications - stats.approvedApplications - stats.rejectedApplications
        )
      : 0;
  const pendingPayments = stats?.pendingPayments ?? 0;

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { href: "/admin/jobs", label: "Manage Jobs", icon: Briefcase, badge: 0 },
    { href: "/admin/applications", label: "Applications", icon: FileText, badge: pendingApplications },
    { href: "/admin/payments", label: "Payments", icon: IndianRupee, badge: pendingPayments },
    { href: "/admin/users", label: "Users", icon: Users, badge: 0 },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: Crown, badge: 0 },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        toast({ title: "Logged out successfully" });
        setLocation("/");
      },
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-5 border-b shrink-0 gap-2.5">
        <Logo size={28} />
        <div className="flex flex-col leading-none">
          <span className="font-bold text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RozgarPlus</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> Admin</span>
        </div>
      </div>

      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-primary font-medium">Administrator</p>
          </div>
        </div>
      </div>

      {(pendingApplications > 0 || pendingPayments > 0) && (
        <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-1">Needs Attention</p>
          <div className="flex flex-col gap-0.5">
            {pendingApplications > 0 && (
              <p className="text-xs text-amber-600">
                {pendingApplications} pending application{pendingApplications !== 1 ? "s" : ""}
              </p>
            )}
            {pendingPayments > 0 && (
              <p className="text-xs text-amber-600">
                {pendingPayments} unverified payment{pendingPayments !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = location === href;
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-red-500 text-white"
                    )}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                {active && badge === 0 && <ChevronRight className="h-4 w-4" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t space-y-2">
        <Link href="/" onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Briefcase className="h-4 w-4 shrink-0" />
            View Public Site
          </div>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-background border-r z-30">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-background border-r z-50 shadow-xl">
            <button
              className="absolute top-4 right-4 p-1 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-20 bg-background border-b h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 relative">
            <Menu className="h-5 w-5" />
            {(pendingApplications > 0 || pendingPayments > 0) && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">Admin Portal</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
