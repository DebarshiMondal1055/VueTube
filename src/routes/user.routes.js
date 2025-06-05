import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router()

router.route("/register").post(
    upload.fields([                     //middleware for file upload before registerUser is called
        {
            name: "avatar",
            maxCount:1
        },
        {   
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser)

export default router;