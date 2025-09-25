
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Notification = require("../models/Notification"); 


router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ msg: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


module.exports = router;
