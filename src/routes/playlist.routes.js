import { Router } from "express";
import { verfifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlayList, 
    deletePlayList, 
    getPlaylistById, 
    getUserPlaylist, 
    removeVideoFromPlaylist, 
    updatePlayList} from "../controllers/playlist.controller.js";

const router=Router()``

router.use(verfifyJWT)

router.route("/create-playlist").post(createPlayList)
router.route("/get-user-playlists").get(getUserPlaylist)
router.route("/add-video-playlist").post(addVideoToPlayList)
router.route("/delete-video-playlist").post(removeVideoFromPlaylist)
router.route("/delete-playlist").post(deletePlayList)
router.route("/update-playlist").patch(updatePlayList)
router.route("/get-playlist").get(getPlaylistById)

export default router;