import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🟢 REGISTER
router.post('/register', async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const { name, age, email, password, grade, studentId } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    // Check if the studentId already exists (prevent duplicate student profiles)
    if (studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent)
        return res.status(400).json({ message: 'Student ID already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role = studentParent
    const newUser = new User({
      name,
      age,
      email,
      password: hashedPassword,
      role: 'studentParent',
      grade,
    });

    await newUser.save();

    // If studentId is provided, create a student profile and link to user
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

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// 🟢 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
         name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});




export default router
