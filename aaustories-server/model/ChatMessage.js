// models/ChatMessage.js

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  room: { type: String, default: 'adminRoom' }, // All messages will be in the 'adminRoom'

  timestamp: {
    type: Date,
    default: Date.now,
  },
  readBy: {
    type: [String], // Array of user IDs who have read the message
    default: [],
  },
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
