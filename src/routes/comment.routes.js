import { Router } from "express";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments } from "../controllers/comment.controller.js";

const router=Router()

router.use(verfifyJWT)

router.route("/:videoId").post(addComment)
router.route("/ct/:commentId").post(deleteComment)
router.route("/v/:videoId").get(getVideoComments)


export default router;