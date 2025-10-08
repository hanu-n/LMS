import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    gradeLevel: { type: String, required: true },
    section: { type: String }, // Add section if your classes are divided
    attendanceDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Permission"], // Add "Permission" for excused absences
      required: true,
    },
  },
  { timestamps: true }
);

// Normalize date to ignore time
attendanceSchema.pre("save", function(next) {
  this.attendanceDate.setHours(0, 0, 0, 0);
  next();
});

// Prevent duplicate attendance for the same student on the same day
attendanceSchema.index({ student: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
