import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'
import Column from '../components/Column.jsx'
import Button from '../components/Button.jsx'
import { useTasks } from '../context/TaskContext.jsx'
import axios from 'axios'

export default function TaskBoard({ allUsers = [] }) {
  const { tasks, moveTask, setTasks } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState('low')
  const [newDueDate, setNewDueDate] = useState('')
  const token = localStorage.getItem('token')

  const todo = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks])
  const doing = useMemo(() => tasks.filter(t => t.status === 'doing'), [tasks])
  const done = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks])
  const onDragStart = (e, id) => e.dataTransfer.setData('text/plain', id)

  const handleAddTask = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await axios.post(
        'http://localhost:5000/api/tasks',
        { title: newTitle, description: newDescription, priority: newPriority, dueDate: newDueDate, status: 'todo' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTasks(prev => [...prev, res.data])
      setNewTitle('')
      setNewDescription('')
      setNewPriority('low')
      setNewDueDate('')
      setShowForm(false)
    } catch (err) {
      console.error('❌ Error adding task:', err.response?.data || err.message)
    }
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Project Tasks</h1>
              <p className="text-gray-300 text-sm">Collaborate efficiently with your team</p>
            </div>
            <Button onClick={() => setShowForm(prev => !prev)}>
              {showForm ? 'Cancel' : '+ Add Task'}
            </Button>
          </div>

          
          {showForm && (
            <div className="mb-6 p-4 bg-card rounded-xl border border-gray-700 max-w-md">
              <input
                type="text"
                placeholder="Task Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full mb-2 p-2 border rounded bg-panel"
              />
              <textarea
                placeholder="Task Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full mb-2 p-2 border rounded bg-panel"
              />
              <div className="flex gap-2 mb-2">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="p-2 border rounded bg-panel"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="p-2 border rounded bg-panel"
                />
              </div>
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
          )}

        
          <div className="grid md:grid-cols-3 gap-6">
            <Column title="To Do" tasks={todo} onDrop={(id) => moveTask(id,'todo')} onDragStart={onDragStart} accentClass="text-blue-300" allUsers={allUsers} />
            <Column title="In Progress" tasks={doing} onDrop={(id) => moveTask(id,'doing')} onDragStart={onDragStart} accentClass="text-indigo-300" allUsers={allUsers} />
            <Column title="Done" tasks={done} onDrop={(id) => moveTask(id,'done')} onDragStart={onDragStart} accentClass="text-emerald-300" allUsers={allUsers} />
          </div>
        </div>
      </main>
    </div>
  )
}
