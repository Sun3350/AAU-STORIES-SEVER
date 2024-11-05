// utils/generateSecret.js
const crypto = require('crypto');

const generateRandomSecret = () => {
  return crypto.randomBytes(32).toString('hex'); // Generates a 32-byte random key and converts it to a hex string
};

module.exports = generateRandomSecret;
