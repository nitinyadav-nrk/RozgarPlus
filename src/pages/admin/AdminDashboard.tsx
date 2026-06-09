import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, IndianRupee, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <Link href="/admin/jobs/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90">
            Post New Job
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">₹{stats?.revenue?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.activeJobs || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalJobs || 0} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{stats?.pendingPayments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved Apps</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.approvedApplications || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Apps</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.rejectedApplications || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Featured Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats?.featuredJobs || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Admin Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/jobs">
            <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer bg-card">
              <Briefcase className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-1">Manage Jobs</h3>
              <p className="text-sm text-muted-foreground">Add, edit, pause or feature job listings</p>
            </div>
          </Link>
          <Link href="/admin/applications">
            <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer bg-card">
              <FileText className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-1">Applications</h3>
              <p className="text-sm text-muted-foreground">Review and update application statuses</p>
            </div>
          </Link>
          <Link href="/admin/payments">
            <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer bg-card">
              <IndianRupee className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-1">Payments</h3>
              <p className="text-sm text-muted-foreground">Verify UTR numbers and screenshots</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer bg-card">
              <Users className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-1">Users</h3>
              <p className="text-sm text-muted-foreground">Manage user accounts and block access</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
