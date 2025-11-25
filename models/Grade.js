import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      default: '',
    },
     semister: {            
      type: String,
      enum: ["I", "II"],
      required: true,
    },
    published: {          
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
