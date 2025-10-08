// backend/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
// import protect from "../middlewares/authMiddleware.js";
// import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 🔹 Get all users (Admin only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("grade");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// 🔹 Update user role
router.put("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// 🔹 Update user info
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// 🔹 Delete user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
