import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
    },
    gradeLevel: {
      type: String,
      required: [true, "Grade level is required"],
    },
    age: Number,
    section: {
      type: String,
      default: "A",
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    contactNumber: String,
    address: String,

    // 🟢 Link to user account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
