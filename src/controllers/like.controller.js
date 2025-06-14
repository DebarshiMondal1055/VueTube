import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/aynscHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/User.model.js";




const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id");
    }
    const isLiked = await Like.findOne({
        videoLike: videoId,
        owner: req.user?._id
    });

    if(!isLiked){
        const like=await Like.create({
            commentLike:null,
            videoLike:videoId,
            tweetLike:null, 
            owner:req.user?._id
        })
        if(!like){
            throw new ApiError(500,"Video Like Failed")
        }
        return res
        .status(201)
        .json(new ApiResponse(201,like,"Video Liked successfully"))
    }
    else{
        const unliked=await Like.findByIdAndDelete(isLiked._id);
        if(!unliked){
            throw new ApiError(500,"Video Unlike failed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,unliked,"Video unlikes successfully"))
    }
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
        
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment Id");
    }

    const isLiked = await Like.findOne({
        commentLike: commentId,
        owner: req.user?._id
    });

    if(!isLiked){
        const like=await Like.create({
            commentLike:commentId,
            videoLike:null,
            tweetLike:null, 
            owner:req.user?._id
        })
        if(!like){
            throw new ApiError(500,"Comment Like Failed")
        }
        return res
        .status(201)
        .json(new ApiResponse(201,like,"Comment Liked successfully"))
    }

    else{
        const unliked=await Like.findByIdAndDelete(isLiked._id);
        if(!unliked){
            throw new ApiError(500,"Comment Unlike failed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,unliked,"Comment unliked successfully"))
    }

})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id");
    }

    const isLiked = await Like.findOne({
        tweetLike: tweetId,
        owner: req.user?._id
    });

    if(!isLiked){
        const like=await Like.create({
            commentLike:null,
            videoLike:null,
            tweetLike:tweetId, 
            owner:req.user?._id
        })
        if(!like){
            throw new ApiError(500,"Tweet Like Failed")
        }
        return res
        .status(201)
        .json(new ApiResponse(201,like,"Tweet Liked successfully"))
    }

    else{
        const unliked=await Like.findByIdAndDelete(isLiked._id);
        if(!unliked){
            throw new ApiError(500,"Tweet Unlike failed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,unliked,"Tweet unlikes successfully"))
    }



})

const getLikedVideos=asyncHandler(async(req,res)=>{
    const likedVideos=await Like.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?.id),
                videoLike: { $ne: null } 
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videoLike",
                foreignField:"_id",
                as:"likedVideo",
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
            $unwind:"$likedVideo"
        },
        {
            $lookup:{
                from:"users",
                localField:"likedVideo.owner",
                foreignField:"_id",
                as:"uploader",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$uploader"
        }

    ])

    if(!likedVideos){
        throw new ApiError(500,"Failed to fetch Liked videos")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"Liked Videos fetched successfully"))
})

export {toggleVideoLike,
        toggleCommentLike,
        toggleTweetLike,
        getLikedVideos
}