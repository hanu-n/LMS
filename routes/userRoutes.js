import express from "express";
import User from "../models/User.js";
import protect from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// 🔹 Get all users (Admin only)
router.get(
  "/",
  protect,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.log("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);

// 🔹 Update user role
router.put(
  "/:id/role",
  protect,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );

      res.json(user);
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  }
);

// 🔹 Update user info
router.put(
  "/:id",
  protect,
  roleMiddleware(["admin", "teacher"]),
  async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);

// 🔹 Delete user
router.delete(
  "/:id",
  protect,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await User.findByIdAndDelete(req.params.id);

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  }
);

// 🔹 Reset password (Admin only)
router.post(
  "/:id/reset-password",
  protect,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const tempPassword = Math.random().toString(36).slice(-8);

      // Hash the temp password
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      user.password = hashedPassword;
      await user.save();

      console.log(`Temp password for ${user.email} = ${tempPassword}`);

      res.json({
        success: true,
        message: "Password reset and sent to user email",
        tempPassword, // remove in production
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  }
);

export default router;
