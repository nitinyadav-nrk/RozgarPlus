import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/shared/JobCard";
import { useListJobs, getListJobsQueryKey } from "@/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Engineering", "Design", "Marketing", "Data Science", "Finance", "Operations", "Sales", "HR"];
const JOB_TYPES = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];
const LOCATIONS = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Remote", "Noida"];

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1.5 pr-1.5 py-1 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const params = useMemo(() => ({
    search: search || undefined,
    category: category || undefined,
    type: jobType || undefined,
    location: location || undefined,
  }), [search, category, jobType, location]);

  const { data, isLoading } = useListJobs(params, {
    query: { queryKey: getListJobsQueryKey(params) }
  });

  const activeFilters = [
    category && { key: "category", label: `Category: ${category}`, clear: () => setCategory("") },
    jobType && { key: "type", label: `Type: ${JOB_TYPES.find(t => t.value === jobType)?.label}`, clear: () => setJobType("") },
    location && { key: "location", label: `Location: ${location}`, clear: () => setLocation("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => { setSearch(""); setCategory(""); setJobType(""); setLocation(""); };

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Category</h3>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? "" : cat)}
              className={cn(
                "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                category === cat
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Job Type</h3>
        <div className="space-y-1">
          {JOB_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setJobType(jobType === value ? "" : value)}
              className={cn(
                "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                jobType === value
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground uppercase tracking-wide">Location</h3>
        <div className="space-y-1">
          {LOCATIONS.map(loc => (
            <button
              key={loc}
              onClick={() => setLocation(location === loc ? "" : loc)}
              className={cn(
                "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                location === loc
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {(category || jobType || location) && (
        <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearAll}>
          <X className="h-4 w-4 mr-2" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Role</h1>
          <p className="text-muted-foreground mb-6">Explore verified opportunities across India's top companies</p>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or keywords..."
                className="pl-10 h-12 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className={cn("h-12 gap-2 md:hidden", (category || jobType || location) && "border-primary text-primary")}
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </Button>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map(f => (
                <FilterPill key={f.key} label={f.label} onRemove={f.clear} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="md:hidden border-b bg-background px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" /></button>
          </div>
          <FiltersPanel />
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-bold text-base mb-5">Filters</h3>
              <FiltersPanel />
            </div>
          </aside>

          {/* Job grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isLoading ? "Loading..." : `${data?.total ?? 0} Job${(data?.total ?? 0) !== 1 ? "s" : ""} Found`}
              </h2>
              {activeFilters.length > 0 && (
                <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Clear filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="rounded-xl border p-6 h-[240px] flex flex-col">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full mt-auto" />
                  </div>
                ))}
              </div>
            ) : data?.jobs && data.jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border rounded-xl bg-muted/10">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms.</p>
                <Button variant="outline" onClick={clearAll}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
