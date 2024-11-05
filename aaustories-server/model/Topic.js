// models/Topic.js
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
 
  content: {
    type: String,
    required: true,
  },
  comments: [
    {
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Topic', topicSchema);
