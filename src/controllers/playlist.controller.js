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

    if(!userId || !new mongoose.Types.ObjectId.isValid(userId)){
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



export {createPlayList,
        getUserPlaylist
}