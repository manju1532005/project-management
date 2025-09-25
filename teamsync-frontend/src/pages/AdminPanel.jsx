import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";
import Modal from "../components/Modal.jsx";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState(null); 
  const [formData, setFormData] = useState({ name: "", email: "", role: "user", active: true });

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    let data = [...users];
    if (search) {
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (roleFilter) data = data.filter((u) => u.role === roleFilter);
    return data;
  }, [users, search, roleFilter]);

  const openModal = (user = null) => {
    setModalUser(user);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "user",
      active: user?.active ?? true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setModalUser(null);
    setFormData({ name: "", email: "", role: "user", active: true });
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalUser) {
        
        const res = await axios.put(
          `http://localhost:5000/api/users/${modalUser._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers((prev) =>
          prev.map((u) => (u._id === modalUser._id ? res.data : u))
        );
      } else {
      
        const res = await axios.post(
          `http://localhost:5000/api/users`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers((prev) => [...prev, res.data]);
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  const toggleActive = async (user) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { ...user, active: !user.active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? res.data : u))
      );
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="min-h-screen md:flex bg-gray-900 text-gray-200">
      <Sidebar />
      <main className="flex-1 px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
            <p className="text-gray-400">Manage users, roles, and activity</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded shadow text-white font-medium"
          >
            + Add User
          </button>
        </div>

  
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name/email..."
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 shadow-sm w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

    
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr
                  key={u._id || uuidv4()}
                  className={`border-t border-gray-700 ${
                    i % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50"
                  } hover:bg-gray-600 transition-colors`}
                >
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-blue-700 text-white"
                          : "bg-green-700 text-white"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`px-2 py-1 rounded text-xs ${
                        u.active ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {u.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openModal(u)}
                      className="px-2 py-1 bg-yellow-600 rounded text-xs hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(u._id, u.name)}
                      className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

    
        {showModal && (
          <Modal onClose={closeModal}>
            <h2 className="text-xl font-bold mb-4">{modalUser ? "Edit User" : "Add User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                required
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Active
              </label>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={closeModal} className="px-3 py-1 bg-gray-600 rounded text-white">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 rounded text-white">{modalUser ? "Update" : "Add"}</button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
