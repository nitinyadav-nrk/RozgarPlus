import { Router, type Request } from "express";
import { db, usersTable, jobsTable, applicationsTable, paymentsTable, savedJobsTable } from "../db";
import { eq, count, desc, and, sum } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

// Admin: dashboard stats
router.get("/dashboard/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalUsersRes] = await db.select({ count: count() }).from(usersTable);
  const [totalJobsRes] = await db.select({ count: count() }).from(jobsTable);
  const [totalAppsRes] = await db.select({ count: count() }).from(applicationsTable);
  const [pendingPaymentsRes] = await db.select({ count: count() }).from(paymentsTable).where(eq(paymentsTable.paymentStatus, "pending"));
  const [approvedAppsRes] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.status, "approved"));
  const [rejectedAppsRes] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.status, "rejected"));
  const [activeJobsRes] = await db.select({ count: count() }).from(jobsTable).where(eq(jobsTable.status, "active"));
  const [featuredJobsRes] = await db.select({ count: count() }).from(jobsTable).where(eq(jobsTable.featured, true));
  const [revenueRes] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.paymentStatus, "approved"));

  res.json({
    totalUsers: totalUsersRes?.count ?? 0,
    totalJobs: totalJobsRes?.count ?? 0,
    totalApplications: totalAppsRes?.count ?? 0,
    pendingPayments: pendingPaymentsRes?.count ?? 0,
    approvedApplications: approvedAppsRes?.count ?? 0,
    rejectedApplications: rejectedAppsRes?.count ?? 0,
    activeJobs: activeJobsRes?.count ?? 0,
    featuredJobs: featuredJobsRes?.count ?? 0,
    revenue: Number(revenueRes?.total ?? 0),
  });
});

// Admin: recent activity
router.get("/dashboard/recent-activity", requireAdmin, async (_req, res): Promise<void> => {
  const recentApps = await db.select({
    id: applicationsTable.id,
    userId: applicationsTable.userId,
    jobId: applicationsTable.jobId,
    status: applicationsTable.status,
    createdAt: applicationsTable.createdAt,
    userName: usersTable.name,
  })
    .from(applicationsTable)
    .leftJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
    .orderBy(desc(applicationsTable.createdAt))
    .limit(10);

  const activity = recentApps.map((app, idx) => ({
    id: idx + 1,
    type: "application",
    message: `New application submitted for job #${app.jobId} — status: ${app.status}`,
    createdAt: app.createdAt.toISOString(),
    userName: app.userName ?? null,
  }));

  res.json(activity);
});

// User: personal dashboard stats
router.get("/dashboard/user-stats", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;

  const [totalAppsRes] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.userId, user.id));
  const [pendingRes] = await db.select({ count: count() }).from(applicationsTable).where(and(eq(applicationsTable.userId, user.id), eq(applicationsTable.status, "pending")));
  const [approvedRes] = await db.select({ count: count() }).from(applicationsTable).where(and(eq(applicationsTable.userId, user.id), eq(applicationsTable.status, "approved")));
  const [rejectedRes] = await db.select({ count: count() }).from(applicationsTable).where(and(eq(applicationsTable.userId, user.id), eq(applicationsTable.status, "rejected")));
  const [savedRes] = await db.select({ count: count() }).from(savedJobsTable).where(eq(savedJobsTable.userId, user.id));

  res.json({
    totalApplications: totalAppsRes?.count ?? 0,
    pendingApplications: pendingRes?.count ?? 0,
    approvedApplications: approvedRes?.count ?? 0,
    rejectedApplications: rejectedRes?.count ?? 0,
    savedJobs: savedRes?.count ?? 0,
  });
});

export default router;
