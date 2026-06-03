import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useLogout } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/shared/Logo";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoutMutation = useLogout();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        toast({ title: "Logged out successfully" });
        setLocation("/");
      }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2.5">
          <Logo size={32} />
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">RozgarPlus</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center flex-1">
          <Link href="/jobs" className="text-sm font-medium transition-colors hover:text-primary">Find Jobs</Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">About</Link>
          <Link href="/services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Services</Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Contact</Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    {user.role === "admin" ? "Admin" : "Dashboard"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="flex flex-col space-y-4">
            <Link href="/jobs" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Find Jobs</Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/services" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Contact</Link>
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <UserIcon className="h-4 w-4" />
                    {user.role === "admin" ? "Admin" : "Dashboard"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
