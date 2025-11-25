import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./models/Student.js";
import Grade from "./models/Grade.js";

dotenv.config();

const seedGrades = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Get all students
    const students = await Student.find();
    if (students.length === 0) {
      console.log("⚠️ No students found. Please run seedStudents.js first.");
      process.exit(0);
    }

    // Clear existing grades
    await Grade.deleteMany();

    // Create grade data for each student
    const grades = [];

    students.forEach((student) => {
      // Example: 3 subjects per student, each with Term I & II
      const subjects = [
        "Mathematics",
        "English",
        "Science",
      ];

      subjects.forEach((subject) => {
        // Term I
        grades.push({
          student: student._id,
          subject,
          score: Math.floor(Math.random() * 20) + 80, // 80–100
          remarks: "Good performance",
          semister: "I",
          published: true,
        });

        // Term II
        grades.push({
          student: student._id,
          subject,
          score: Math.floor(Math.random() * 20) + 75, // 75–95
          remarks: "Improving",
          semister: "II",
          published: true,
        });
      });
    });

    await Grade.insertMany(grades);
    console.log(`✅ Seeded ${grades.length} grades successfully!`);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding grades:", error);
    process.exit(1);
  }
};

seedGrades();
