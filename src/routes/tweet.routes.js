import { Router } from "express";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets } from "../controllers/tweet.controller.js";

const router=Router()

router.use(verfifyJWT)

router.route("/create-tweet").post(createTweet)
router.route("/get-user-tweets").get(getUserTweets)
router.route("/delete-tweet").post(deleteTweet);

export default router;