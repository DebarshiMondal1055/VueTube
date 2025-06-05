import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/aynscHandler.js";
import { User } from "../models/User.model.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async (req,res)=>{
    /* 
        1. Get User Details
        2. Validate user Details
        3. Check if user already exists
        4. Upload images and avatar to cloudinary
        5. Create User object (since mongoDB is a no SQL database)
        6. remove password and refresh token field from response
        7. Check for user creation
        8. return response
    
    */
    const {username,fullname,email,password}=req.body;  // get user data


    
    if(
        [username,fullname,email,password].some((field)=>field?.trim()==="")    //validate
    ){
        throw new ApiError(404,"All field must be defined")
    }
    const exists=await User.findOne({
        $or:[{username},{email}]
    })
    if(exists){
        throw new ApiError(404,"Username or email already taken")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
        coverImageLocalPath=req.files.coverImage[0].path;
    
    if(!avatarLocalPath) throw new ApiError(404,"Avatar is required");
    const avatar=await uploadInCloudinary(avatarLocalPath);
    const coverImage=await uploadInCloudinary(coverImageLocalPath);
    
    if(!avatar) throw new ApiError(404,"Avatar is required");
    if(coverImageLocalPath && !coverImage) throw new ApiError(529,"Cover Image load error");

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500);
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Succesfully")
    )
})


export {registerUser};