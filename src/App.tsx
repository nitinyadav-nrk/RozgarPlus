import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/public/Home";
import Jobs from "@/pages/public/Jobs";
import JobDetails from "@/pages/public/JobDetails";
import About from "@/pages/public/About";
import Services from "@/pages/public/Services";
import Contact from "@/pages/public/Contact";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/dashboard/Dashboard";
import Applications from "@/pages/dashboard/Applications";
import SavedJobs from "@/pages/dashboard/SavedJobs";
import Profile from "@/pages/dashboard/Profile";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminJobs from "@/pages/admin/Jobs";
import AdminJobForm from "@/pages/admin/JobForm";
import AdminApplications from "@/pages/admin/Applications";
import AdminPayments from "@/pages/admin/Payments";
import AdminUsers from "@/pages/admin/Users";
import AdminSubscriptions from "@/pages/admin/Subscriptions";

import Subscription from "@/pages/dashboard/Subscription";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetails} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/contact" component={Contact} />
      
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/applications" component={() => <ProtectedRoute component={Applications} />} />
      <Route path="/dashboard/saved-jobs" component={() => <ProtectedRoute component={SavedJobs} />} />
      <Route path="/dashboard/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/dashboard/subscription" component={() => <ProtectedRoute component={Subscription} />} />
      
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} adminOnly={true} />} />
      <Route path="/admin/jobs" component={() => <ProtectedRoute component={AdminJobs} adminOnly={true} />} />
      <Route path="/admin/jobs/new" component={() => <ProtectedRoute component={AdminJobForm} adminOnly={true} />} />
      <Route path="/admin/jobs/:id/edit" component={() => <ProtectedRoute component={AdminJobForm} adminOnly={true} />} />
      <Route path="/admin/applications" component={() => <ProtectedRoute component={AdminApplications} adminOnly={true} />} />
      <Route path="/admin/payments" component={() => <ProtectedRoute component={AdminPayments} adminOnly={true} />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} adminOnly={true} />} />
      <Route path="/admin/subscriptions" component={() => <ProtectedRoute component={AdminSubscriptions} adminOnly={true} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;