import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/aynscHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";



const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {page=1,limit=5}=req.query;
    if(!videoId){
        throw new ApiError(400,"Invalid video id");
    }
    const aggregate=Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{
                createdAt:-1
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
                            avatar:1
                        }
                    }
                ]
            },
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])

    const options={
        page:(Number)(page),
        limit:(Number)(limit)
    }
    const comments= await Comment.aggregatePaginate(aggregate,options);
    if(!comments){
        throw new ApiError(500,"Failed to fetch comments")
    }

    return res.
    status(200)
    .json(new ApiResponse(200,comments,"Comments fetched successfully"))
})


const addComment=asyncHandler(async(req,res)=>{
    const {content} =req.body;
    const {videoId} =req.params;
    
    if(!content || !videoId){
        throw new ApiError(400,"Add Content field or invalid video ID")
    }
    const comment=await Comment.create({
        content,
        video:videoId,
        owner: new mongoose.Types.ObjectId(req.user?._id)
    }) 
    
    if(!comment){
        throw new ApiError(500,"Failed to create Comment")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment added successfully"))
})


const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid Comment ID")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"Comment not Found")
    }
    if(!comment.owner.equals(req.user?._id)){
        throw new ApiError(403,"Unauthorized to delete");
    }
    const deletedComment=await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new ApiError(500,"Comment deletion Failed")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,deletedComment,"Comment deleted successfully"));
})



export {
    getVideoComments,
    addComment,
    deleteComment
}