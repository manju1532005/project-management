import React from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      'flex items-center gap-3 px-4 py-2 rounded-lg transition ' +
      (isActive ? 'bg-accent/20 text-white' : 'hover:bg-card')
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar() {
  const role = localStorage.getItem("role"); 

  return (
    <aside className="w-64 bg-panel h-screen border-r border-gray-800 hidden md:flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-800">
        <div className="h-8 w-8 grid place-content-center rounded-lg bg-accent/30">✨</div>
        <div className="text-lg font-semibold">TeamSync</div>
      </div>
      <nav className="p-3 flex-1 space-y-2">
        <Item to="/tasks">📋 Task Board</Item>
        <Item to="/ideas">🧠 Idea Generator</Item>
        <Item to="/whiteboard">🧩 Whiteboard</Item>
        <Item to="/analytics">📈 Analytics</Item>
        <Item to="/chat">💬 Chat</Item>
        {role === "admin" && <Item to="/admin">🛠 Admin Panel</Item>} 
      </nav>
    </aside>
  );
}
