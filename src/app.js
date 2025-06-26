import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGINE,
    credentials: true
}))


// app.use(express.json())
app.use(express.json({limit:"20kb"}))//if data is come using json
app.use(express.urlencoded({extended: true, limit:"20kb"})) // if data is come using url

// to perform crud ops and access the cokiees from user browser
app.use(cookieParser())

//import route 
import userRoutes from './routes/user.routes.js'
import goalRoutes from "./routes/goal.routes.js";


app.use("/api/v1/users", userRoutes)
app.use("/api/v1/goals", goalRoutes)

export {app}