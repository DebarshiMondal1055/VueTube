import { Router } from "express";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets } from "../controllers/tweet.controller.js";

const router=Router()

router.use(verfifyJWT)

router.route("/create-tweet").post(createTweet)
router.route("/users/:userId").get(getUserTweets)
router.route("/t/:tweetId").post(deleteTweet);

export default router;