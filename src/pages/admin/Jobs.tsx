import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminListJobs, getAdminListJobsQueryKey, useUpdateJobStatus, useToggleJobFeatured, useDeleteJob } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Power, Star, StarOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminJobs() {
  const { data, isLoading } = useAdminListJobs({}, { query: { queryKey: getAdminListJobsQueryKey({}) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateStatus = useUpdateJobStatus();
  const toggleFeatured = useToggleJobFeatured();
  const deleteJob = useDeleteJob();

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({ title: `Job marked as ${newStatus}` });
          queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey({}) });
        }
      }
    );
  };

  const handleFeatureToggle = (id: number, featured: boolean) => {
    toggleFeatured.mutate(
      { id, data: { featured: !featured } },
      {
        onSuccess: () => {
          toast({ title: `Job feature status updated` });
          queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey({}) });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this job? This cannot be undone.")) {
      deleteJob.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Job deleted" });
            queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey({}) });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <Link href="/admin/jobs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Post New Job
            </Button>
          </Link>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Apps</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.jobs && data.jobs.length > 0 ? (
                data.jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.location} • ₹{job.applyFee} Fee</div>
                    </TableCell>
                    <TableCell>{job.companyName}</TableCell>
                    <TableCell>
                      <Badge variant={job.status === "active" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                      {job.featured && <Badge variant="outline" className="ml-2 text-accent border-accent/30 bg-accent/5">Featured</Badge>}
                    </TableCell>
                    <TableCell>{job.applicationCount || 0}</TableCell>
                    <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title={job.featured ? "Unfeature" : "Feature"}
                          onClick={() => handleFeatureToggle(job.id, job.featured)}
                          className={job.featured ? "text-accent" : "text-muted-foreground"}
                        >
                          {job.featured ? <Star className="h-4 w-4" fill="currentColor" /> : <StarOff className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title={job.status === "active" ? "Pause" : "Activate"}
                          onClick={() => handleStatusToggle(job.id, job.status)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No jobs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
