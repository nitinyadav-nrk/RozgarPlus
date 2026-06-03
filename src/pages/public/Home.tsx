import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight, Search, Briefcase, Zap, ShieldCheck,
  MapPin, Clock, IndianRupee, Star, CheckCircle2,
  Code2, Palette, TrendingUp, Database, Megaphone,
  HeartHandshake, ChevronLeft, ChevronRight, Sparkles,
  Users, Building2, Rocket,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useListJobs, getListJobsQueryKey } from "@/api-client";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  { label: "Engineering", icon: Code2, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Design", icon: Palette, color: "bg-purple-50 text-purple-600 border-purple-100" },
  { label: "Marketing", icon: Megaphone, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { label: "Data Science", icon: Database, color: "bg-green-50 text-green-600 border-green-100" },
  { label: "Finance", icon: TrendingUp, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { label: "Operations", icon: HeartHandshake, color: "bg-red-50 text-red-600 border-red-100" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Frontend Developer",
    company: "TechCorp India",
    text: "Found my dream job in just 3 days! The UPI payment was seamless and admin responded within 24 hours.",
    rating: 5,
    initials: "PS",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Arjun Mehta",
    role: "Product Manager",
    company: "Finova Solutions",
    text: "RozgarPlus has the most genuine listings I've seen. No spam, just real opportunities. Highly recommend!",
    rating: 5,
    initials: "AM",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Sneha Reddy",
    role: "Data Analyst",
    company: "DataFirst",
    text: "The application tracking dashboard is excellent. I always knew exactly where my application stood.",
    rating: 5,
    initials: "SR",
    color: "bg-amber-100 text-amber-700",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create Your Profile",
    desc: "Sign up and build your professional profile in minutes. No lengthy forms.",
    icon: Users,
    color: "text-primary bg-primary/10",
  },
  {
    number: "02",
    title: "Browse & Apply",
    desc: "Explore verified listings and apply instantly with UPI payment — just ₹21/year.",
    icon: Search,
    color: "text-secondary bg-secondary/10",
  },
  {
    number: "03",
    title: "Get Hired",
    desc: "Track your application in real-time and hear back from companies within 24 hours.",
    icon: Rocket,
    color: "text-accent bg-accent/10",
  },
];

const ROTATING_TITLES = ["Frontend Developer", "Data Scientist", "Product Designer", "Marketing Lead", "Backend Engineer", "DevOps Engineer"];

export default function Home() {
  const { user } = useAuth();
  const [titleIdx, setTitleIdx] = useState(0);
  const [titleVisible, setTitleVisible] = useState(true);
  const [jobSlide, setJobSlide] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: jobsData } = useListJobs(
    { page: 1, limit: 6 },
    { query: { queryKey: getListJobsQueryKey({ page: 1, limit: 6 }) } }
  );
  const jobs = jobsData?.jobs ?? [];

  useEffect(() => {
    const id = setInterval(() => {
      setTitleVisible(false);
      setTimeout(() => {
        setTitleIdx(i => (i + 1) % ROTATING_TITLES.length);
        setTitleVisible(true);
      }, 350);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const visibleJobs = 3;
  const maxSlide = Math.max(0, jobs.length - visibleJobs);

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setJobSlide(s => (s >= maxSlide ? 0 : s + 1));
    }, 3500);
  };

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [maxSlide]);

  const prevSlide = () => {
    setJobSlide(s => Math.max(0, s - 1));
    startAuto();
  };
  const nextSlide = () => {
    setJobSlide(s => Math.min(maxSlide, s + 1));
    startAuto();
  };

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background pt-20 pb-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative mx-auto px-4 text-center z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold bg-secondary/10 text-secondary border-secondary/20 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            India's Fastest Growing Job Platform
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
            Land Your Dream Job as a
          </h1>
          <div className="h-16 md:h-20 lg:h-24 flex items-center justify-center mb-6">
            <span
              className={`text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary transition-all duration-300 ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            >
              {ROTATING_TITLES[titleIdx]}
            </span>
          </div>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            A premium marketplace connecting ambitious professionals with verified companies. Apply in seconds, track in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/jobs">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 px-8 shadow-lg shadow-primary/20">
                <Search className="h-5 w-5" /> Browse Jobs
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base h-12 px-8">
                {user ? "My Dashboard" : "Create Free Profile"} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["100% Verified Jobs", "₹21/year only", "24h Response", "No Hidden Fees"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-muted/40 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Active Jobs", icon: Briefcase },
              { value: "10k+", label: "Professionals", icon: Users },
              { value: "25k+", label: "Applications", icon: CheckCircle2 },
              { value: "24h", label: "Avg Response", icon: Clock },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <Icon className="h-5 w-5 text-primary mb-2 opacity-60" />
                <p className="text-3xl md:text-4xl font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">Explore opportunities across top industries</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ label, icon: Icon, color }) => (
              <Link key={label} href={`/jobs?category=${encodeURIComponent(label)}`}>
                <div className={`flex flex-col items-center gap-3 p-5 rounded-2xl border cursor-pointer hover:scale-105 transition-transform ${color} hover:shadow-md`}>
                  <Icon className="h-7 w-7" />
                  <span className="text-sm font-semibold text-center leading-tight">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs Slider ── */}
      {jobs.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Openings</h2>
                <p className="text-muted-foreground">Hand-picked opportunities, updated daily</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  disabled={jobSlide === 0}
                  className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={jobSlide >= maxSlide}
                  className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(calc(-${jobSlide} * (100% / ${visibleJobs}) - ${jobSlide} * 24px / ${visibleJobs}))` }}
              >
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                    <div className="bg-background rounded-2xl border p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {job.featured && (
                            <Badge className="bg-amber-100 text-amber-700 border-none text-xs">Featured</Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">{job.type?.replace(/_/g, " ")}</Badge>
                        </div>
                      </div>
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{job.companyName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {job.salary || "Negotiable"}</span>
                      </div>
                      {job.category && (
                        <div className="mt-4 pt-4 border-t">
                          <Badge variant="secondary" className="text-xs">{job.category}</Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setJobSlide(i); startAuto(); }}
                  className={`h-2 rounded-full transition-all ${i === jobSlide ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/jobs">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Jobs <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From signup to offer letter in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px border-t-2 border-dashed border-muted-foreground/20" />
            {STEPS.map(({ number, title, desc, icon: Icon, color }) => (
              <div key={number} className="flex flex-col items-center text-center relative">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className="absolute -top-2 -right-2 md:static md:mb-3">
                  <span className="text-6xl font-black text-muted-foreground/8 select-none leading-none">{number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why RozgarPlus ── */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Professionals Choose RozgarPlus</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built for India's ambitious workforce</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                color: "bg-primary/10 text-primary",
                title: "100% Verified Listings",
                desc: "Every job is manually reviewed by our team. Zero spam, zero scam — just legitimate opportunities from real companies.",
              },
              {
                icon: Zap,
                color: "bg-secondary/10 text-secondary",
                title: "Apply in Seconds",
                desc: "One subscription unlocks unlimited applications. Pay once with UPI and apply to any job all year long for ₹21.",
              },
              {
                icon: Briefcase,
                color: "bg-accent/10 text-accent",
                title: "Real-Time Tracking",
                desc: "Your personal dashboard shows every application status. No more guessing — you'll know within 24 hours.",
              },
              {
                icon: Building2,
                color: "bg-blue-50 text-blue-600",
                title: "Top Companies",
                desc: "Partnered with leading startups, MNCs, and growing companies across India hiring across every domain.",
              },
              {
                icon: IndianRupee,
                color: "bg-green-50 text-green-600",
                title: "Transparent Pricing",
                desc: "Just ₹21/year for unlimited applications. No per-job fees, no hidden charges, no subscriptions traps.",
              },
              {
                icon: HeartHandshake,
                color: "bg-pink-50 text-pink-600",
                title: "Dedicated Support",
                desc: "Our team is always available to help with applications, disputes, or any questions you have.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                <div className={`h-11 w-11 rounded-lg flex items-center justify-center mb-5 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Users Say</h2>
            <p className="text-muted-foreground text-lg">Real stories from real professionals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, company, text, rating, initials, color }) => (
              <div key={name} className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{role} · {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-indigo-700 py-24 text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="container relative mx-auto px-4 text-center z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold bg-white/10 mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Limited Time — ₹21/year only
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
            Your Next Big Career Move Starts Here
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of professionals who found their dream roles on RozgarPlus. It takes 2 minutes to sign up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/jobs" : "/register"}>
              <Button size="lg" variant="secondary" className="text-base h-12 px-8 gap-2 shadow-xl">
                {user ? "Browse Jobs" : "Get Started Free"} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="ghost" className="text-base h-12 px-8 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
