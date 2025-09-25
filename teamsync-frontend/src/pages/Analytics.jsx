import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

export default function Analytics() {
  const [taskData, setTaskData] = useState([]);
  const [userData, setUserData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const taskRes = await axios.get("http://localhost:5000/api/analytics/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaskData(taskRes.data);

        
        const userRes = await axios.get("http://localhost:5000/api/analytics/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(userRes.data);
      } catch (err) {
        console.error("❌ Error fetching analytics:", err.response?.data || err.message);
      }
    };

    fetchData();
  }, [token]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

    
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Task Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      
        <div>
          <h2 className="text-xl font-semibold mb-3">User Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userData}
                dataKey="tasksCompleted"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {userData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
