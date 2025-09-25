import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { TaskProvider } from './context/TaskContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import TaskBoard from './pages/TaskBoard.jsx'
import IdeaGenerator from './pages/IdeaGenerator.jsx'
import Whiteboard from './pages/Whiteboard.jsx'
import Analytics from './pages/Analytics.jsx'
import Chat from './pages/Chat.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

export default function App() {
  return (
    <TaskProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<TaskBoard />} />
        <Route path="/ideas" element={<IdeaGenerator />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </TaskProvider>
  )
}