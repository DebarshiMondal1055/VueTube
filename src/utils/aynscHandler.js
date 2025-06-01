const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.then(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}

export {asyncHandler}