import { v2 as cloudinary } from 'cloudinary'
import { response } from 'express';
import fs from "fs"

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadInCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto'
        })
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath);
        return null       
    }
}

const deleteInCloudinary=async(asset)=>{
    try{
        if(!asset || !asset.public_id) return null;
        const response=await cloudinary.uploader.destroy(asset.public_id,{
            resource_type:'auto'
        })
        return response;
    }
    catch(error){
        return null;
    }

}

export {uploadInCloudinary,deleteInCloudinary}