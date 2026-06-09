import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListSavedJobs, getListSavedJobsQueryKey, useUnsaveJob } from "@/api-client";
import { JobCard } from "@/components/shared/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { BookmarkMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SavedJobs() {
  const { data, isLoading } = useListSavedJobs({ query: { queryKey: getListSavedJobsQueryKey() } });
  const unsaveJob = useUnsaveJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUnsave = (e: React.MouseEvent, jobId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    unsaveJob.mutate({ jobId }, {
      onSuccess: () => {
        toast({ title: "Job removed from saved list" });
        queryClient.invalidateQueries({ queryKey: getListSavedJobsQueryKey() });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Saved Jobs</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-6 h-[240px] flex flex-col">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-10 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((job) => (
              <div key={job.id} className="relative">
                <JobCard job={job} />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
                  onClick={(e) => handleUnsave(e, job.id)}
                >
                  <BookmarkMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border rounded-xl bg-muted/10 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">No saved jobs</h3>
            <p className="text-muted-foreground mb-6">Jobs you save while browsing will appear here.</p>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
