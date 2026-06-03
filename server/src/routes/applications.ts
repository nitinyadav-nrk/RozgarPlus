import { Router, type Request } from "express";
import { db, applicationsTable, jobsTable, usersTable } from "../db";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  SubmitApplicationBody,
  AdminListApplicationsQueryParams,
  UpdateApplicationStatusParams,
  UpdateApplicationStatusBody,
} from "../api-zod";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

function formatJob(job: typeof jobsTable.$inferSelect) {
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
    applicationCount: null,
  };
}

function formatApp(app: typeof applicationsTable.$inferSelect) {
  return {
    id: app.id,
    userId: app.userId,
    jobId: app.jobId,
    utrNumber: app.utrNumber,
    paymentScreenshot: app.paymentScreenshot,
    resume: app.resume,
    adminNote: app.adminNote,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
  };
}

// User: submit application
router.post("/applications", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const parsed = SubmitApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { jobId, utrNumber, paymentScreenshot, resume } = parsed.data;

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const [existing] = await db.select().from(applicationsTable).where(
    and(eq(applicationsTable.userId, user.id), eq(applicationsTable.jobId, jobId))
  );
  if (existing) {
    res.status(400).json({ error: "Already applied to this job" });
    return;
  }

  const [application] = await db.insert(applicationsTable).values({
    userId: user.id,
    jobId,
    utrNumber: utrNumber ?? null,
    paymentScreenshot: paymentScreenshot ?? null,
    resume: resume ?? null,
    status: "pending",
  }).returning();

  res.status(201).json(formatApp(application));
});

// User: my applications
router.get("/applications/mine", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, user.id)).orderBy(desc(applicationsTable.createdAt));

  const result = await Promise.all(apps.map(async (app) => {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    return { ...formatApp(app), job: job ? formatJob(job) : null };
  }));

  res.json(result);
});

// Admin: list all applications
router.get("/admin/applications", requireAdmin, async (req, res): Promise<void> => {
  const query = AdminListApplicationsQueryParams.safeParse(req.query);
  const page = query.success && query.data.page ? Number(query.data.page) : 1;
  const limit = query.success && query.data.limit ? Number(query.data.limit) : 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.success && query.data.status) conditions.push(eq(applicationsTable.status, query.data.status));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(applicationsTable).where(whereClause);
  const total = totalResult?.count ?? 0;
  const apps = await db.select().from(applicationsTable).where(whereClause).orderBy(desc(applicationsTable.createdAt)).limit(limit).offset(offset);

  const result = await Promise.all(apps.map(async (app) => {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    return { ...formatApp(app), job: job ? formatJob(job) : null };
  }));

  res.json({ applications: result, total, page, totalPages: Math.ceil(total / limit) });
});

// Admin: update application status
router.patch("/admin/applications/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateApplicationStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [app] = await db.update(applicationsTable)
    .set({ status: parsed.data.status, adminNote: parsed.data.adminNote ?? null })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) { res.status(404).json({ error: "Application not found" }); return; }
  res.json(formatApp(app));
});

export default router;
