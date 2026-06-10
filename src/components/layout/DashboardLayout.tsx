import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Briefcase, Bookmark, User, Crown,
  FileText, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "My Applications", icon: Briefcase },
  { href: "/dashboard/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/dashboard/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/dashboard/subscription", label: "Subscription", icon: Crown },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
        <Link href="/">
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RozgarPlus</span>
        </Link>
      </div>

      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="ml-auto h-4 w-4" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t space-y-2">
        <Link href="/jobs" onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Briefcase className="h-4 w-4 shrink-0" />
            Browse Jobs
          </div>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-red-50" onClick={handleLogout}>
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
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-background border-r z-50 shadow-xl">
            <button className="absolute top-4 right-4 p-1 rounded" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-20 bg-background border-b h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu className="h-5 w-5" /></button>
          <Logo size={24} />
          <span className="font-bold text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RozgarPlus</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
