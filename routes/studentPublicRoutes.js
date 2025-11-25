// routes/studentPublicRoutes.js
import express from "express";
import Student from "../models/Student.js";
import Grade from "../models/Grade.js";
import Fee from "../models/Fee.js";

const router = express.Router();

/**
 * 🟢 1️⃣ Student Profile — /api/public/student/:studentId/profile
 * Public-safe profile for parents
 */
router.get("/student/:studentId/profile", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      studentId: { $regex: new RegExp(`^${studentId}$`, "i") },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profile = {
      name: student.name,
      studentId: student.studentId,
      gradeLevel: student.gradeLevel,
      section: student.section,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      address: student.address || "N/A",
      parentName: student.parentName || "N/A",
      parentPhone: student.parentPhone || "N/A",
      image: student.image || null,
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error("❌ Error fetching student profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🟢 2️⃣ Report Card — /api/public/student/:studentId/result
 * Ethiopian-style result sheet (subjects, average, rank, absences)
 */
router.get("/student/:studentId/result", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      studentId: { $regex: new RegExp(`^${studentId}$`, "i") },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const grades = await Grade.find({ student: student._id });

    const total = grades.reduce((sum, g) => sum + (g.score || 0), 0);
    const average = grades.length ? (total / grades.length).toFixed(2) : 0;

    const daysAbsent = (student.attendance || []).filter(
      (a) => a.status === "Absent"
    ).length;

    // Class rank logic
    const classmates = await Student.find({
      gradeLevel: student.gradeLevel,
      section: student.section,
    });

    const classmatesWithTotals = await Promise.all(
      classmates.map(async (s) => {
        const sGrades = await Grade.find({ student: s._id });
        const sTotal = sGrades.reduce((sum, g) => sum + (g.score || 0), 0);
        return { studentId: s.studentId, total: sTotal };
      })
    );

    classmatesWithTotals.sort((a, b) => b.total - a.total);
    const rank =
      classmatesWithTotals.findIndex((s) => s.studentId === student.studentId) +
      1;

    const result = {
      studentName: student.name,
      studentId: student.studentId,
      gradeLevel: student.gradeLevel,
      section: student.section,
      gender: student.gender,
      daysAbsent,
      totalMarks: total,
      average,
      rank,
      totalStudents: classmatesWithTotals.length,
      subjects: grades.map((g) => ({
        subject: g.subject,
        score: g.score,
        grade:
          g.score >= 90
            ? "A+"
            : g.score >= 85
            ? "A"
            : g.score >= 75
            ? "B+"
            : g.score >= 65
            ? "B"
            : g.score >= 55
            ? "C"
            : g.score >= 45
            ? "D"
            : "F",
        remarks: g.remarks || "",
      })),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error fetching report card:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🟢 3️⃣ Fee Status — /api/public/student/:studentId/fees
 * Displays monthly fee + auto calculates late payment fine
 */
router.get("/student/:studentId/fees", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Perform a case-insensitive search for studentId (accept STU019, stu019, etc.)
    const student = await Student.findOne({
      studentId: { $regex: new RegExp(`^${studentId}$`, "i") },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Fetch Fee documents for this student from the Fee collection
    const fees = await Fee.find({ student: student._id }).sort({ createdAt: -1 });

    const today = new Date();
    const mapped = fees.map((f) => {
      // determine paid boolean
      const paid = (f.paidAmount || 0) >= (f.feeAmount || 0) && (f.feeAmount || 0) > 0;

      // prefer a paidDate as the reference for due checking; if none, leave null
      const dueDate = f.paidDate ? f.paidDate : null;

      const daysLate = dueDate
        ? Math.max(0, Math.floor((today - new Date(dueDate)) / (1000 * 60 * 60 * 24)))
        : 0;

      const extraFee = daysLate * 50; // keep existing calculation
      const totalDue = (f.dueAmount || 0) + extraFee;

      return {
        month: f.month,
        amount: f.feeAmount || 0,
        paid,
        dueDate: dueDate,
        extraFee,
        totalDue,
      };
    });

    res.status(200).json({
      studentId: student.studentId,
      name: student.name,
      gradeLevel: student.gradeLevel,
      section: student.section,
      fees: mapped,
    });
  } catch (error) {
    console.error("❌ Error fetching fee status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
