import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Mic2,
  GraduationCap,
  Compass,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const services = [
  {
    icon: FileText,
    color: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
    title: "Resume Building",
    tagline: "Stand out from the crowd",
    description:
      "Our experts craft ATS-optimised, professionally formatted resumes tailored to your target role and industry. First impressions count — let's make yours unforgettable.",
    features: [
      "ATS-friendly formatting",
      "Industry-specific templates",
      "Keyword optimisation",
      "Unlimited revisions",
    ],
  },
  {
    icon: Search,
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
    title: "Job Searching Assistant",
    tagline: "Find the right fit, faster",
    description:
      "We do the heavy lifting for you — scouting verified openings, matching your profile to roles, and alerting you the moment your ideal job drops.",
    features: [
      "Personalised job alerts",
      "Profile-to-role matching",
      "Hidden market access",
      "Weekly shortlisted roles",
    ],
  },
  {
    icon: Mic2,
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
    title: "Interview Coach",
    tagline: "Walk in confident, walk out hired",
    description:
      "Mock interviews, real-time feedback, and proven frameworks to help you answer tough questions, negotiate salary, and leave a lasting impression on every panel.",
    features: [
      "1-on-1 mock interviews",
      "STAR method coaching",
      "Salary negotiation tips",
      "Post-session feedback",
    ],
  },
  {
    icon: GraduationCap,
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
    title: "Placement Support",
    tagline: "From offer to onboarding",
    description:
      "End-to-end placement assistance — from shortlisting companies to offer letter review. We stay with you until you're officially placed and ready for day one.",
    features: [
      "Company shortlisting",
      "Offer letter review",
      "Background check guidance",
      "Onboarding checklist",
    ],
  },
  {
    icon: Compass,
    color: "bg-rose-50 text-rose-600",
    border: "border-rose-100",
    title: "Career Counselling",
    tagline: "Clarity for every crossroad",
    description:
      "Feeling stuck or switching fields? Our counsellors map your strengths, interests, and market demand to chart a career path that actually excites you.",
    features: [
      "Strengths assessment",
      "Career path mapping",
      "Industry insights",
      "Long-term goal setting",
    ],
  },
  {
    icon: Zap,
    color: "bg-cyan-50 text-cyan-600",
    border: "border-cyan-100",
    title: "Skill Development",
    tagline: "Upskill. Outshine. Advance.",
    description:
      "Curated learning paths, live workshops, and certifications that plug the exact skill gaps employers are watching for — so you're always market-ready.",
    features: [
      "Curated learning paths",
      "Live workshops",
      "Industry certifications",
      "Progress tracking",
    ],
  },
];

export default function Services() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-5">
            Everything you need
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Services Built for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Growth
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From crafting the perfect resume to landing the offer — we provide
            end-to-end career support so you never navigate the job market alone.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="gap-2 px-8">
                Browse Jobs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`group rounded-2xl border ${service.border} bg-white p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col`}
              >
                <div className={`${service.color} w-12 h-12 rounded-xl flex items-center justify-center mb-5 shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {service.tagline}
                </p>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {service.title === "Resume Building" && (
                  <Link href="/resume-builder">
                    <Button className="mt-6 w-full gap-2">
                      Fill Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t bg-gradient-to-r from-indigo-600 to-violet-600 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to accelerate your career?
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Subscribe for ₹21/year and unlock all our job listings, or reach out
            to our team to learn more about premium career services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
