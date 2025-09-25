import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { socket } from "../lib/socket.js";
import { api } from "../lib/api.js";

export default function Chat() {
  const { projectId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (projectId) {
      socket.emit("joinProject", projectId);
    }

    const fetchMessages = async () => {
      try {
        const res = await api(`/api/chat?project=${projectId}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error loading messages:", err.response?.data || err.message);
        setMessages([]);
      }
    };

    if (projectId) fetchMessages();

    const handleReceive = (msg) => {
      if (msg.project === projectId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [projectId]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      senderId: user?._id || "Anonymous",
      senderName: user?.name || "Anonymous",
      message: message.trim(),
      project: projectId,
    };

    socket.emit("sendMessage", msgData);

    
    setMessages((prev) => [...prev, { ...msgData, _id: Math.random().toString(36) }]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 px-6 py-6">
        <h1 className="text-2xl font-bold mb-4">Chat (Project {projectId})</h1>

    
        <div className="h-[60vh] overflow-y-auto border border-gray-700 rounded-lg p-4 bg-panel/60">
          {messages.map((msg) => (
            <div key={msg._id} className="mb-2">
              <span className="font-bold text-accent">{msg.sender?.name || msg.senderName || "Anonymous"}:</span>{" "}
              <span>{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="flex mt-4">
          <textarea



            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2 rounded-l-lg border border-gray-700 bg-panel/80 resize-none"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded-r-lg bg-accent text-white"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
