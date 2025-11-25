import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    grade: { type: String, required: false },
    section: { type: String, required: false },

    month: {
      type: String,
      enum:[
    "September", "October", "November", "December",
    "January", "February", "March", "April", "May", "June",
  ],
      required: true,
    },

   

  // Make feeAmount optional — allow saving records even when fee amount is not provided
paid: { type: Boolean, default: false },
    

    paidDate: { type: Date },
    referenceNumber: {
  type: String,
  sparse: true,      
  trim: true,
  default: null,    
},


    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Fee", feeSchema);
