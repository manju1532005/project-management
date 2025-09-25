import React, { useState, useEffect } from "react"; 
import { useTasks } from "../context/TaskContext.jsx";
import { socket } from "../lib/socket.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function TaskCard({ task, onDragStart, allUsers = [] }) {
  const { deleteTask, setTasks } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComments, setEditingComments] = useState({});
  const [assignedUsers, setAssignedUsers] = useState(task.assignees || []);
  const token = localStorage.getItem("token");

  const getRelativeDue = (dueDate) => {
    if (!dueDate) return "No due date";
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} day(s) left`;
    if (diffDays === 0) return "Due today";
    return `Overdue by ${Math.abs(diffDays)} day(s)`;
  };

  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/comments/task/${task._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const safeComments = Array.isArray(res.data) ? res.data : [];
        setComments(safeComments);

        const editState = {};
        safeComments.forEach((c) => {
          editState[c._id] = { isEditing: false, editMessage: c.text };
        });
        setEditingComments(editState);
      } catch (err) {
        console.error("❌ Error fetching comments:", err.response?.data || err.message);
      }
    };
    fetchComments();
  }, [task._id, token]);

  useEffect(() => {
    const handleComment = (comment) => {
      if (comment.taskId === task._id && typeof comment === "object") {
        setComments((prev) => [...prev, comment]);
        setEditingComments((prev) => ({
          ...prev,
          [comment._id || uuidv4()]: { isEditing: false, editMessage: comment.text },
        }));
      }
    };
    socket.on("receiveComment", handleComment);
    return () => socket.off("receiveComment", handleComment);
  }, [task._id]);

  
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error updating task:", err.response?.data || err.message);
    }
  };


  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${task._id}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const addedComment = res.data;
      setComments((prev) => [...prev, addedComment]);
      setEditingComments((prev) => ({
        ...prev,
        [addedComment._id]: { isEditing: false, editMessage: addedComment.text },
      }));
      setNewComment("");
    } catch (err) {
      console.error("❌ Error adding comment:", err.response?.data || err.message);
    }
  };

  const handleEditComment = async (id) => {
    const { editMessage } = editingComments[id] || {};
    if (!editMessage?.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${id}`,
        { text: editMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      setEditingComments((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
    } catch (err) {
      console.error("❌ Error editing comment:", err.response?.data || err.message);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== id));
      setEditingComments((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error("❌ Error deleting comment:", err.response?.data || err.message);
    }
  };

  
  const handleAssignUser = async (userId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/tasks/${task._id}/assign`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedUsers(res.data.assignees || []);
    } catch (err) {
      console.error("❌ Error assigning user:", err.response?.data || err.message);
    }
  };

  const handleUnassignUser = async (userId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/tasks/${task._id}/unassign`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedUsers(res.data.assignees || []);
    } catch (err) {
      console.error("❌ Error unassigning user:", err.response?.data || err.message);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      className="rounded-xl bg-card p-4 border border-gray-700 hover:border-accent transition mb-3 shadow-soft relative"
    >
      {isEditing ? (
        <>
          <input
            className="w-full p-2 rounded bg-panel border border-gray-600 mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full p-2 rounded bg-panel border border-gray-600 mb-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-3 py-1 bg-green-600 rounded text-sm text-white">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-600 rounded text-sm text-white"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold leading-tight">{title}</h3>
            
            <span
              className={
                "text-xs px-2 py-1 rounded-full font-medium " +
                (task.priority === "high"
                  ? "bg-red-600/30 text-red-400"
                  : task.priority === "medium"
                  ? "bg-yellow-600/30 text-yellow-400"
                  : "bg-green-600/30 text-green-400")
              }
            >
              {task.priority === "high"
                ? "High"
                : task.priority === "medium"
                ? "Medium"
                : "Low"}
            </span>
          </div>

          <p className="text-sm text-gray-300 mt-1 line-clamp-3">{description}</p>

       
          <div className="mt-2 text-xs">
            <span className={task.dueDate && new Date(task.dueDate) < new Date() ? "text-red-400 font-medium" : "text-gray-300"}>
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
            </span>
            <div className="italic text-gray-400 mt-1">{getRelativeDue(task.dueDate)}</div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
            <span>💬 {Array.isArray(comments) ? comments.length : 0}</span>
            <span>👥 {assignedUsers.length}</span>
          </div>

          <div className="mt-2 flex gap-1 items-center text-xs">
            <select
              className="p-1 border border-gray-600 rounded bg-panel text-xs"
              onChange={(e) => handleAssignUser(e.target.value)}
              value=""
            >
              <option value="" disabled>
                Assign user
              </option>
              {allUsers
                .filter((u) => !assignedUsers.some((au) => au._id === u._id))
                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
            </select>
            {assignedUsers.map((user) => (
              <span key={user._id} className="bg-blue-600 text-white px-1 rounded flex items-center gap-1">
                {user.name}
                <button onClick={() => handleUnassignUser(user._id)} className="text-white ml-1">
                  ❌
                </button>
              </span>
            ))}
          </div>

          
          <div className="mt-2 space-y-1">
            {(Array.isArray(comments) ? comments : []).map((c) => {
              const commentKey = c._id || uuidv4();
              const editState = editingComments[c._id] || { isEditing: false, editMessage: c.text };

              return (
                <div key={commentKey} className="flex justify-between items-center text-xs text-gray-300">
                  {editState.isEditing ? (
                    <>
                      <input
                        value={editState.editMessage}
                        onChange={(e) =>
                          setEditingComments((prev) => ({
                            ...prev,
                            [c._id]: { ...prev[c._id], editMessage: e.target.value },
                          }))
                        }
                        className="p-1 rounded bg-panel border border-gray-600 text-xs flex-1"
                      />
                      <button onClick={() => handleEditComment(c._id)} className="text-green-500 hover:text-green-700 ml-1">
                        ✅
                      </button>
                      <button
                        onClick={() =>
                          setEditingComments((prev) => ({ ...prev, [c._id]: { ...prev[c._id], isEditing: false } }))
                        }
                        className="text-gray-400 hover:text-gray-600 ml-1"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <span>
                        <strong>{c.userId?.name || "Unknown"}:</strong> {c.text}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setEditingComments((prev) => ({ ...prev, [c._id]: { ...prev[c._id], isEditing: true } }))
                          }
                          className="text-blue-400 hover:text-blue-600"
                        >
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteComment(c._id)} className="text-red-500 hover:text-red-700">
                          🗑
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-1 rounded bg-panel border border-gray-600 text-xs mt-2"
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />

          
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-600 text-sm" title="Edit Task">
              ✏️
            </button>
            <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700 text-sm" title="Delete Task">
              🗑
            </button>
          </div>
        </>
      )}
    </div>
  );
}
