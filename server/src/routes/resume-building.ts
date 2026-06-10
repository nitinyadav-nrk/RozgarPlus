import { Router, type Request } from "express";
import { desc, eq, count } from "drizzle-orm";
import { z } from "zod/v4";
import { db, resumeBuildingTable, usersTable } from "../db";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

const experienceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  designation: z.string().min(1, "Designation is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const resumeBuildingBody = z.object({
  name: z.string().min(2, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Valid email is required").optional().nullable(),
  location: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  industryType: z.string().min(1, "Industry type is required"),
  skills: z.string().optional().nullable(),
  careerSummary: z.string().optional().nullable(),
  experiences: z.array(experienceSchema).min(1, "Add at least one company experience"),
});

function formatResume(
  row: typeof resumeBuildingTable.$inferSelect,
  user?: Pick<typeof usersTable.$inferSelect, "name" | "email"> | null,
) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    location: row.location,
    education: row.education,
    industryType: row.industryType,
    skills: row.skills,
    careerSummary: row.careerSummary,
    experiences: row.experiences,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
  };
}

router.post("/resume-building", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const parsed = resumeBuildingBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(resumeBuildingTable)
    .values({
      userId: user.id,
      ...parsed.data,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      location: parsed.data.location ?? null,
      education: parsed.data.education ?? null,
      skills: parsed.data.skills ?? null,
      careerSummary: parsed.data.careerSummary ?? null,
    })
    .returning();

  res.status(201).json(formatResume(row, user));
});

router.get("/resume-building/mine", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const rows = await db
    .select()
    .from(resumeBuildingTable)
    .where(eq(resumeBuildingTable.userId, user.id))
    .orderBy(desc(resumeBuildingTable.createdAt));

  res.json(rows.map((row) => formatResume(row, user)));
});

router.get("/admin/resume-building", requireAdmin, async (req, res): Promise<void> => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ count: count() }).from(resumeBuildingTable);
  const total = totalResult?.count ?? 0;

  const rows = await db
    .select()
    .from(resumeBuildingTable)
    .orderBy(desc(resumeBuildingTable.createdAt))
    .limit(limit)
    .offset(offset);

  const result = await Promise.all(
    rows.map(async (row) => {
      const [user] = await db
        .select({ name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, row.userId));
      return formatResume(row, user);
    }),
  );

  res.json({ resumes: result, total, page, totalPages: Math.ceil(total / limit) });
});

export default router;
