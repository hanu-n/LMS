import express from "express";
import Student from "../models/Student.js";
import protect from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ➕ Add a student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 📋 Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🧾 Get one student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✏️ Update a student
router.put("/:id", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ❌ Delete a student
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/students/:id/attendance
router.get("/:id/attendance", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student.attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST /api/students/:id/attendance
router.post("/:id/attendance", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { date, status } = req.body;
    student.attendance.push({ date, status });
    await student.save();

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// PUT /api/students/:studentId/attendance/:attendanceId
router.put("/:studentId/attendance/:attendanceId", async (req, res) => {
  try {
    const { studentId, attendanceId } = req.params;
    const { date, status } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const record = student.attendance.id(attendanceId);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    record.date = date;
    record.status = status;

    await student.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/students/:studentId/attendance/:attendanceId
router.delete("/:studentId/attendance/:attendanceId", async (req, res) => {
  try {
   
    const { studentId, attendanceId } = req.params;
 console.log(studentId, attendanceId)
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const record = student.attendance.id(attendanceId);
    if (!record) return res.status(404).json({ message: "Attendance not found" });

    record.remove(); // <-- remove the subdocument
    await student.save();

    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
router.get(
  "/class/:grade/:section",
  protect,
  roleMiddleware(["Admin", "Teacher"]),
  async (req, res) => {
    try {
      const { grade, section } = req.params;

      const students = await Student.find({
        gradeLevel: grade,
        section: section,
      }).select("name gender role parentContact"); // select only the needed fields

      if (!students || students.length === 0) {
        return res.status(404).json({ message: "No students found for this class" });
      }

      res.status(200).json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);




export default router;
