import dotenv from "dotenv"
import connect from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: "./env"
})

connect()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR",error);
        throw error;
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is listening at PORT : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDB connection Failed!!",error)
})

























































/*
const app=express()
;(async ()=>{
    try{
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR :",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on PORT NO. : ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error(error);
        throw error
    }
})()

*/
