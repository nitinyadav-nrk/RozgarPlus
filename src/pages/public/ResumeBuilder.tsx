import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { BriefcaseBusiness, Plus, Save, Trash2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customFetch } from "@/api-client/custom-fetch";
import { useToast } from "@/hooks/use-toast";

type Experience = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
};

type ResumeBuilderForm = {
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  location: string;
  industryType: string;
  education: string;
  skills: string;
  summary: string;
  experiences: Experience[];
};

const emptyExperience: Experience = {
  companyName: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
};

const industries = [
  "IT / Software",
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Other",
];

export default function ResumeBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ResumeBuilderForm>({
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    location: "",
    industryType: "",
    education: "",
    skills: "",
    summary: "",
    experiences: [{ ...emptyExperience }],
  });

  const updateField = (name: keyof Omit<ResumeBuilderForm, "experiences">, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      experiences: current.experiences.map((experience, i) =>
        i === index ? { ...experience, [field]: value } : experience,
      ),
    }));
  };

  const addExperience = () => {
    setForm((current) => ({
      ...current,
      experiences:
        current.experiences.length >= 3
          ? current.experiences
          : [...current.experiences, { ...emptyExperience }],
    }));
  };

  const removeExperience = (index: number) => {
    setForm((current) => ({
      ...current,
      experiences:
        current.experiences.length === 1
          ? current.experiences
          : current.experiences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await customFetch("/api/resume-builders", {
        method: "POST",
        responseType: "json",
        body: JSON.stringify(form),
      });

      toast({
        title: "Resume building data saved",
        description: "Your details have been sent to the RozgarPlus team.",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Unable to save details",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border-b">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resume Building
              </p>
              <h1 className="text-3xl font-bold">Share Your Resume Details</h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Fill your basic details, preferred industry, and company-wise experience.
            Admin team will review this data from the dashboard.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-card border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-5">Basic Details</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => updateField("location", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industryType">Industry Type</Label>
                <select
                  id="industryType"
                  value={form.industryType}
                  onChange={(e) => updateField("industryType", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-5">Profile Details</h2>
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input id="education" value={form.education} onChange={(e) => updateField("education", e.target.value)} placeholder="B.Tech, MBA, 12th, Diploma..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" value={form.skills} onChange={(e) => updateField("skills", e.target.value)} placeholder="React, Excel, Sales, Communication..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Short Career Summary</Label>
                <Textarea id="summary" value={form.summary} onChange={(e) => updateField("summary", e.target.value)} rows={4} />
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-xl font-semibold">Company Experience</h2>
              <Button type="button" variant="outline" onClick={addExperience} disabled={form.experiences.length >= 3}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </div>

            <div className="space-y-5">
              {form.experiences.map((experience, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Company {index + 1}</h3>
                    {form.experiences.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={experience.companyName} onChange={(e) => updateExperience(index, "companyName", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input value={experience.jobTitle} onChange={(e) => updateExperience(index, "jobTitle", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="month" value={experience.startDate} onChange={(e) => updateExperience(index, "startDate", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={experience.endDate}
                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        disabled={experience.currentlyWorking}
                      />
                    </div>
                    <label className="md:col-span-2 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={experience.currentlyWorking}
                        onChange={(e) => updateExperience(index, "currentlyWorking", e.target.checked)}
                      />
                      Currently working here
                    </label>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Work Details</Label>
                      <Textarea value={experience.description} onChange={(e) => updateExperience(index, "description", e.target.value)} rows={3} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Resume Data"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
