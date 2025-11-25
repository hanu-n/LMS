import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

// 🟢 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, age, email, password, grade, studentId } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Check if studentId already exists
    if (studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent)
        return res.status(400).json({ message: "Student ID already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      age,
      email,
      password: hashedPassword,
      role: "student", // default
      grade,
    });

    // Optional: if studentId is provided, create and link a student profile
    if (studentId) {
      const newStudent = new Student({
        name,
        studentId,
        grade,
        userId: newUser._id,
      });
      await newStudent.save();

      // link student profile to user
      newUser.linkedStudentIds.push(newStudent._id);
      await newUser.save();
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        isApproved: user.isApproved, // include this for frontend logic
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
