import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/manual-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, FileText } from "lucide-react";
import { useState } from "react";

type Experience = {
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string;
  description: string;
};

type ResumeForm = {
  name: string;
  gender: string;
  phone: string;
  email: string;
  location: string;
  education: string;
  industryType: string;
  skills: string;
  careerSummary: string;
  experiences: Experience[];
};

type SavedResume = ResumeForm & {
  id: number;
  createdAt: string;
};

const industries = [
  "Information Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Marketing",
  "Construction",
  "Hospitality",
  "Other",
];

const emptyExperience: Experience = {
  companyName: "",
  designation: "",
  startDate: "",
  endDate: "",
  description: "",
};

const initialForm: ResumeForm = {
  name: "",
  gender: "",
  phone: "",
  email: "",
  location: "",
  education: "",
  industryType: "",
  skills: "",
  careerSummary: "",
  experiences: [{ ...emptyExperience }],
};

export default function ResumeBuilder() {
  const [form, setForm] = useState<ResumeForm>(initialForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedResumes, isLoading } = useQuery({
    queryKey: ["resume-building", "mine"],
    queryFn: () => authFetch<SavedResume[]>("/api/resume-building/mine"),
  });

  const saveResume = useMutation({
    mutationFn: (payload: ResumeForm) =>
      authFetch<SavedResume>("/api/resume-building", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast({ title: "Resume data saved successfully" });
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["resume-building", "mine"] });
    },
    onError: (err: Error) => {
      toast({ title: "Resume data save nahi hua", description: err.message, variant: "destructive" });
    },
  });

  const updateField = (field: keyof ResumeForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setForm((current) => ({
      ...current,
      experiences: current.experiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setForm((current) => ({
      ...current,
      experiences: [...current.experiences, { ...emptyExperience }],
    }));
  };

  const removeExperience = (index: number) => {
    setForm((current) => ({
      ...current,
      experiences:
        current.experiences.length === 1
          ? current.experiences
          : current.experiences.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveResume.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground mt-2">Basic details aur company-wise experience save karein.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 shadow-sm space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Full name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              <Select value={form.gender} onValueChange={(value) => updateField("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Phone number" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <Input placeholder="Email address" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              <Input placeholder="Current location" value={form.location} onChange={(e) => updateField("location", e.target.value)} />
              <Input placeholder="Highest education" value={form.education} onChange={(e) => updateField("education", e.target.value)} />
              <Select value={form.industryType} onValueChange={(value) => updateField("industryType", value)}>
                <SelectTrigger className="md:col-span-2">
                  <SelectValue placeholder="Select industry type" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <Textarea
                placeholder="Skills, comma separated"
                value={form.skills}
                onChange={(e) => updateField("skills", e.target.value)}
              />
              <Textarea
                placeholder="Career summary"
                value={form.careerSummary}
                onChange={(e) => updateField("careerSummary", e.target.value)}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">Company Experience</h2>
              <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-2" /> Add Company
              </Button>
            </div>

            <div className="space-y-4">
              {form.experiences.map((experience, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-medium">Company {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Company name"
                      value={experience.companyName}
                      onChange={(e) => updateExperience(index, "companyName", e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Designation"
                      value={experience.designation}
                      onChange={(e) => updateExperience(index, "designation", e.target.value)}
                      required
                    />
                    <Input
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      required
                    />
                    <Input
                      type="month"
                      value={experience.endDate}
                      onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                    />
                    <Textarea
                      className="md:col-span-2"
                      placeholder="Work details"
                      value={experience.description}
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Button type="submit" disabled={saveResume.isPending}>
            {saveResume.isPending ? "Saving..." : "Save Resume Data"}
          </Button>
        </form>

        <div className="mt-10 bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Saved Resume Entries</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Saved On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
              ) : savedResumes && savedResumes.length > 0 ? (
                savedResumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell className="font-medium">{resume.name}</TableCell>
                    <TableCell>{resume.industryType}</TableCell>
                    <TableCell>{resume.experiences.length}</TableCell>
                    <TableCell>{new Date(resume.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No resume data saved yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
