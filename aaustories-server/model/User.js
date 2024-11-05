// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  gender: { type: String, required: true },
  desc: { type: String, required: true },
  contact: { type: String, required: true },
  image: { type: String, required: true }, // Optional: URL of the user's image
  facebookLink: { type: String , required: true}, // Optional: Facebook profile link
  whatsappNumber: { type: String,required: true }, // Optional: WhatsApp number
  instagramLink: { type: String , required: true}, // Optional: Instagram profile link
});

module.exports = mongoose.model('User', userSchema);
