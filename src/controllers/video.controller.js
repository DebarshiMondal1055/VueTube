import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/aynscHandler.js";
import { deleteInCloudinary, uploadInCloudinary } from "../utils/cloudinary.js";




const uploadVideo=asyncHandler(async(req,res)=>{
    /* 
        1. Get video details from req.body
        2. Upload video and thumbnail through multer
        3. create Video object and save it in database
        4. Check for video creation.// video duration from cloudinary response
        5. return a respone 
    */
    const {title,description}=req.body;
    
    if(title?.trim()==="" || description?.trim()===""){
        throw new ApiError(400,"title and description field are required");
    }
    
    console.log(req.files);

    const videoLocalPath=req.files?.videoFile[0]?.path;
    
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;
    
    console.log("video Local",videoLocalPath);
    
    console.log("thmblocal",thumbnailLocalPath)

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400,"Video and thumbnail field is required");
    }

    const uploadedVideo=await uploadInCloudinary(videoLocalPath);
    const thumbnail=await uploadInCloudinary(thumbnailLocalPath);
    if(!uploadedVideo || !thumbnail){
        throw new ApiError(500,"Video Upload Failed in cloudinary");
    }
    console.log(uploadedVideo)
    console.log(thumbnail)      //executed
    const video= await Video.create({
        title,
        description,
        duration:uploadedVideo?.duration,
        isPublished:true,
        owner: req.user?._id,
        videoFile: uploadedVideo.url|| "",
        thumbnail: thumbnail.url||"",

    })

    if(!video){
        throw new ApiError(500,"Video Upload Failed")
    }

    const createdVideo=await Video.findById(video._id);

    return res
    .status(200)
    .json(new ApiResponse(200,createdVideo,"Video created successfully"))

})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"No video id passed");
    }
    const video=await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{
                views:1
            }
        },
        {
            new:true
        }
    );

    console.log(video);
    
    if(!video){
        throw new ApiError(400,"No such video found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video fetched successfully"));
})


const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId} =req.params;
    const {title,description}=req.body
    
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    
    if(title?.trim()==="" || description?.trim()===""){
        throw new ApiError(400,"title and description field are required");
    }

    const updatedVideo=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description
            }
        },
        {
            new:true
        }
    )

    if(!updatedVideo){
        throw new ApiError(500,"Video update failed");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo,"Video Updated succesfully"))

})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    
    if(!videoId){
        throw new ApiError(400,"Invalid video id");
    }

    const deletedVideo=await Video.findByIdAndDelete(videoId);      //video object that was deleted

    if(!deletedVideo){
        throw new ApiError(500,"Deletion failed");
    }

    const removedVideo=await deleteInCloudinary(deletedVideo.videoFile);
    const removedThumbnail=await deleteInCloudinary(deletedVideo.thumbnail);
    if(!removedVideo || ! removedThumbnail){
        throw new ApiError(500,"Failed to delete from cloudinary");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedVideo,"Video Deleted succesfully"));

})

const getAllVideos=asyncHandler(async(req,res)=>{
    const {limit=10,page=1,query,sortBy="createdAt",sortType="-1",userId}=req.query;
    if(!userId && !query){
        throw new ApiError(400,"Invalid Search")
    }
    let stateMatch={};
    if(userId){
        stateMatch.owner=new mongoose.Types.ObjectId(userId)

    }
    
    if (query) {
        stateMatch.title = {
            $regex: query.trim(),                        // for pattern matching
            $options: "i"                                // handling case sensitive
        };
    }
    const videos=await Video.aggregate([
        {
            $match:stateMatch
        },
        {
            $sort:{
                [sortBy]:(sortType==="desc"||sortType==="-1")?-1:1
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
            },
            
            
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit),
        },
        {
            $limit: Number(limit),
        },
    ])
    // const options={
    //     page:Number(page),
    //     limit:Number(limit)
    // }


    if(!videos){
        throw new ApiError(500,"Video fetch failed");
    }
    return res
    .status(200)
    .json(new ApiResponse(200,videos,"videos fetched successfully"))
})

export {
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    getAllVideos
}