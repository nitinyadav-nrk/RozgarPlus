import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export type ResumeExperience = {
  companyName: string;
  designation: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
};

export const resumeBuildingTable = pgTable("resume_building_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone"),
  email: text("email"),
  location: text("location"),
  education: text("education"),
  industryType: text("industry_type").notNull(),
  skills: text("skills"),
  careerSummary: text("career_summary"),
  experiences: jsonb("experiences").$type<ResumeExperience[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type ResumeBuildingData = typeof resumeBuildingTable.$inferSelect;
