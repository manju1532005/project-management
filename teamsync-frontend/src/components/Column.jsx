import React, { useState } from "react";
import TaskCard from "./TaskCard.jsx";

export default function Column({ title, tasks = [], onDrop, onDragStart, accentClass = "", allUsers = [] }) {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    onDrop(id);
    setIsOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      className={`bg-panel/60 border border-gray-800 rounded-xl p-3 min-h-[60vh] transition-colors ${
        isOver ? "border-accent" : ""
      }`}
    >
      <div className={"flex items-center justify-between mb-3 px-1 " + accentClass}>
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs bg-card px-2 py-1 rounded border border-gray-700">
          {tasks.length}
        </span>
      </div>

      {tasks.map((t) => (
        <TaskCard key={t._id} task={t} onDragStart={onDragStart} allUsers={allUsers} />
      ))}

      {tasks.length === 0 && (
        <div className="text-xs text-gray-400 px-2 py-6 text-center">
          Drop tasks here
        </div>
      )}
    </div>
  );
}
