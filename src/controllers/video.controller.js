import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";
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

    const videoLocalPath=req.files?.video[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400,"Video and thumbnail field is required");
    }

    const uploadedVideo=await uploadInCloudinary(videoLocalPath);
    const thumbnail=await uploadInCloudinary(thumbnailLocalPath);
    if(!uploadedVideo || !thumbnail){
        throw new ApiError(500,"Video Upload Failed in cloudinary");
    }

    const video= await Video.create({
        title,
        description,
        duration:uploadedVideo?.duration,
        isPublished:true,
        owner: req.user?._id,
        videoFile:uploadedVideo,
        thumbnail

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
    if(!videoId){
        throw new ApiError(400,"No video id passed");
    }
    
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"No such video found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video fetched successfully"));
})


const updateVideo=asyncHandler(async(res,res)=>{
    const {videoId} =req.params;
    const {title,description}=req.body
    
    if(!videoId){
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
    const removedThumbnail=await deleteInCloudinary(deleteInCloudinary.thumbnail.public_id);
    if(!removedVideo || ! removedThumbnail){
        throw new ApiError(500,"Failed to delete from cloudinary");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedVideo,"Video Deleted succesfully"));

})



export {
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo
}