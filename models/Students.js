import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, unique: true, required: true },
  class: { type: String, required: true },
  electiveCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  parentContact: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
