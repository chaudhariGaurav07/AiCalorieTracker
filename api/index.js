import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "../db/db.js";
import { app } from "../app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb coonection is failed", err);
  });
