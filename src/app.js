import express from "express";
import cors from "cors";

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGINE,
    credentials: true
}))


export {app}