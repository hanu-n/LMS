import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    gradeLevel: { type: String, required: true },
    section: { type: String },
    attendanceDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Permission"],
      required: true,
    },
  },
  { timestamps: true }
);

// normalize date to remove time
attendanceSchema.pre("save", function (next) {
  if (this.attendanceDate) this.attendanceDate.setHours(0, 0, 0, 0);
  next();
});

// unique index (no duplicate attendance)
attendanceSchema.index({ student: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
