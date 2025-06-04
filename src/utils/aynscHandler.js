const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.then(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}

export {asyncHandler}