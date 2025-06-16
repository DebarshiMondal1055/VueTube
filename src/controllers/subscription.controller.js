import mongoose from "mongoose";
import { asyncHandler } from "../utils/aynscHandler.js";
import { ApiError } from "../utils/ApiError";
import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse";



const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params

    if(!channelId || !mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel Id");
    }

    if(channelId===req.user?._id.toString()){
        throw new ApiError(400,"cannot unsubscribe to your own channel")
    }

    const subscription=await Subscription.findOne({
        channel:channelId,
        subscriber:req.user?._id
    })

    if(!subscription){
        const newSubscription=await Subscription.create({
            subscriber:req.user?._id,
            channel:channelId
        })

        if(!newSubscription){
            throw new ApiError(500,"Failed to subscribe")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,newSubscription,"Subscribed successfully"))
    }
    else{
        const unsubscribed= await Subscription.findByIdAndDelete(subscription._id)

        if(!unsubscribed){
            throw new ApiError(500,"Failed to unsubscribe");
        }

        return res
        .status(200)
        .json(new ApiResponse(200,unsubscribed,"Unsubscribed successfully"))
    }
})

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;

    if(!channelId || !mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel ID");
    }

    const subscribers=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberInfo",
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
            $unwind:"$subscriberInfo"
        },
        {
           $project:{
                _id:1,
                subscriberInfo:1
           }
        }
    ])

    if(!subscribers){
        throw new ApiError(500,"Failed to fetch subscribers")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{subscribers,countSubscribers:subscribers.length},"Subscribers fetched successfully"));
})


const getSubscribedChannels=asyncHandler(async(req,res)=>{
    const {subscriberId}=req.params;

    if(!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiError(400,"Invalid subscriber ID")
    }

    const subscribedChannels=await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedChannelInfo",
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
            $unwind:"$subscribedChannelInfo"
        },
        {
            $project:{
                subscribedChannelInfo:1,
                _id:1
            }
        }
    ])

    if(!subscribedChannels){
        throw new ApiError(500,"Failed to fetch subscribed channels")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{subscribedChannels,countSubscribedTo:subscribedChannels.length},"Fetched Subscribed channels"))
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}