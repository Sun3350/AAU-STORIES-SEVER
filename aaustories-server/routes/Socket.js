const ChatMessage = require('../model/ChatMessage'); // Import the model

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join the 'adminRoom' on connection
    socket.on('joinRoom', async (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);

      // Send chat history to the user
      const chatHistory = await ChatMessage.find({ room }).sort({ timestamp: 1 }).exec();
      socket.emit('chatHistory', chatHistory);
    });

    // Handle incoming messages
    socket.on('sendMessage', async (messageData) => {
      const { room, sender, message } = messageData;

      // Save the message to the database
      const newMessage = new ChatMessage({ sender, message, room });
      await newMessage.save();

      // Broadcast the message to all users in the room except the sender
      socket.to(room).emit('receiveMessage', {
        sender,
        message,
        timestamp: newMessage.timestamp,
      });

      // Send notification to all users in the room
      io.in(room).emit('newMessageNotification', {
        sender,
        message,
      });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};
