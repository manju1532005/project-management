import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const TaskCtx = createContext();

const API_URL = "http://localhost:5000/api/tasks"; 

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");


        if (!token) return;

        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);


  const addTask = async (taskData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(API_URL, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
   
      setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding task:", err.response?.data || err.message);
    }
  };

  const moveTask = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_URL}/${id}/move`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error moving task:", err.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err.response?.data || err.message);
    }
  };

  const value = useMemo(
    () => ({
      tasks,
      loading,
      addTask,
      moveTask,
      deleteTask,
      setTasks,
    }),
    [tasks, loading]
  );

  return <TaskCtx.Provider value={value}>{children}</TaskCtx.Provider>;
}

export const useTasks = () => useContext(TaskCtx);
