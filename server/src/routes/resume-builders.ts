import { Router, type Request } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, resumeBuildersTable, usersTable } from "../db";
import { requireAdmin, requireAuth } from "../lib/auth";

const router = Router();

type AuthReq = Request & { user: typeof usersTable.$inferSelect };

const ExperienceSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().trim().optional().nullable(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().trim().optional().nullable(),
});

const ResumeBuilderBody = z.object({
  fullName: z.string().trim().min(2, "Name is required"),
  gender: z.string().trim().min(1, "Gender is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  industryType: z.string().trim().min(1, "Industry type is required"),
  education: z.string().trim().optional().nullable(),
  skills: z.string().trim().optional().nullable(),
  summary: z.string().trim().optional().nullable(),
  experiences: z.array(ExperienceSchema).min(1).max(3),
});

function formatResumeBuilder(row: typeof resumeBuildersTable.$inferSelect, user?: Pick<typeof usersTable.$inferSelect, "name" | "email"> | null) {
  return {
    id: row.id,
    userId: row.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    fullName: row.fullName,
    gender: row.gender,
    email: row.email,
    phone: row.phone,
    location: row.location,
    industryType: row.industryType,
    education: row.education,
    skills: row.skills,
    summary: row.summary,
    experiences: row.experiences,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.post("/resume-builders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as AuthReq).user;
  const parsed = ResumeBuilderBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(resumeBuildersTable)
    .values({
      userId: user.id,
      ...parsed.data,
      phone: parsed.data.phone || null,
      location: parsed.data.location || null,
      education: parsed.data.education || null,
      skills: parsed.data.skills || null,
      summary: parsed.data.summary || null,
      experiences: parsed.data.experiences.map((experience) => ({
        ...experience,
        endDate: experience.currentlyWorking ? null : experience.endDate || null,
        description: experience.description || null,
      })),
    })
    .returning();

  res.status(201).json(formatResumeBuilder(created));
});

router.get("/admin/resume-builders", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      resume: resumeBuildersTable,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(resumeBuildersTable)
    .leftJoin(usersTable, eq(resumeBuildersTable.userId, usersTable.id))
    .orderBy(desc(resumeBuildersTable.createdAt));

  res.json({
    resumeBuilders: rows.map((row) =>
      formatResumeBuilder(row.resume, { name: row.userName ?? "", email: row.userEmail ?? "" }),
    ),
    total: rows.length,
  });
});

export default router;
