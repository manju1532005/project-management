import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsRef = useRef();

  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err.response?.data || err.message);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const handleNotificationClick = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error marking notification as read:", err.response?.data || err.message);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-panel/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="font-bold text-xl">Task Board</div>

        <div className="flex items-center gap-3 relative">
        
          <input
            placeholder="Search..."
            className="rounded-lg bg-card px-3 py-2 outline-none border border-gray-700"
          />

          
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-lg bg-card border border-gray-700"
            >
              🔔
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-panel border border-gray-700 rounded shadow-lg z-50">
                {notifications.length === 0 ? (
                  <div className="p-2 text-gray-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="border-b border-gray-700 py-2 px-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleNotificationClick(n._id)}
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="p-2 rounded-lg bg-card border border-gray-700"
            >
              ⚙️
            </button>

            {showSettingsDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-panel border border-gray-700 rounded shadow-lg z-50">
                <button
                  onClick={() => alert("Profile clicked")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700"
                >
                  Profile
                </button>
                <button
                  onClick={() => alert("Settings clicked")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
