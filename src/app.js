import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express()

app.use(helmet()); 

// Global Rate Limiter: max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again in 15 minutes",
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(globalLimiter);

// Specific stricter rate limiter for heavy NLP endpoints
const nlpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 hits to parser per minute
  message: "Too many parser requests, slow down.",
});

app.use(cors({
    origin: process.env.CORS_ORIGINE,
    credentials: true
}))
// app.use(express.json())
app.use(express.json({limit:"10mb"}))
app.use(express.urlencoded({extended: true})) 

// to perform crud ops and access the cokiees from user browser
app.use(cookieParser())

//import route 
import userRoutes from './routes/user.routes.js'
import goalRoutes from "./routes/goal.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import logRoutes from "./routes/log.routes.js"
import mealRoutes from "./routes/meal.routes.js"
import progressRoutes from "./routes/progress.routes.js" 
import barcodeRoutes from "./routes/barcode.routes.js";
import stepRoutes from "./routes/step.routes.js";
import foodRoutes from "./routes/food.routes.js";
import parserRoutes from "./routes/parser.route.js";
import adminRoutes from "./routes/admin.routes.js";


app.use("/api/v1/users", userRoutes)
app.use("/api/v1/goals", goalRoutes)
app.use("/api/v1/ai", aiRoutes)
app.use("/api/v1/logs", logRoutes);
app.use("/api/v1/meal", nlpLimiter, mealRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/barcode", barcodeRoutes);
app.use("/api/v1/steps", stepRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/parse", nlpLimiter, parserRoutes);
app.use("/api/v1/admin", adminRoutes);

// Global Error Handler
import { ApiError } from "./utils/ApiError.js";

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Fallback for internal server errors
  console.error("UNHANDLED ERROR:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

export {app}