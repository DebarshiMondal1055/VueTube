import { Router } from "express";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlayList, 
    deletePlayList, 
    getPlaylistById, 
    getUserPlaylist, 
    removeVideoFromPlaylist, 
    updatePlayList} from "../controllers/playlist.controller.js";

const router=Router()

router.use(verfifyJWT)

router.route("/create-playlist").post(createPlayList)       //done
router.route("/p/users/:userId").get(getUserPlaylist)       //done
router.route("/:playListId/videos/:videoId").post(addVideoToPlayList)   //done
router.route("/delete-video-playlist").post(removeVideoFromPlaylist)
router.route("/delete-playlist").post(deletePlayList)
router.route("/:playListId").patch(updatePlayList)      //done
router.route("/get-playlist").get(getPlaylistById)

export default router;