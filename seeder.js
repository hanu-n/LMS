import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Student from "./models/Student.js";

dotenv.config();

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected!");

    // Clear old data
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log("Old data cleared.");

    // Sample students
    const students = [
      { name: "Alice Johnson", age: 15, grade: "10", studentId: "CA-2025-001" },
      { name: "Bob Smith", age: 14, grade: "9", studentId: "CA-2025-002" },
      { name: "Charlie Brown", age: 16, grade: "11", studentId: "CA-2025-003" },
      { name: "Diana Prince", age: 15, grade: "10", studentId: "CA-2025-004" },
      { name: "Ethan Hunt", age: 13, grade: "8", studentId: "CA-2025-005" },
    ];

    // Create student users and student profiles
    const studentUsers = [];
    for (let s of students) {
      const hashed = await bcrypt.hash("Password123", 10);
      const user = await User.create({
        name: s.name,
        age: s.age,
        email: s.name.split(" ").join("").toLowerCase() + "@school.com",
        password: hashed,
        role: "studentParent", // default role
        grade: s.grade,
      });

      const studentProfile = await Student.create({
        name: s.name,
        studentId: s.studentId,
        grade: s.grade,
        age:s.age,
        userId: user._id,
      });

      // link student profile to user
      user.linkedStudentIds.push(studentProfile._id);
      await user.save();

      studentUsers.push({ user, studentProfile });
    }

    // Sample parents
    const parents = [
      {
        name: "Laura Johnson",
        age: 40,
        email: "laura.johnson@school.com",
        password: "Password123",
        childrenIds: ["CA-2025-001", "CA-2025-004"], // Alice & Diana
      },
      {
        name: "Michael Smith",
        age: 42,
        email: "michael.smith@school.com",
        password: "Password123",
        childrenIds: ["CA-2025-002"], // Bob
      },
    ];

    // Create parent users and link children
    for (let p of parents) {
      const hashed = await bcrypt.hash(p.password, 10);
      const parentUser = await User.create({
        name: p.name,
        age: p.age,
        email: p.email,
        password: hashed,
        role: "studentParent",
      });

      // find and link children
      for (let childId of p.childrenIds) {
        const child = await Student.findOne({ studentId: childId });
        if (child) {
          parentUser.linkedStudentIds.push(child._id);
        }
      }

      await parentUser.save();
    }

    console.log("Sample students and parents inserted!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
