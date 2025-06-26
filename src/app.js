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
import aiRoutes from "./routes/ai.routes.js";
import logRoutes from "./routes/log.routes.js"
import mealRoutes from "./routes/meal.routes.js"

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/goals", goalRoutes)
app.use("/api/v1/ai", aiRoutes)
app.use("/api/v1/logs", logRoutes);
app.use("/api/v1/meal", mealRoutes);

export {app}