import { Router, type IRouter } from "express";
import healthRouter from "./health";
import socraticRouter from "./socratic";

const router: IRouter = Router();

router.use(healthRouter);
router.use(socraticRouter);

export default router;
