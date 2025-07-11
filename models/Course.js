import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Web Development"
  type: {
    type: String,
    enum: ["core", "elective"],
    default: "elective"
  },
  description: String,
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
