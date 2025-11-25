import express from "express";
import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

const router = express.Router();

/* ======================================================
   🔶 CREATE OR UPDATE FEE (UPSERT)
====================================================== */
// router.post("/", async (req, res) => {
//   try {
//     const {
//       student,
//       month,
//       paid,          // boolean true/false
//       paidDate,
//       referenceNumber,
//       remarks,
//     } = req.body;

//     // Check if student exists
//     const existingStudent = await Student.findById(student);
//     if (!existingStudent)
//       return res.status(404).json({ message: "Student not found" });

//     // UPSERT: create or update payment status
//     const updatedFee = await Fee.findOneAndUpdate(
//       { student, month }, // match by student + month
//       {
//         student,
//         grade: existingStudent.gradeLevel || existingStudent.grade || "",
//         section: existingStudent.section,
//         month,
//         paid: paid === true,        // ensure boolean
//         paidDate: paid ? (paidDate || new Date()) : null,
//         referenceNumber,
//         remarks,
//       },
//       { new: true, upsert: true }
//     );

//     res.status(201).json({
//       message: "Fee status saved successfully",
//       fee: updatedFee,
//     });

//   } catch (error) {
//     console.error("❌ Error creating/updating fee:", error);
//     res.status(500).json({ message: error.message });
//   }
// });
router.post("/", async (req, res) => {
  try {
    const {
      student,
      month,
      paid,
      paidDate,
      referenceNumber,
      remarks,
    } = req.body;

    console.log("📨 Received request body:", req.body);

    // Validate required fields
    if (!student || !month) {
      return res.status(400).json({ 
        message: "Student ID and month are required" 
      });
    }

    // Validate month format
    const validMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    if (!validMonths.includes(month)) {
      return res.status(400).json({ 
        message: "Invalid month provided", 
        received: month,
        validMonths: validMonths 
      });
    }

    // Check if student exists
    const existingStudent = await Student.findById(student);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Determine a safe, unique reference number to avoid duplicate-null index errors.
    // If caller provided a non-empty referenceNumber, use it. If none provided,
    // generate a deterministic unique placeholder for this student+month so the
    // DB won't attempt to insert a null into a (possibly) unique index.
    let finalReferenceNumber = null;
    if (referenceNumber && String(referenceNumber).trim() !== "") {
      finalReferenceNumber = String(referenceNumber).trim();
    } else if (paid === true) {
      // If marking as paid but caller didn't provide a ref, generate one.
      finalReferenceNumber = `REF-${student}-${month}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    } else {
      // For unpaid records, create a non-null unique placeholder to avoid
      // duplicate key errors in databases that may have a unique index on
      // referenceNumber. This value is internal and can be ignored by clients.
      finalReferenceNumber = `__AUTO__${student}-${month}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    }

    // UPSERT operation
    const updatedFee = await Fee.findOneAndUpdate(
      { student, month },
      {
        student,
        grade: existingStudent.gradeLevel || existingStudent.grade || "",
        section: existingStudent.section,
        month,
        paid: paid === true,
        paidDate: paid ? (paidDate || new Date()) : null,
        referenceNumber: finalReferenceNumber,
        remarks,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("✅ Fee saved successfully:", updatedFee);

    res.status(201).json({
      message: "Fee status saved successfully",
      fee: updatedFee,
    });

  } catch (error) {
    console.error("❌ Server error creating/updating fee:", error);
    
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message,
    });
  }
});
/* ======================================================
   🔶 GET FEES
====================================================== */
router.get("/", async (req, res) => {
  try {
    const { studentId, grade, section, month, paid } = req.query;

    const filter = {};

    if (studentId) filter.student = studentId;
    if (grade) filter.grade = grade;
    if (section) filter.section = section;
    if (month) filter.month = month;
    if (paid !== undefined) filter.paid = paid === "true";

    const fees = await Fee.find(filter)
      .populate("student", "name studentId grade section")
      .sort({ createdAt: -1 });

    res.json(fees);

  } catch (error) {
    console.error("❌ Error fetching fees:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   🔶 DELETE FEE
====================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    res.json({ message: "Fee deleted successfully" });

  } catch (error) {
    console.error("❌ Error deleting fee:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
