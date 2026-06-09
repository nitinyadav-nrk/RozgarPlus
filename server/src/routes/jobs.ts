import { Router } from "express";
import { db, jobsTable, applicationsTable } from "../db";
import { eq, sql, ilike, and, desc, count } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import {
  GetJobParams,
  AdminListJobsQueryParams,
  CreateJobBody,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
  UpdateJobStatusParams,
  UpdateJobStatusBody,
  ToggleJobFeaturedParams,
  ToggleJobFeaturedBody,
  ListJobsQueryParams,
} from "../api-zod";

const router = Router();

function formatJob(job: typeof jobsTable.$inferSelect, applicationCount?: number) {
  return {
    id: job.id,
    title: job.title,
    companyName: job.companyName,
    category: job.category,
    location: job.location,
    type: job.type,
    salary: job.salary,
    applyFee: job.applyFee,
    shortDescription: job.shortDescription,
    fullDescription: job.fullDescription,
    skillsRequired: job.skillsRequired,
    featured: job.featured,
    status: job.status,
    expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    applicationCount: applicationCount ?? null,
  };
}

// Public: list jobs
router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  const page = query.success && query.data.page ? Number(query.data.page) : 1;
  const limit = query.success && query.data.limit ? Number(query.data.limit) : 12;
  const offset = (page - 1) * limit;

  const conditions = [eq(jobsTable.status, "active")];
  if (query.success && query.data.category) conditions.push(eq(jobsTable.category, query.data.category));
  if (query.success && query.data.location) conditions.push(ilike(jobsTable.location, `%${query.data.location}%`));
  if (query.success && query.data.type) conditions.push(eq(jobsTable.type, query.data.type));
  if (query.success && query.data.search) {
    conditions.push(sql`(${jobsTable.title} ilike ${'%' + query.data.search + '%'} or ${jobsTable.companyName} ilike ${'%' + query.data.search + '%'})`);
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db.select({ count: count() }).from(jobsTable).where(whereClause);
  const total = totalResult?.count ?? 0;

  const jobs = await db.select().from(jobsTable).where(whereClause).orderBy(desc(jobsTable.featured), desc(jobsTable.createdAt)).limit(limit).offset(offset);

  res.json({
    jobs: jobs.map(j => formatJob(j)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// Public: featured jobs
router.get("/jobs/featured", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).where(and(eq(jobsTable.featured, true), eq(jobsTable.status, "active"))).orderBy(desc(jobsTable.createdAt)).limit(6);
  res.json(jobs.map(j => formatJob(j)));
});

// Public: categories
router.get("/jobs/categories", async (_req, res): Promise<void> => {
  const result = await db.select({
    category: jobsTable.category,
    count: count(),
  }).from(jobsTable).where(eq(jobsTable.status, "active")).groupBy(jobsTable.category).orderBy(desc(count()));
  res.json(result.map(r => ({ category: r.category, count: r.count })));
});

// Public: single job
router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const [appCount] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
  res.json(formatJob(job, appCount?.count ?? 0));
});

// Admin: list jobs
router.get("/admin/jobs", requireAdmin, async (req, res): Promise<void> => {
  const query = AdminListJobsQueryParams.safeParse(req.query);
  const page = query.success && query.data.page ? Number(query.data.page) : 1;
  const limit = query.success && query.data.limit ? Number(query.data.limit) : 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.success && query.data.status) conditions.push(eq(jobsTable.status, query.data.status));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [totalResult] = await db.select({ count: count() }).from(jobsTable).where(whereClause);
  const total = totalResult?.count ?? 0;
  const jobs = await db.select().from(jobsTable).where(whereClause).orderBy(desc(jobsTable.createdAt)).limit(limit).offset(offset);

  res.json({ jobs: jobs.map(j => formatJob(j)), total, page, totalPages: Math.ceil(total / limit) });
});

// Admin: create job
router.post("/admin/jobs", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { expiresAt, ...rest } = parsed.data;
  const [job] = await db.insert(jobsTable).values({
    ...rest,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    featured: rest.featured ?? false,
  }).returning();
  res.status(201).json(formatJob(job));
});

// Admin: update job
router.put("/admin/jobs/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { expiresAt, ...rest } = parsed.data;
  const [job] = await db.update(jobsTable).set({
    ...rest,
    ...(expiresAt !== undefined ? { expiresAt: new Date(expiresAt) } : {}),
  }).where(eq(jobsTable.id, params.data.id)).returning();

  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(formatJob(job));
});

// Admin: delete job
router.delete("/admin/jobs/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.sendStatus(204);
});

// Admin: update job status
router.patch("/admin/jobs/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateJobStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateJobStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [job] = await db.update(jobsTable).set({ status: parsed.data.status }).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(formatJob(job));
});

// Admin: toggle featured
router.patch("/admin/jobs/:id/feature", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleJobFeaturedParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = ToggleJobFeaturedBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [job] = await db.update(jobsTable).set({ featured: parsed.data.featured }).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(formatJob(job));
});

export default router;
