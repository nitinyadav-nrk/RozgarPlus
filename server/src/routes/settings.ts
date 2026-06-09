import { Router } from "express";
import { db, settingsTable } from "../db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

const DEFAULTS: Record<string, string> = {
  subscriptionAmount: "21",
  subscriptionDays: "365",
  upiId: "rozgarplus@upi",
  upiName: "RozgarPlus",
};

export async function getSetting(key: string): Promise<string> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? DEFAULTS[key] ?? "";
}

// Admin: GET all settings
router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) result[row.key] = row.value;
  res.json(result);
});

// Admin: PATCH settings (partial update)
router.patch("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const updates = req.body as Record<string, string>;
  const allowed = ["subscriptionAmount", "subscriptionDays", "upiId", "upiName"];
  const entries = Object.entries(updates).filter(([k]) => allowed.includes(k));

  for (const [key, value] of entries) {
    await db
      .insert(settingsTable)
      .values({ key, value })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
  }

  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) result[row.key] = row.value;
  res.json(result);
});

export default router;
