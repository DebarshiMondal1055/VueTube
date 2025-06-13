import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments } from "../controllers/comment.controller.js";

const router=Router()

router.route("/add-comment").post(addComment)
router.route("/delete-comment").post(deleteComment)
router.route("/get-comments").get(getVideoComments)


export default router;