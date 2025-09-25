import React, { useRef, useEffect, useState } from "react";
import { socket } from "../lib/socket.js";
import Sidebar from "../components/Sidebar.jsx";

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const myVideoRef = useRef(null);
  const [ctx, setCtx] = useState(null);

  // Whiteboard states
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState("pen");
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Video call states
  const [localStream, setLocalStream] = useState(null);
  const [inCall, setInCall] = useState(false);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // ========================= WHITEBOARD =========================
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    setCtx(context);

    socket.on("draw", handleRemoteDraw);
    socket.on("clear", handleRemoteClear);

    return () => {
      socket.off("draw", handleRemoteDraw);
      socket.off("clear", handleRemoteClear);
    };
  }, []);

  useEffect(() => {
    if (ctx) ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
  }, [color, tool, ctx]);

  const startDrawing = (e) => {
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!drawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw", { x, y, color: ctx.strokeStyle, lineWidth });
  };

  const stopDrawing = () => {
    if (!drawing) return;
    ctx.closePath();
    setDrawing(false);

    const snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleRemoteDraw = ({ x, y, color, lineWidth }) => {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleRemoteClear = () => {
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([]);
    setHistoryStep(-1);
  };

  const handleClear = () => {
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit("clear");
    setHistory([]);
    setHistoryStep(-1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const step = historyStep - 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const step = historyStep + 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
  };

  // ========================= VIDEO CALL =========================
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setInCall(true);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setInCall(false);
  };

  useEffect(() => {
    if (localStream && myVideoRef.current) {
      myVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // ========================= CHAT =========================
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = { text: chatInput, time: new Date().toLocaleTimeString() };
    socket.emit("sendMessage", msg);
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
  };

  // ========================= RENDER =========================
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 px-6 py-6">
        <h1 className="text-2xl font-bold mb-4">Team Collaboration</h1>

        {/* Video + Controls */}
        <div className="flex gap-6 mb-6">
          <div className="w-1/2 bg-black rounded-lg flex items-center justify-center">
            {inCall ? (
              <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                className="rounded-lg shadow-lg w-full h-64 object-cover"
              />
            ) : (
              <p className="text-gray-400">No call in progress</p>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3">
            {!inCall ? (
              <button
                onClick={startCall}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                🎥 Join Call
              </button>
            ) : (
              <button
                onClick={endCall}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                ✂ Leave Call
              </button>
            )}
          </div>
        </div>

        {/* Whiteboard */}
        <h2 className="text-xl font-semibold mb-2">Whiteboard</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setTool("pen")}
            className={`px-3 py-1 rounded ${tool === "pen" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-3 py-1 rounded ${tool === "eraser" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            Eraser
          </button>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
          <button onClick={handleUndo} className="px-3 py-1 bg-yellow-600 text-white rounded">Undo</button>
          <button onClick={handleRedo} className="px-3 py-1 bg-green-600 text-white rounded">Redo</button>
          <button onClick={handleClear} className="px-3 py-1 bg-red-600 text-white rounded">Clear</button>
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-gray-700 rounded cursor-crosshair w-full h-[400px]"
        />

        {/* Chat */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <div className="border border-gray-700 rounded p-3 h-48 overflow-y-auto bg-gray-900 text-white mb-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className="mb-1">
                <span className="text-blue-400">{msg.time}:</span> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-white"
            />
            <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
