const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../routes/user');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http'); // Import http for creating the server
const socketSetup = require('../routes/Socket'); // Import the Socket.IO setup

require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create the server using http
const io = require('socket.io')(server, {
  cors: {
    origin:  'https://aau-stories.vercel.app',
    methods: ['GET', 'POST'],
  },
});

// MongoDB connection
mongoose.connect(
  'mongodb+srv://AAUSTORIES:AAUSTORIES2024@aaustories.qdygy.mongodb.net/?retryWrites=true&w=majority&appName=AAUSTORIES',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB is connected');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://aau-stories.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Routes
app.use('/api/users', userRoutes);

// Setup Socket.IO
socketSetup(io); // Pass the `io` instance to the socket setup

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
