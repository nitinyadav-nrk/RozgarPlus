import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customFetch } from "@/api-client/custom-fetch";

type ResumeExperience = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  description?: string | null;
};

type ResumeBuilder = {
  id: number;
  userName: string | null;
  userEmail: string | null;
  fullName: string;
  gender: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  industryType: string;
  education?: string | null;
  skills?: string | null;
  summary?: string | null;
  experiences: ResumeExperience[];
  createdAt: string;
};

type ResumeBuilderResponse = {
  resumeBuilders: ResumeBuilder[];
  total: number;
};

export default function AdminResumeBuilders() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminResumeBuilders"],
    queryFn: () => customFetch<ResumeBuilderResponse>("/api/admin/resume-builders", { responseType: "json" }),
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Resume Building Data</h1>
            <p className="text-sm text-muted-foreground">Candidate details submitted from the resume builder form.</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Company Experience</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-12 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-14 w-56" /></TableCell>
                    <TableCell><Skeleton className="h-16 w-72" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : data?.resumeBuilders && data.resumeBuilders.length > 0 ? (
                data.resumeBuilders.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell>
                      <div className="font-semibold">{item.fullName}</div>
                      <div className="text-xs text-muted-foreground">{item.email}</div>
                      {item.phone && <div className="text-xs text-muted-foreground">{item.phone}</div>}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <Badge variant="secondary">{item.gender}</Badge>
                        {item.location && <Badge variant="outline">{item.location}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="whitespace-nowrap">{item.industryType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {item.education && <div className="text-sm"><span className="font-medium">Education:</span> {item.education}</div>}
                      {item.skills && <div className="text-sm mt-1"><span className="font-medium">Skills:</span> {item.skills}</div>}
                      {item.summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{item.summary}</p>}
                    </TableCell>
                    <TableCell className="min-w-[280px]">
                      <div className="space-y-3">
                        {item.experiences.map((experience, index) => (
                          <div key={`${item.id}-${index}`} className="rounded-md border bg-muted/20 p-3">
                            <div className="text-sm font-semibold">{experience.companyName}</div>
                            <div className="text-xs text-muted-foreground">{experience.jobTitle}</div>
                            <div className="text-xs mt-1">
                              {experience.startDate} - {experience.currentlyWorking ? "Present" : experience.endDate || "N/A"}
                            </div>
                            {experience.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{experience.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No resume building data found.
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
