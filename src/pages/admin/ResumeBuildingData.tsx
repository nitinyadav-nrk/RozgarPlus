import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authFetch } from "@/lib/manual-api";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

type Experience = {
  companyName: string;
  designation: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
};

type AdminResume = {
  id: number;
  name: string;
  gender: string;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  education?: string | null;
  industryType: string;
  skills?: string | null;
  careerSummary?: string | null;
  experiences: Experience[];
  createdAt: string;
  userEmail?: string | null;
};

type AdminResumeResponse = {
  resumes: AdminResume[];
  total: number;
};

export default function ResumeBuildingData() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "resume-building"],
    queryFn: () => authFetch<AdminResumeResponse>("/api/admin/resume-building"),
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Resume Building Data</h1>
            <p className="text-muted-foreground mt-1">{data?.total ?? 0} saved entries</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Basic Details</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Saved On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : data?.resumes && data.resumes.length > 0 ? (
                data.resumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell className="min-w-52">
                      <div className="font-semibold">{resume.name}</div>
                      <div className="text-xs text-muted-foreground">{resume.email || resume.userEmail || "No email"}</div>
                      {resume.phone && <div className="text-xs text-muted-foreground">{resume.phone}</div>}
                    </TableCell>
                    <TableCell className="min-w-48">
                      <div className="text-sm capitalize">{resume.gender}</div>
                      {resume.location && <div className="text-xs text-muted-foreground">{resume.location}</div>}
                      {resume.education && <div className="text-xs text-muted-foreground">{resume.education}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{resume.industryType}</Badge>
                      {resume.skills && <p className="mt-2 text-xs text-muted-foreground max-w-56">{resume.skills}</p>}
                    </TableCell>
                    <TableCell className="min-w-72">
                      <div className="space-y-2">
                        {resume.experiences.map((experience, index) => (
                          <div key={`${resume.id}-${index}`} className="rounded-md border bg-muted/20 p-2">
                            <div className="text-sm font-medium">{experience.companyName}</div>
                            <div className="text-xs text-muted-foreground">
                              {experience.designation} | {experience.startDate} - {experience.endDate || "Present"}
                            </div>
                            {experience.description && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-md">{experience.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(resume.createdAt).toLocaleDateString()}</TableCell>
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
