import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "../db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const JWT_SECRET = process.env.SESSION_SECRET ?? "jobnest-secret-key";

export function signToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user || user.isBlocked) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    (req as Request & { user: typeof user }).user = user;
    next();
  } catch (err) {
    logger.error({ err }, "Auth middleware error");
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, () => {
    const user = (req as Request & { user: { role: string } }).user;
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}
