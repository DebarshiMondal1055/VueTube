import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verfifyJWT } from "../middlewares/auth.middleware";
import { uploadVideo } from "../controllers/video.controller";

const router=Router()

router.route("/uploadVideo").post(
    verfifyJWT,
    upload.fields([
        {
            name:Video,
            maxCount:1
        },
        {
            name:thumbnail,
            maxCount:1
        }
    ]),uploadVideo)
export default router;