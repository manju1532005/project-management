const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const User = require("../models/User");


// Task stats by status

router.get("/tasks", verifyToken, async (req, res) => {
  try {
    const todoCount = await Task.countDocuments({ status: "todo" });
    const doingCount = await Task.countDocuments({ status: "doing" });
    const doneCount = await Task.countDocuments({ status: "done" });

    res.json([
      { status: "todo", count: todoCount },
      { status: "doing", count: doingCount },
      { status: "done", count: doneCount },
    ]);
  } catch (err) {
    console.error("❌ Task stats error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// User activity (tasks completed)

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("name");
    const data = await Promise.all(
      users.map(async (user) => {
        const tasksCompleted = await Task.countDocuments({ assignees: user._id, status: "done" });
        return { name: user.name, tasksCompleted };
      })
    );

    res.json(data);
  } catch (err) {
    console.error("❌ User activity error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
