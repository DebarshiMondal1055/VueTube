import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller";
import { verfifyJWT } from "../middlewares/auth.middleware";

const router=Router()

router.use(verfifyJWT)
router.route("/toggle-subcription").post(toggleSubscription);
router.route("/get-user-subcribers").get(getUserChannelSubscribers)
router.route("get-subscribed-channels").get(getSubscribedChannels)

export default router;