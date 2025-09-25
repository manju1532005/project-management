const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Comment = require("../models/Comment");
const Task = require("../models/Task");

//  Add a comment 
router.post("/:taskId", verifyToken, async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body; 

  if (!text || !text.trim()) {
    return res.status(400).json({ msg: "Comment text cannot be empty" });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const comment = new Comment({
      taskId: taskId,        
      userId: req.user.id,   
      text,
    });

    await comment.save();

    await comment.populate("userId", "name email"); // populate sender info

    res.status(201).json(comment);
  } catch (err) {
    console.error("❌ Error adding comment:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Edit a comment 
router.put("/:commentId", verifyToken, async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body; 

  if (!text || !text.trim()) {
    return res.status(400).json({ msg: "Comment text cannot be empty" });
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (comment.userId.toString() !== req.user.id)
      return res.status(403).json({ msg: "Not authorized" });

    comment.text = text;
    await comment.save();

    await comment.populate("userId", "name email");

    res.json(comment);
  } catch (err) {
    console.error("❌ Error updating comment:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment 
router.delete("/:commentId", verifyToken, async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (comment.userId.toString() !== req.user.id)
      return res.status(403).json({ msg: "Not authorized" });

    await comment.deleteOne();

    res.json({ msg: "Comment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting comment:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all comments for a task
router.get("/task/:taskId", verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId }).populate(
      "userId",
      "name email"
    );
    res.json(comments);
  } catch (err) {
    console.error("❌ Error fetching comments:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
