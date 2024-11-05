const mongoose = require('mongoose');

const MemeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [{ username: String, text: String }],
});

module.exports = mongoose.model('Meme', MemeSchema);
