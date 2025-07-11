import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    default: null 
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);


