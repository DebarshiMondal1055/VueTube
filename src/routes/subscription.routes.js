import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verfifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verfifyJWT)

router.route("/c/:channelId").get(getUserChannelSubscribers)
router.route("/users/:subscriberId").get(getSubscribedChannels)
router.route("/c/:channelId").post(toggleSubscription);

export default router;