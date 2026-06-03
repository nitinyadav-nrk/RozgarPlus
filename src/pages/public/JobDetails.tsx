import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetJob, getGetJobQueryKey, useSaveJob, getListSavedJobsQueryKey } from "@/api-client";
import { Building, MapPin, Clock, IndianRupee, Briefcase, Calendar, ChevronLeft, BookmarkPlus, Share2 } from "lucide-react";
import { ApplicationModal } from "@/components/shared/ApplicationModal";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function JobDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const jobId = parseInt(id || "0", 10);
  
  const { data: job, isLoading } = useGetJob(jobId, { 
    query: { 
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId) 
    } 
  });
  
  const saveJob = useSaveJob();
  
  const handleSave = () => {
    if (!user) {
      toast({ title: "Please login to save jobs", variant: "default" });
      setLocation("/login");
      return;
    }
    
    saveJob.mutate({ data: { jobId } }, {
      onSuccess: () => {
        toast({ title: "Job saved to your dashboard" });
        queryClient.invalidateQueries({ queryKey: getListSavedJobsQueryKey() });
      }
    });
  };
  
  const handleApplyClick = () => {
    if (!user) {
      toast({ title: "Please login to apply", variant: "default" });
      setLocation("/login");
      return;
    }
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-24 mb-8" />
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <div className="flex gap-4 mb-8">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p className="text-muted-foreground mb-8">The job you are looking for does not exist or has been removed.</p>
          <Button onClick={() => setLocation("/jobs")}>Browse All Jobs</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => setLocation("/jobs")} className="mb-6 -ml-4 gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge>{job.category}</Badge>
                {job.featured && <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Featured</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span className="font-medium text-foreground">{job.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 shrink-0">
              <Button size="lg" className="w-full md:w-48 text-base h-12" onClick={handleApplyClick}>
                Apply Now
              </Button>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-12 w-12 flex-1 md:flex-none" onClick={handleSave}>
                  <BookmarkPlus className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-12 w-12 flex-1 md:flex-none">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">About the Role</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {job.fullDescription ? (
                <div dangerouslySetInnerHTML={{ __html: job.fullDescription }} className="whitespace-pre-wrap" />
              ) : (
                <p className="whitespace-pre-wrap">{job.shortDescription || "No detailed description provided."}</p>
              )}
            </div>
          </section>
          
          {job.skillsRequired && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.split(',').map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-sm py-1.5 px-4 bg-background">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Job Overview</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary</p>
                  <p className="font-medium">{job.salary || 'Not disclosed'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Type</p>
                  <p className="font-medium">{job.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Deadline</p>
                  <p className="font-medium">{job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'Rolling'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Application Fee</span>
                <span className="text-xl font-bold">₹{job.applyFee}</span>
              </div>
              <Button className="w-full" onClick={handleApplyClick}>Apply for this job</Button>
            </div>
          </div>
        </div>
      </div>
      
      {job && (
        <ApplicationModal 
          job={job} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </Layout>
  );
}
