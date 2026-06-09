import { jsonb, pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export type ResumeExperience = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  description?: string | null;
};

export const resumeBuildersTable = pgTable("resume_builders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  fullName: text("full_name").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  industryType: text("industry_type").notNull(),
  education: text("education"),
  skills: text("skills"),
  summary: text("summary"),
  experiences: jsonb("experiences").$type<ResumeExperience[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type ResumeBuilder = typeof resumeBuildersTable.$inferSelect;
