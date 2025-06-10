import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/aynscHandler.js";
import { User } from "../models/User.model.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken=async(userId)=>{
        try{
            const user=await User.findById(userId);
            const accessToken=user.generateAccessToken();
            const refreshToken=user.generateRefreshToken();
            user.refreshToken=refreshToken;
            await user.save({ validateBeforeSave:false })
            return {accessToken,refreshToken}
        }
        catch(error){
            throw new ApiError(500,"Token generation failed");
        }
}

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
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }
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



const loginUser=asyncHandler(async(req,res)=>{
    /*
        1. Get user username/email,password
        2. Search User
        3. if not registered send a message
        4. Validate  user's password
        5. else provide the required access and refresh token to user  
        6. send the tokens in the form of cookies
    */ 



    const {username,email,password}=req.body;

    if(!username && !email) throw new ApiError(400,"username or email is required")

    const user=await User.findOne({
        $or:[{email},{username}]            //mongoDB operator $or
    })

    if(!user) throw new ApiError(404,"Regiter first to Log In");

    const passwordCheck=await user.isPasswordCorrect(password);

    if(!passwordCheck) throw new ApiError(404,"Wrong password");


    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

    //send cookie

    const LoggedInUser=await User.findById(user._id).select("-password -refreshToken ")

    const options={
        httpOnly:true,
        secure: true
    }
    return res
    .status(201)
    .cookie("accessToken",accessToken,options)  //cookies are a key-value pair
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        201,
        {
            user:LoggedInUser,
            accessToken,
            refreshToken
        },
        "User Logged In successfully"
    ))

})


const logoutUser=asyncHandler(async(req,res)=>{
    /*
        1. Get user data from req.user
        2. Clear access token and refresh token from user
        3. Clear refresh token from user.
    */

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true                //update hone ke baad it return it as a object
        }
    )
    const options={
        httpOnly:true,
        secure: true
    }

    res
    .status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(201,{},"User Logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    /*
        1. Get the RefreshToken from req.cookies.refreshToken || req.body.refreshToken
        2. Validate the refreshToken
        3. Generate new Access and Refresh Token.
        4. send cookie as a response
    */ 

    try {
    const oldRefreshToken= req.cookies.refreshToken || req.body.refreshToken

    if(!oldRefreshToken) throw new ApiError(401,"Unauthorized user");

    const decodedToken=jwt.verify(oldRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
    const user= await User.findById(decodedToken._id)

    if(!user) throw new ApiError(404,"Invalid Refresh Token");

    if(user.refreshToken!==oldRefreshToken){
        throw new ApiError(404,"Refresh Token expired");
    }
    const options={
        httpOnly:true,
        secure:true
    }

    const {accessToken:newAccessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshToken(user._id);

    return res
    .status(201)
    .cookie("accessToken",newAccessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(new ApiResponse(
        201,
        {
            accessToken:newAccessToken,
            refreshToken:newRefreshToken
        },
        "Access Token Refreshed successfully"
    ))
    } 
    catch (error) {
        throw new ApiError(404,error?.message|| "Invalid Refresh Token")
    }

    
})

const changePassword=asyncHandler(async(req,res)=>{
    /* 
        1. Get original password,new Password, confirm password from req.body
        2. validate the original password
        3. validate new Password and confirm password
        4. change the old password to new password,save it in database
    
    */
    
    const {oldPassword,newPasssword,confirmPassword}=req.body;
    
    const user=await User.findById(req.user?._id);

    const isCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isCorrect){
        throw new ApiError(404,"Original Password is wrong");
    }

    if(newPasssword!==confirmPassword){
        throw new ApiError(404,"Both New Password and Confirm Password fields must be same");
    }

    user.password=newPasssword          // password needs to be hashed before save

    await user.save({validateBeforeSave:false})

    return res
    .status(201)
    .json(new ApiResponse(201,{},"Password changed successfully"));

})

const changeAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,username,email}=req.body
    if(!fullname || !username || !email){
        throw new ApiError(404,"A field must not be empty")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                fullname,
                username,
                email

            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(201)
    .json(new ApiResponse(201,user,"Details changed successfully"))

}) 


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(201)
    .json(new ApiResponse(201,req.user,"User Fetched successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const newAvatarLocalPath=req.file?.path;
    if(!newAvatarLocalPath){
        throw new ApiError(404,"New Avatar requried to update")
    }
    const avatar=await uploadInCloudinary(newAvatarLocalPath);

    if(!avatar){
        throw new ApiError(501,"Failed Avatar Upload")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(201)
    .json(new ApiResponse(201,user,"Avatar Updated Successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const newCoverImageLocalPath=req.file?.path;
    if(!newCoverImageLocalPath){
        throw new ApiError(404,"New cover image requried to update")
    }
    const coverImage=await uploadInCloudinary(newCoverImageLocalPath);

    if(!coverImage){
        throw new ApiError(501,"Failed Cover image Upload")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(201)
    .json(new ApiResponse(201,user,"CoverImage Updated Successfully"))
})


const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username){
        throw new ApiError(404,"Channel not Found");
    }

    const channel=await User.aggregate([
        {
            $match:{                                    //WHERE CLAUSE
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{                                     //JOIN
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{                      //COUNT
                    $size:"$subscribers"
                },
                subscriberToCount:{
                    $size:"subscribedTo"                //COUNT
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        }, 
        {
            $project :{                     //SEELCT
                fullname:1,
                username:1,                 // SET FLAF=1 TO PROJECT THEM
                avatar:1,
                coverImage:1,
                isSubscribed:1,
                subscribersCount:1,
                subscriberToCount:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,channel[0],"User channel fetched successfully"))
})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    changeAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
};