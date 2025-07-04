import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"18kb"}))
app.use(express.urlencoded({extended:true,limit:"18kb"}));
app.use(express.static("public"))
app.use(cookieParser())


//routes import

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playListRouter from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/playlists",playListRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/healthcheck",healthCheckRouter)

export {app}