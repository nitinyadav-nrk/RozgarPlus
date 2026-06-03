import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Clock, IndianRupee, Crown } from "lucide-react";
import { Job } from "@/api-client";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full cursor-pointer overflow-hidden">
        {job.featured && (
          <div className="absolute top-0 right-0">
            <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              Featured
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{job.title}</h3>
              <div className="flex items-center text-muted-foreground mt-1 gap-2">
                <Building className="h-4 w-4" />
                <span className="text-sm">{job.companyName}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="truncate">{job.type}</span>
            </div>
            {job.salary && (
              <div className="flex items-center text-sm font-medium gap-1.5 col-span-2">
                <IndianRupee className="h-3.5 w-3.5 text-primary" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
          
          {job.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {job.shortDescription}
            </p>
          )}
        </div>
        
        <div className="pt-4 border-t flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-normal text-xs">{job.category}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
            <Crown className="h-3 w-3" />
            Members Only
          </div>
        </div>
      </div>
    </Link>
  );
}
