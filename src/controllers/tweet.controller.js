import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
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

    
})