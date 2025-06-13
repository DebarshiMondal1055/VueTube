import mongoose  from "mongoose";
import { User } from "./User.model.js";
import mongooseAggregatePaginate from "mongoose-paginate-v2"        //for pagination (eg. more videos to be loaded on the next page)

const videoSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,        //from cloudinary
        required:true
    },
    views:{
        type:Number,
        default:0,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    videoFile:{
        type:String,
        required:true,
        unique:true
    },
    thumbnail:{
        type:String,
        required:true
    },


},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=mongoose.model("Video",videoSchema);