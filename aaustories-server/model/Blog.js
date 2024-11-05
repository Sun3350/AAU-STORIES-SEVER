const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    categories: {
        type: [String], // Array of strings for multiple categories
        required: true
    },
    blogImage: {
        type: String, // URL to the image
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', BlogSchema);
