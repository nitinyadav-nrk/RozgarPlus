import { AdminLayout } from "@/components/layout/AdminLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useParams } from "wouter";
import { useCreateJob, useUpdateJob, useGetJob, getGetJobQueryKey, getAdminListJobsQueryKey } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  companyName: z.string().min(2, "Company Name is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Type is required"),
  salary: z.string().optional(),
  applyFee: z.coerce.number().min(0, "Fee must be 0 or positive"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  skillsRequired: z.string().optional(),
  featured: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function AdminJobForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const jobId = parseInt(id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  
  const { data: job, isLoading } = useGetJob(jobId, {
    query: {
      enabled: isEdit && !!jobId,
      queryKey: getGetJobQueryKey(jobId)
    }
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      companyName: "",
      category: "",
      location: "",
      type: "Full-time",
      salary: "",
      applyFee: 0,
      shortDescription: "",
      fullDescription: "",
      skillsRequired: "",
      featured: false,
      expiresAt: "",
    },
  });

  useEffect(() => {
    if (isEdit && job) {
      form.reset({
        title: job.title,
        companyName: job.companyName,
        category: job.category,
        location: job.location,
        type: job.type,
        salary: job.salary || "",
        applyFee: job.applyFee,
        shortDescription: job.shortDescription || "",
        fullDescription: job.fullDescription || "",
        skillsRequired: job.skillsRequired || "",
        featured: job.featured,
        expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : "",
      });
    }
  }, [isEdit, job, form]);

  const onSubmit = (values: JobFormValues) => {
    if (isEdit) {
      updateJob.mutate(
        { id: jobId, data: values },
        {
          onSuccess: () => {
            toast({ title: "Job updated successfully" });
            queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey({}) });
            queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
            setLocation("/admin/jobs");
          },
          onError: (err: any) => {
            toast({ title: "Failed to update job", description: err.message, variant: "destructive" });
          }
        }
      );
    } else {
      createJob.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({ title: "Job created successfully" });
            queryClient.invalidateQueries({ queryKey: getAdminListJobsQueryKey({}) });
            setLocation("/admin/jobs");
          },
          onError: (err: any) => {
            toast({ title: "Failed to create job", description: err.message, variant: "destructive" });
          }
        }
      );
    }
  };

  if (isEdit && isLoading) {
    return <AdminLayout><div className="container py-12">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => setLocation("/admin/jobs")} className="mb-6 -ml-4 gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">{isEdit ? "Edit Job" : "Create New Job"}</h1>
        
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Remote, New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ₹50,000 - ₹80,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Fee (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="skillsRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills Required (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Node.js, TypeScript" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief summary of the role..." className="h-20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed job description, responsibilities, requirements..." className="h-40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Featured Job
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This job will be highlighted and appear at the top of search results.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => setLocation("/admin/jobs")}>Cancel</Button>
                <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>
                  {createJob.isPending || updateJob.isPending ? "Saving..." : isEdit ? "Update Job" : "Create Job"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}
