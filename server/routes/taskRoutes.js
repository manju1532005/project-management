const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Task = require("../models/Task");


router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, status, assignees, dueDate } = req.body; // <-- include dueDate
    if (!title) return res.status(400).json({ msg: "Task title is required" });

    const task = new Task({
      title,
      description,
      status: status || "todo",
      assignees: assignees || [],
      dueDate: dueDate ? new Date(dueDate) : null,  // <-- add here
      createdBy: req.user.id,
    });

    await task.save();
    await task.populate("assignees", "name email");

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all tasks
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignees", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to a task
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ msg: "Comment cannot be empty" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const comment = {
      sender: req.user.id,
      message: message.trim(),
      createdAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();
    await task.populate("comments.sender", "name email");

    res.status(201).json(task.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments for a task
router.get("/:id/comments", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("comments.sender", "name email");
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task.comments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task (title, desc, status, priority, dueDate, assignees)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignees } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, assignees },
      { new: true }
    ).populate("assignees", "name email");

    if (!updated) return res.status(404).json({ msg: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Move task status
router.patch("/:id/move", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ msg: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Task not found" });
    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Assign user
router.patch("/:taskId/assign", verifyToken, async (req, res) => {
  const { userId } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (!task.assignees.includes(userId)) task.assignees.push(userId);
    await task.save();
    await task.populate("assignees", "name email");

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Unassign user
router.patch("/:taskId/unassign", verifyToken, async (req, res) => {
  const { userId } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    task.assignees = task.assignees.filter((id) => id.toString() !== userId);
    await task.save();
    await task.populate("assignees", "name email");

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
