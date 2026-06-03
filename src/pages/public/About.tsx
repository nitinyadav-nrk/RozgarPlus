import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <Layout>
      <div className="bg-muted/30 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About RozgarPlus</h1>
          <p className="text-xl text-muted-foreground">
            We're building the most transparent and efficient marketplace for ambitious professionals to find their next career defining role.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The job search process is broken. Between ghosting, fake job postings, and endless rounds of interviews, candidates are exhausted before they even start day one. At RozgarPlus, we believe finding a job should be an exciting journey, not a grueling marathon.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We manually verify every single company and job posting on our platform. We ensure transparent communication, and we've streamlined the application process to respect your time.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Why the Application Fee?</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            To ensure the highest quality of applications for our partner companies and to keep our platform free of spam, we implement a nominal application fee. This small barrier to entry guarantees that when a company sees your resume, they know you're serious.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            In return, we guarantee that your application will be reviewed by a human, and you will receive a definitive answer. No more black holes.
          </p>
        </section>
        
        <section className="text-center py-12 border-t">
          <h2 className="text-2xl font-bold mb-6">Ready to find your next role?</h2>
          <Link href="/jobs">
            <Button size="lg" className="text-lg h-14 px-8">Browse Open Jobs</Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
}
