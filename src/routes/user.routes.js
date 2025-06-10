import { Router } from "express";
import { changeAccountDetails, changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
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

router.route("/login").post(loginUser); 


// secured routes

router.route("/logout").post(verfifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verfifyJWT,changePassword)

router.route("/change-account-details").post(verfifyJWT,changeAccountDetails)

router.route("/get-user").post(verfifyJWT,getCurrentUser)

router.route("/update-avatar").post(
    verfifyJWT,
    upload.single("avatar"),
    updateUserAvatar)

router.route("/update-cover-image").post(
    verfifyJWT,
    upload.single("coverimage"),
    updateUserCoverImage
)
export default router;