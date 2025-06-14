import { Router } from "express";
import { verfifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verfifyJWT)

export default router;