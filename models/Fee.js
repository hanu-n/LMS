import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
   month: {
  type: String,
  enum: [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ],
  required: false,
},

    feeAmount: { type: Number, required: true },
    dueAmount: { type: Number, default: 0 },
    paidDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Telebirr", "Bank Transfer", "PayPal"],
      default: "Cash",
    },
    referenceNumber: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

const Fee = mongoose.model("Fee", feeSchema);
export default Fee;
