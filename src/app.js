import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();

app.use(cors({
    origin:process.env.CROS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"18kb"}))
app.use(express.urlencoded({extended:true,limit:"18kb"}));
app.use(express.static("public"))
app.use(cookieParser())

//routes import

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos"/videoRouter)

export {app}