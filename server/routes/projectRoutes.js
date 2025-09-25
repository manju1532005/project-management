const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const verifyToken = require("../middleware/authMiddleware");


router.post("/", verifyToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Project name is required" });

  try {
    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate("members", "name email role");
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.get("/:id", verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("members", "name email role");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Check membership
    if (!project.members.some((m) => m._id.equals(req.user.id))) {
      return res.status(403).json({ success: false, message: "Not authorized to view this project" });
    }

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
