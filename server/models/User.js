const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true 
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "member"], 
      default: "member" 
    },
  },
  { timestamps: true } // createdAt and updatedAt
);

module.exports = mongoose.model("User", UserSchema);
