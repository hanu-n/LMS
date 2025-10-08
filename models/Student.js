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
    grade: {
      type: String,
      required: [true, "Grade level is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    section: {
      type: String,
      default: "A",
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    parentName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    address: {
      type: String,
    },

    // 🟢 Connects student to the user (student or parent who registered)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    attendance: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        date: { type: Date, required: true },
        status: {
          type: String,
          enum: ["Present", "Absent", "Late"],
          default: "Present",
        },
      },
    ],

    academicProgress: [
      {
        subject: String,
        score: Number,
        grade: String,
      },
    ],

    fees: {
      total: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      due: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
