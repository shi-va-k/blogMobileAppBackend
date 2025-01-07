const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: { 
      type: mongoose.Schema.Types.ObjectId,
       ref: "User", 
       required: true
       },
    receiverId: { 
      type: mongoose.Schema.Types.ObjectId,
       ref: "User", 
       required: true 
      },
    message: {
       type: String,
       required: true
       },

    type: {
       type: String,
       enum: ["text", "file"],
        default: "text"
       },
    timestamp: {
       type: Date,
       default: Date.now
       },
    status: { 
      type: String,
       enum: ["sent", "delivered", "read"],
        default: "sent" 
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
