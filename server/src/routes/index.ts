import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import paymentsRouter from "./payments";
import savedJobsRouter from "./saved-jobs";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";
import subscriptionsRouter from "./subscriptions";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(paymentsRouter);
router.use(savedJobsRouter);
router.use(usersRouter);
router.use(dashboardRouter);
router.use(subscriptionsRouter);
router.use(settingsRouter);

export default router;
