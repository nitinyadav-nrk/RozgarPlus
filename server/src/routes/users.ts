import { Router, type Request } from "express";
import { db, usersTable } from "../db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  AdminListUsersQueryParams,
  ToggleUserBlockParams,
  ToggleUserBlockBody,
  UpdateProfileBody,
} from "../api-zod";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt.toISOString(),
  };
}

// Admin: list users
router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const query = AdminListUsersQueryParams.safeParse(req.query);
  const page = query.success && query.data.page ? Number(query.data.page) : 1;
  const limit = query.success && query.data.limit ? Number(query.data.limit) : 20;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ count: count() }).from(usersTable);
  const total = totalResult?.count ?? 0;
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

  res.json({ users: users.map(formatUser), total, page, totalPages: Math.ceil(total / limit) });
});

// Admin: toggle block
router.patch("/admin/users/:id/block", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleUserBlockParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = ToggleUserBlockBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.update(usersTable)
    .set({ isBlocked: parsed.data.isBlocked })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

// User: update profile
router.put("/profile", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db.update(usersTable)
    .set({ name: parsed.data.name ?? user.name, phone: parsed.data.phone ?? user.phone })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(formatUser(updated));
});

export default router;
