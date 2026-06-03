import { Router, type Request } from "express";
import { db, paymentsTable, usersTable, applicationsTable, jobsTable } from "../db";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  SubmitPaymentBody,
  AdminListPaymentsQueryParams,
  VerifyPaymentParams,
  VerifyPaymentBody,
} from "../api-zod";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

async function enrichPayment(payment: typeof paymentsTable.$inferSelect) {
  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, payment.userId));
  let jobTitle: string | null = null;
  if (payment.applicationId) {
    const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, payment.applicationId));
    if (app) {
      const [job] = await db.select({ title: jobsTable.title }).from(jobsTable).where(eq(jobsTable.id, app.jobId));
      jobTitle = job?.title ?? null;
    }
  }
  return {
    id: payment.id,
    userId: payment.userId,
    applicationId: payment.applicationId,
    amount: payment.amount,
    utrNumber: payment.utrNumber,
    screenshot: payment.screenshot,
    paymentStatus: payment.paymentStatus,
    verifiedBy: payment.verifiedBy,
    createdAt: payment.createdAt.toISOString(),
    userName: user?.name ?? null,
    jobTitle,
  };
}

// User: submit payment
router.post("/payments", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const parsed = SubmitPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [payment] = await db.insert(paymentsTable).values({
    userId: user.id,
    applicationId: parsed.data.applicationId,
    amount: parsed.data.amount,
    utrNumber: parsed.data.utrNumber,
    screenshot: parsed.data.screenshot ?? null,
    paymentStatus: "pending",
  }).returning();

  res.status(201).json(await enrichPayment(payment));
});

// Admin: list payments
router.get("/admin/payments", requireAdmin, async (req, res): Promise<void> => {
  const query = AdminListPaymentsQueryParams.safeParse(req.query);
  const page = query.success && query.data.page ? Number(query.data.page) : 1;
  const limit = query.success && query.data.limit ? Number(query.data.limit) : 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.success && query.data.status) conditions.push(eq(paymentsTable.paymentStatus, query.data.status));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(paymentsTable).where(whereClause);
  const total = totalResult?.count ?? 0;
  const payments = await db.select().from(paymentsTable).where(whereClause).orderBy(desc(paymentsTable.createdAt)).limit(limit).offset(offset);

  const enriched = await Promise.all(payments.map(enrichPayment));
  res.json({ payments: enriched, total, page, totalPages: Math.ceil(total / limit) });
});

// Admin: verify payment
router.patch("/admin/payments/:id/verify", requireAdmin, async (req, res): Promise<void> => {
  const adminUser = (req as AuthReq).user;
  const params = VerifyPaymentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [payment] = await db.update(paymentsTable)
    .set({ paymentStatus: parsed.data.paymentStatus, verifiedBy: adminUser.id })
    .where(eq(paymentsTable.id, params.data.id))
    .returning();

  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  res.json(await enrichPayment(payment));
});

export default router;
