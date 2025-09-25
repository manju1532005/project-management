import axios from "axios";

const BASE_URL = "http://localhost:5000"; 

export const api = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const method = options.method?.toUpperCase() || "GET";

  try {
    const res = await axios({
      url: `${BASE_URL}${url}`,
      method,
      data: options.body || null,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    return res.data; 
  } catch (err) {
    console.error("API error:", err.response?.data || err.message);
    throw err.response?.data || { message: err.message };
  }
};


export const post = (url, body) => api(url, { method: "POST", body });
