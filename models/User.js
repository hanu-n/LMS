import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age:{
    type:Number,
    required:false
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
  enum: ["admin", "teacher","student"],
  default: "student"
},

 gradeLevel: {
  type: String,
  default: null
},
isApproved: { type: Boolean, default: false },


    linkedStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

}, { timestamps: true });

 const User = mongoose.model('User', userSchema);
 export default User

