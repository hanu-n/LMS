import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    grade: { type: String, required: true },
  attendanceDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true
  }
}, { timestamps: true });

attendanceSchema.index({ student: 1, attendanceDate: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
