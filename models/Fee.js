import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  feeAmount: { type: Number, required: true },
  paidDate: { type: Date },
  status: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending"
  }
}, { timestamps: true });

export default mongoose.model("Fee", feeSchema);
