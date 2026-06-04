import { Router, type Request } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "../db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import {
  RegisterBody,
  LoginBody,
} from "../api-zod";

const router = Router();
router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const parsed = LoginBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { email, password } = parsed.data;

    console.log("Login attempt:", email);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    console.log("User found:", !!user);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (user.isBlocked) {
      res.status(401).json({ error: "Account is blocked" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);

    console.log("Password valid:", valid);

    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      error: "Login failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
