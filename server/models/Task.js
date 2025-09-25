const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  comments: [commentSchema], 
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
