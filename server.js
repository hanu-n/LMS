import mongoose from "mongoose";
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from "./config/db.js"
import authRoute from './routes/authRoutes.js'
import gradeRoute from './routes/gradeRoutes.js'
import studentRoutes from "./routes/studentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import feeRoutes  from './routes/feeRoutes.js'
import attendanceRoutes from "./routes/attendanceRoutes.js";



dotenv.config()
const app=express()

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.send("🚀 Student Management System API Running...")
});
                      

app.use('/api/auth',authRoute)
app.use('/api/grades',gradeRoute)
app.use("/api/students", studentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/attendance", attendanceRoutes);















const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Student Management System API Running on port ${PORT}`);
  connectDB()
});