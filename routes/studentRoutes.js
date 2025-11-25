// routes/studentRoutes.js
import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * 🟢 Add a new student
 * (Admin or Teacher use)
 */
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * 🟢 Get all students
 */
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 🟢 Get a student by MongoDB ID (for internal system)
 */
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 🟢 Update a student's record
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * ❌ Delete a student
 */
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * 🧩 Get students by class and section
 */
router.get("/class/:grade/:section", async (req, res) => {
  try {
    const { grade, section } = req.params;

    // sanitize input to avoid accidental regex injection
    const sanitize = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Accept either direct grade value (e.g., "1") or values stored like "Grade 1"
    const gradePattern = `^(?:Grade\\s*)?${sanitize(grade)}$`;
    const sectionPattern = `^${sanitize(section)}$`;

    const students = await Student.find({
      gradeLevel: { $regex: new RegExp(gradePattern, "i") },
      section: { $regex: new RegExp(sectionPattern, "i") },
    }).select("name gender age gradeLevel section attendance studentId");

    // Return results (empty array is a valid response) — frontend should show friendly message
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default router;
