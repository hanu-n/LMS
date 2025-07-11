import mongoose from "mongoose";
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from "./config/db.js"

dotenv.config()
const app=express()

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB()
});