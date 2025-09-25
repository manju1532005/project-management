const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");

// Get all chat messages

router.get("/", verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a new message

router.post("/", verifyToken, async (req, res) => {
  try {
    const { message, project } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message cannot be empty" });
    }

    const newMessage = new Chat({
      sender: req.user.id,
      message,
      project: project || null,
    });

    await newMessage.save();

    // Emit message in real-time using Socket.IO
    const io = req.app.get("io");
    io.emit("receiveMessage", {
      senderId: req.user.id,
      message: newMessage.message,
      createdAt: newMessage.createdAt,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
