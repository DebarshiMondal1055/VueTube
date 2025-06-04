import { asyncHandler } from "../utils/aynscHandler.js";

const registerUser=asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"ok"
    })
})


export {registerUser};