import mongoose from "mongoose";

const likeSchema=new mongoose.Schema({
    commentLike:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        
    },
    videoLike:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        
    },
    tweetLike:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet",
        
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        
    }

},{timestamps:true})

likeSchema.index({ commentLike: 1, owner: 1 }, { unique: true, sparse: true });
likeSchema.index({ videoLike: 1, owner: 1 }, { unique: true, sparse: true });
likeSchema.index({ tweetLike: 1, owner: 1 }, { unique: true, sparse: true });


export const Like=mongoose.model("Like",likeSchema)