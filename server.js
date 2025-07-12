import mongoose from "mongoose";
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from "./config/db.js"
import authRoute from './routes/authRoutes.js'

dotenv.config()
const app=express()

app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api',authRoute)














const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB()
});