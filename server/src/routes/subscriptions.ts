import { Router, type Request } from "express";
import { db, subscriptionsTable, usersTable } from "../db";
import { eq, desc, count, and, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  CreateSubscriptionBody,
  AdminUpdateSubscriptionStatusBody,
  AdminUpdateSubscriptionStatusParams,
} from "../api-zod";
import { getSetting } from "./settings";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

function formatSub(
  sub: typeof subscriptionsTable.$inferSelect,
  user?: typeof usersTable.$inferSelect | null
) {
  return {
    id: sub.id,
    userId: sub.userId,
    utrNumber: sub.utrNumber,
    paymentScreenshot: sub.paymentScreenshot,
    status: sub.status,
    expiresAt: sub.expiresAt ? sub.expiresAt.toISOString() : null,
    createdAt: sub.createdAt.toISOString(),
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
  };
}

// User: get my subscription
router.get("/subscriptions", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, user.id))
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(1);

  if (!sub) {
    res.status(404).json({ error: "No subscription found" });
    return;
  }

  // Auto-expire if past expiresAt
  if (sub.status === "active" && sub.expiresAt && sub.expiresAt < new Date()) {
    await db
      .update(subscriptionsTable)
      .set({ status: "expired" })
      .where(eq(subscriptionsTable.id, sub.id));
    res.json(formatSub({ ...sub, status: "expired" }, user));
    return;
  }

  res.json(formatSub(sub, user));
});

// User: submit subscription request
router.post("/subscriptions", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;

  // Check if already has pending or active subscription
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, user.id),
        or(
          eq(subscriptionsTable.status, "pending"),
          eq(subscriptionsTable.status, "active")
        )
      )
    )
    .limit(1);

  if (existing) {
    res.status(400).json({ error: "You already have an active or pending subscription" });
    return;
  }

  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [sub] = await db
    .insert(subscriptionsTable)
    .values({
      userId: user.id,
      utrNumber: parsed.data.utrNumber,
      paymentScreenshot: parsed.data.paymentScreenshot ?? null,
      status: "pending",
    })
    .returning();

  res.status(201).json(formatSub(sub, user));
});

// Admin: list all subscriptions
router.get("/admin/subscriptions", requireAdmin, async (req, res): Promise<void> => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;

  const conditions = status ? [eq(subscriptionsTable.status, status)] : [];
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(subscriptionsTable)
    .where(whereClause);
  const total = totalResult?.count ?? 0;

  const subs = await db
    .select()
    .from(subscriptionsTable)
    .where(whereClause)
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const result = await Promise.all(
    subs.map(async (sub) => {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, sub.userId));
      return formatSub(sub, user);
    })
  );

  res.json({ subscriptions: result, total, page, totalPages: Math.ceil(total / limit) });
});

// Admin: approve or reject a subscription
router.patch(
  "/admin/subscriptions/:id/status",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = AdminUpdateSubscriptionStatusParams.safeParse(req.params);
    if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

    const parsed = AdminUpdateSubscriptionStatusBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    if (parsed.data.status !== "active" && parsed.data.status !== "rejected") {
      res.status(400).json({ error: "Status must be 'active' or 'rejected'" });
      return;
    }

    const updates: Record<string, unknown> = { status: parsed.data.status };

    if (parsed.data.status === "active") {
      const days = parseInt(await getSetting("subscriptionDays"), 10) || 365;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      updates.expiresAt = expiresAt;
    }

    const [sub] = await db
      .update(subscriptionsTable)
      .set(updates)
      .where(eq(subscriptionsTable.id, params.data.id))
      .returning();

    if (!sub) { res.status(404).json({ error: "Subscription not found" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sub.userId));
    res.json(formatSub(sub, user));
  }
);

export default router;
