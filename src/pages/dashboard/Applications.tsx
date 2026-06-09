import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListMyApplications, getListMyApplicationsQueryKey } from "@/api-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function MyApplications() {
  const { data, isLoading } = useListMyApplications({ query: { queryKey: getListMyApplicationsQueryKey() } });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-xl p-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="sm:w-32">
                  <Skeleton className="h-8 w-24 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((app) => (
              <div key={app.id} className="border rounded-xl p-6 bg-card flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{app.job.title}</h3>
                    <Link href={`/jobs/${app.jobId}`}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {app.job.companyName}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {app.job.location}</span>
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  {app.adminNote && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm border-l-2 border-primary">
                      <span className="font-medium text-foreground">Note from Admin:</span> {app.adminNote}
                    </div>
                  )}
                </div>
                <div className="sm:text-right">
                  <Badge variant="outline" className={`${getStatusColor(app.status)} px-3 py-1 text-sm capitalize`}>
                    {app.status}
                  </Badge>
                  {app.utrNumber && <p className="text-xs text-muted-foreground mt-2">UTR: {app.utrNumber}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border rounded-xl bg-muted/10">
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6">You haven't applied to any jobs yet.</p>
            <Link href="/jobs">
              <span className="text-primary hover:underline font-medium cursor-pointer">Browse Jobs</span>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
