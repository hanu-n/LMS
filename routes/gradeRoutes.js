//graderoutes
import express from 'express';
import mongoose from 'mongoose';
import Grade from '../models/Grade.js';
import protect from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * 🟢 CREATE a new grade (Admin/Teacher only)
 */
// Protect route and allow only teachers/admins to create grades
router.post('/', protect, roleMiddleware('teacher', 'admin'), async (req, res) => {
  try {
    const { student, subject, score, remarks, semister } = req.body;
    // log incoming payload to help debugging
    console.debug('POST /grades payload:', req.body);

    const missing = [];
    if (!student) missing.push('student');
    if (!subject) missing.push('subject');
    if (score === undefined || score === null || Number.isNaN(Number(score))) missing.push('score');
    if (!semister) missing.push('semister');

    if (missing.length) {
      return res.status(400).json({
        message: 'Missing or invalid required fields',
        missing,
      });
    }

    // If a grade for the same student+subject+semister exists, update it instead
    const existingGrade = await Grade.findOne({ student, subject, semister });
    if (existingGrade) {
      existingGrade.score = score;
      existingGrade.remarks = remarks;
      await existingGrade.save();
      return res.status(200).json({ message: '✅ Grade updated successfully.', grade: existingGrade });
    }

    const grade = new Grade({ student, subject, score, remarks, semister });
    await grade.save();

    res.status(201).json({ message: '✅ Grade created successfully.', grade });
  } catch (error) {
    console.error('❌ Error creating grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 🟢 GET all grades for a specific student
 * Students can only view their own published grades
 */
router.get('/:studentID', protect, async (req, res) => {
  const { studentID } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(studentID)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    if (req.user.role === 'student' && req.user.userId !== studentID) {
      return res.status(403).json({
        message: 'Access denied: Students can only view their own grades.',
      });
    }

    const query = { student: studentID };
    if (req.user.role === 'student') query.published = true;

    const grades = await Grade.find(query).populate('student', 'name email');

    res.status(200).json(grades);
  } catch (error) {
    console.error('❌ Error fetching grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 🟢 TOGGLE publish/unpublish a grade
 * Only Admin/Teacher can do this
 */
// Protect route and allow only teachers/admins to (un)publish grades
router.patch('/:id/publish', protect, roleMiddleware('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid grade ID' });
    }

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    grade.published = !grade.published;
    await grade.save();

    res.json({
      message: `Grade has been ${grade.published ? 'published' : 'unpublished'} successfully.`,
      grade,
    });
  } catch (error) {
    console.error('❌ Error updating grade publish status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 🟢 NEW: Get a summarized grade report (Ethiopian-style)
 * Returns subjects, both semisters, averages, totals, and ranks (if applicable)
 */
router.get('/:studentID/summary', protect, async (req, res) => {
  const { studentID } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(studentID)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    if (req.user.role === 'student' && req.user.userId !== studentID) {
      return res.status(403).json({
        message: 'Access denied: Students can only view their own grades.',
      });
    }

    // Fetch all grades for that student
    const grades = await Grade.find({ student: studentID, published: true });

    if (!grades.length) {
      return res.status(404).json({ message: 'No published grades found for this student.' });
    }

    // Group grades by subject
    const summary = {};
    grades.forEach((g) => {
      if (!summary[g.subject]) summary[g.subject] = { subject: g.subject };
      summary[g.subject][g.semister] = g.score;
    });

    // Calculate averages, totals, and overall stats
    let totalI = 0, totalII = 0, countI = 0, countII = 0;
    const resultArray = Object.values(summary).map((s) => {
      const semister1 = s["I"] || 0;
      const semister2 = s["II"] || 0;
      const avg = semister1 && semister2 ? (semister1 + semister2) / 2 : semister1 || semister2;

      if (semister1) { totalI += semister1; countI++; }
      if (semister2) { totalII += semister2; countII++; }

      return {
        subject: s.subject,
        I: semister1 || "-",
        II: semister2 || "-",
        average: avg.toFixed(1),
      };
    });

    const totalAvg = ((totalI / countI + totalII / countII) / 2).toFixed(2);

    res.json({
      studentID,
      results: resultArray,
      total: {
        I: totalI,
        II: totalII,
        average: ((totalI + totalII) / 2).toFixed(1),
      },
      average: {
        I: (totalI / countI).toFixed(2),
        II: (totalII / countII).toFixed(2),
        overall: totalAvg,
      },
      rank: { I: "-", II: "-", overall: "-" }, // We’ll calculate real rank later
    });
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
