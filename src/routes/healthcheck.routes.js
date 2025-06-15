import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";
import { verfifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/health-check").get(verfifyJWT,healthCheck)
export default router;