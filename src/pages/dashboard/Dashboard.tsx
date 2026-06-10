import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetUserDashboardStats, getGetUserDashboardStatsQueryKey, useGetMySubscription, getGetMySubscriptionQueryKey } from "@/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, CheckCircle2, Bookmark, Crown, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetUserDashboardStats({
    query: { queryKey: getGetUserDashboardStatsQueryKey() }
  });
  const { data: subscription } = useGetMySubscription({ query: { retry: false, queryKey: getGetMySubscriptionQueryKey() } });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => (
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalApplications || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{stats?.pendingApplications || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.approvedApplications || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saved Jobs</CardTitle>
                <Bookmark className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.savedJobs || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/applications">
                <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Briefcase className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-1">My Applications</h3>
                  <p className="text-sm text-muted-foreground">Track status and view history</p>
                </div>
              </Link>
              <Link href="/dashboard/saved-jobs">
                <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Bookmark className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-1">Saved Jobs</h3>
                  <p className="text-sm text-muted-foreground">View jobs you've bookmarked</p>
                </div>
              </Link>
              <Link href="/dashboard/subscription">
                <div className="p-6 border rounded-xl hover:border-amber-200 hover:bg-amber-50/50 transition-colors cursor-pointer relative overflow-hidden">
                  <Crown className="h-8 w-8 mb-4 text-amber-500" />
                  <h3 className="font-semibold text-lg mb-1">My Subscription</h3>
                  <p className="text-sm text-muted-foreground">₹21/year — unlimited applications</p>
                  {subscription?.status === "active" ? (
                    <Badge className="absolute top-4 right-4 bg-green-100 text-green-800 border-none text-xs">Active</Badge>
                  ) : subscription?.status === "pending" ? (
                    <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-800 border-none text-xs">Pending</Badge>
                  ) : null}
                </div>
              </Link>
              <Link href="/dashboard/resume-builder">
                <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-1">Resume Builder</h3>
                  <p className="text-sm text-muted-foreground">Save basic details and company experience</p>
                </div>
              </Link>
              <Link href="/jobs">
                <div className="p-6 border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer sm:col-span-2">
                  <h3 className="font-semibold text-lg mb-1">Browse New Jobs</h3>
                  <p className="text-sm text-muted-foreground">Find your next opportunity</p>
                </div>
              </Link>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Profile</h2>
            <div className="border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-4">Keep your profile updated to increase your chances of getting hired.</p>
              <Link href="/dashboard/profile" className="text-primary hover:underline text-sm font-medium">
                Edit Profile &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
