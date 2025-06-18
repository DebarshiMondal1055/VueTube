import mongoose from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aynscHandler.js";


const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    
    if(!content){
        throw new ApiError(400,"Tweet content must by present")
    }

    const tweet=await Tweet.create({
        content,
        owner:req.user?._id
    })
    if(!tweet){
        throw new ApiError(500,"Failed to create tweet");
    }
    
    return res
    .status(200)
    .json(new ApiResponse(201,tweet,"Tweet created successfully"))
    
})

const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid User ID");
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
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
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        }

    ])

    if(!tweets){
        throw new ApiError(404,"Failed to fetch User Tweets")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
})

const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid Tweet ID");   
    }

    const deletedTweet=await Tweet.findByIdAndDelete(tweetId);
    if(!deletedTweet){
        throw new ApiError(400,"Unable to Find Tweet and Delete");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully"));
})


export {
    createTweet,
    getUserTweets,
    deleteTweet
    
}