import express from "express";
import User from "../models/User.js";
import protect from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 🟢 PUT /api/admin/approve/:id
// Only admins can approve teachers
router.put("/approve/:id", protect, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();

    res.status(200).json({ message: "Teacher approved successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
