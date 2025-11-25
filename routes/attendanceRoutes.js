import express from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
const router = express.Router();

// ✅ 1. Mark attendance (single or multiple students)
router.post("/", async (req, res) => {
  try {
    const { attendanceList, gradeLevel, section, date } = req.body;

    if (!attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];

    for (const record of attendanceList) {
      const { studentId, status } = record;
      const student = await Student.findOne({ studentId });
      if (!student) continue;

      const existing = await Attendance.findOne({
        student: student._id,
        attendanceDate,
      });

      if (existing) {
        existing.status = status;
        await existing.save();
        results.push({ studentId, status, updated: true });
      } else {
        const newRecord = new Attendance({
          student: student._id,
          gradeLevel,
          section,
          attendanceDate,
          status,
        });
        await newRecord.save();
        results.push({ studentId, status, created: true });
      }
    }

    res.status(200).json({ message: "Attendance recorded successfully", results });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ 2. Get class attendance by date
router.get("/class/:gradeLevel/:section", async (req, res) => {
  try {
    const { gradeLevel, section } = req.params;
    const { date } = req.query;
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const students = await Student.find({ gradeLevel, section }).select("name studentId gradeLevel section");
    if (!students.length) return res.status(404).json({ message: "No students found" });

    const studentIds = students.map((s) => s._id);
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      attendanceDate,
    });

    const merged = students.map((s) => {
      const record = attendanceRecords.find((r) => r.student.toString() === s._id.toString());
      return {
        studentId: s.studentId,
        name: s.name,
        gradeLevel: s.gradeLevel,
        section: s.section,
        status: record ? record.status : "Not Marked",
      };
    });

    res.json(merged);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 3. Get a student's full attendance history
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const attendanceRecords = await Attendance.find({ student: student._id }).sort({ attendanceDate: -1 });
    res.json({ studentId: student.studentId, name: student.name, attendance: attendanceRecords });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 4. Save monthly attendance (from frontend sheet)
// In your backend route file, update the save endpoint to return the saved data:
router.post("/save", async (req, res) => {
  try {
    const { grade, section, month, attendanceData } = req.body;
    console.log("📥 Attendance save request received:", req.body);

    const entries = Object.entries(attendanceData || {});
    const results = [];

    console.log(`Processing ${entries.length} attendance entries`);

    for (const [key, status] of entries) {
      const lastUnderscore = key.lastIndexOf("_");
      if (lastUnderscore === -1) {
        console.warn("Skipping malformed attendance key:", key);
        continue;
      }
      const studentId = key.slice(0, lastUnderscore);
      const dateStr = key.slice(lastUnderscore + 1);

      const [y, m, d] = dateStr.split("-").map(Number);
      const attendanceDate = new Date(y, m - 1, d);
      attendanceDate.setHours(0, 0, 0, 0);

      const student = await Student.findById(studentId);
      if (!student) {
        console.warn("Student not found for id when saving attendance:", studentId);
        continue;
      }

      const saved = await Attendance.findOneAndUpdate(
        { student: student._id, attendanceDate },
        {
          $set: {
            student: student._id,
            gradeLevel: grade,
            section,
            attendanceDate,
            status,
          },
        },
        { upsert: true, new: true }
      );

      results.push({ key, studentId: student._id.toString(), date: dateStr, status: saved.status });
    }

    // Return success with the saved data for frontend consistency
    res.json({ 
      success: true, 
      message: "✅ Attendance saved successfully", 
      results,
      savedCount: results.length 
    });
    
  } catch (error) {
    console.error("❌ Error saving attendance:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ 5. Get monthly attendance (for the table)
// ✅ 5. Get monthly attendance (for the table) - FIXED VERSION
router.get("/monthly/:grade/:section/:month", async (req, res) => {
  try {
    const { grade, section, month } = req.params;
    
    // Build month start/end
    const [year, mon] = month.split("-").map(Number);
    const startDate = new Date(year, mon - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, mon, 1);
    endDate.setHours(0, 0, 0, 0);

    console.log(`📅 Fetching attendance for ${grade}/${section}, ${month}`);
    console.log(`📅 Date range: ${startDate} to ${endDate}`);

    // First, get all students for this class
    const students = await Student.find({
      gradeLevel: grade,
      section: section
    }).select("_id name studentId");

    console.log(`👨‍🎓 Found ${students.length} students`);

    if (students.length === 0) {
      return res.json({ attendanceData: {} });
    }

    const studentIds = students.map(s => s._id);

    // Get attendance records for these students in this date range
    const records = await Attendance.find({
      student: { $in: studentIds },
      attendanceDate: { $gte: startDate, $lt: endDate },
    }).populate("student", "name studentId _id");

    console.log(`📊 Found ${records.length} attendance records`);

    const attendanceData = {};
    
    for (const record of records) {
      if (!record.student) {
        console.warn(`⚠️ Orphaned attendance record: ${record._id}`);
        continue;
      }

      // 🔥 CRITICAL FIX: Use the correct key format that matches frontend
      const studentId = record.student._id ? record.student._id.toString() : record.student.toString();
      const dateKey = record.attendanceDate.toISOString().split("T")[0];
      const key = `${studentId}_${dateKey}`;
      
      console.log(`🔑 Generated key: ${key}, Status: ${record.status}`);
      
      attendanceData[key] = record.status;
    }

    console.log(`✅ Returning ${Object.keys(attendanceData).length} attendance entries`);

    res.json({ attendanceData });

  } catch (error) {
    console.error("❌ Error fetching monthly attendance:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

export default router;
