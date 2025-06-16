import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aynscHandler.js";



const createPlayList=asyncHandler(async(req,res)=>{
    const {name,description}=req.body

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400,"Name and description fields are required")
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })
    
    if(!playlist){
        throw new ApiError(500,"Failed to create Playlist")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,playlist,"Playlist created successfully"));
})



const getUserPlaylist=asyncHandler(async(req,res)=>{
    const {userId}=req.params

    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const playList=await Playlist.aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videoList",
                pipeline:[
                    {
                        $project:{
                            title:1,
                            duration:1,
                            views:1,
                            thumbnail:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        }
    ])

    if(!playList){
        throw new ApiError(500,"Failed to fetch playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playList,"Playlist fetched successfully"))
})


const addVideoToPlayList=asyncHandler(async(req,res)=>{
    const {videoId,playListId}=req.params;
    
    if(!videoId || !playListId){
        throw new ApiError(400,"Invalid video ID or Playlist ID")
    }

    if(!new mongoose.Types.ObjectId.isValid(videoId) || !new mongoose.Types.ObjectId.isValid(playListId)){
        throw new ApiError(400,"Invalid Id for video and playlist");
    }

    const playlistVideos=await Playlist.findById(playListId);
    
    if(!playlistVideos){
        throw new ApiError(404,"Playlist not found")
    }
    if(playlistVideos.videos.some((video)=>video.toString()===videoId)){
        throw new ApiError(400,"Video already in playlist");
    }

    playlistVideos.videos.push(new mongoose.Types.ObjectId(videoId));

    await playlistVideos.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,playlistVideos,"Video added to playlist successfully"))

})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {videoId,playlistId}=req.params

    if(!videoId || !playlistId){
        throw new ApiError(400,"Video ID and playlist ID field is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid video or playlist ID");
    }

    const playlist=await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not Found");
    }

    if(!playlist.videos.some((video)=>video.toString()===videoId)){
        throw new ApiError(404,"Video Not Found");
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{                                                     // best operator to prevent race condition
                videos:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new:true
        }        
    ) 

    if(!updatedPlaylist){
        throw new ApiError(500,"Failed to remove video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"video deleted Successfully"));

})

const deletePlayList=asyncHandler(async(req,res)=>{
    const {playListId}=req.params;

    if(!playListId || !mongoose.Types.ObjectId.isValid(playListId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const deletedPlaylist=await Playlist.findByIdAndDelete(playListId);

    if(!deletedPlaylist){
        throw new ApiError(404,"Playlist not Found or Found to delete playlist");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedPlaylist,"Playlist deleted successfully"));
})

const updatePlayList=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    const {playListId}=req.params;
    if(!name.trim() || !description.trim()){
        throw new ApiError(400,"Name and description fields are required");
    }
    if(!playListId || !new mongoose.Types.ObjectId.isValid(playListId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const playlist=await Playlist.findById(playListId);

    if(!playlist){
        throw new ApiError(404,"Playlist not Found");
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(403,"Unauthorized to update")
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playListId,
        {
            $set:{
                name:name.trim(),
                description:description.trim()
            }
        },
        {
            new:true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(500,"Failed to update Playlist");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"))

})


const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const playlist=await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError("404","Playlist Not Found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist fetched Successfully"));
})




export {createPlayList,
        getUserPlaylist,
        addVideoToPlayList,
        removeVideoFromPlaylist,
        deletePlayList,
        updatePlayList,
        getPlaylistById
}