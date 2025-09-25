const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const Chat = require("./models/Chat");
const User = require("./models/User");
const notificationsRoute = require("./routes/notifications");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io); // make io available in routes

// Middleware
app.use(cors());
app.use(express.json());

// Serve React frontend from server/frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/notifications", notificationsRoute);
app.use("/api/analytics", require("./routes/analytics"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// Socket.IO chat handling
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join-room", (roomId, userName) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { userId: socket.id, userName });
    console.log(`${userName} joined room ${roomId}`);
  });

  socket.on("offer", ({ offer, to }) => io.to(to).emit("offer", { offer, from: socket.id }));
  socket.on("answer", ({ answer, to }) => io.to(to).emit("answer", { answer, from: socket.id }));
  socket.on("ice-candidate", ({ candidate, to }) => io.to(to).emit("ice-candidate", { candidate, from: socket.id }));

  socket.on("chatMessage", ({ roomId, message, sender }) => {
    io.to(roomId).emit("chatMessage", { sender, text: message });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    io.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
