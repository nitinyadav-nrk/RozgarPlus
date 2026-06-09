import { Router, type Request } from "express";
import { db, savedJobsTable, jobsTable, usersTable } from "../db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { SaveJobBody, UnsaveJobParams } from "../api-zod";

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

router.get("/saved-jobs", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const saved = await db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, user.id));
  const jobs = await Promise.all(
    saved.map(async (s) => {
      const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, s.jobId));
      return job ? formatJob(job) : null;
    })
  );
  res.json(jobs.filter(Boolean));
});

router.post("/saved-jobs", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const parsed = SaveJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [existing] = await db.select().from(savedJobsTable).where(
    and(eq(savedJobsTable.userId, user.id), eq(savedJobsTable.jobId, parsed.data.jobId))
  );
  if (existing) { res.status(200).json({ message: "Already saved" }); return; }

  await db.insert(savedJobsTable).values({ userId: user.id, jobId: parsed.data.jobId });
  res.status(201).json({ message: "Saved" });
});

router.delete("/saved-jobs/:jobId", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const params = UnsaveJobParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid jobId" }); return; }

  await db.delete(savedJobsTable).where(
    and(eq(savedJobsTable.userId, user.id), eq(savedJobsTable.jobId, params.data.jobId))
  );
  res.sendStatus(204);
});

export default router;
