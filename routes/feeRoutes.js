import express from "express";
import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

const router = express.Router();

// ✅ CREATE Fee
router.post("/", async (req, res) => {
  try {
    const { student, feeAmount, paidDate, status } = req.body;

    // Check if student exists
    const existingStudent = await Student.findById(student);
    if (!existingStudent)
      return res.status(404).json({ message: "Student not found" });

    const fee = new Fee({
      student,
      feeAmount,
      paidDate,
      status,
    });

    await fee.save();
    res.status(201).json(fee);
  } catch (error) {
    console.error("Error creating fee:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ READ all Fees with optional filters: status, studentId, month, year
router.get("/", async (req, res) => {
  try {
    const { status, studentId, month, year } = req.query;
    const filter = {};

    // Filter by status
    if (status) filter.status = status;

    // Filter by student
    if (studentId) filter.student = studentId;

    // Filter by month & year
   if (month && year) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  filter.paidDate = { $gte: startOfMonth, $lte: endOfMonth };
}


    // Fetch with student info
    const fees = await Fee.find(filter).populate(
      "student",
      "name studentId grade section"
    );

    res.json(fees);
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ message: error.message });
  }
});


// ✅ UPDATE Fee
router.put("/:id", async (req, res) => {
  try {
    const { feeAmount, paidDate, status } = req.body;

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { feeAmount, paidDate, status },
      { new: true }
    );

    if (!fee) return res.status(404).json({ message: "Fee not found" });

    res.json(fee);
  } catch (error) {
    console.error("Error updating fee:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ DELETE Fee
router.delete("/:id", async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    res.json({ message: "Fee deleted successfully" });
  } catch (error) {
    console.error("Error deleting fee:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
