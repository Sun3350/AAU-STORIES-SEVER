const ChatMessage = require('../model/ChatMessage'); // Import the ChatMessage model

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join the admin room for all users
    socket.join('adminRoom');
    console.log(`User ${socket.id} joined room: adminRoom`);

    // Load chat history for the room (adminRoom) and send it to the client
    socket.on('joinRoom', async () => {
      const chatHistory = await ChatMessage.find({ room: 'adminRoom' }).sort({ timestamp: 1 }).exec();
      socket.emit('chatHistory', chatHistory); // Send the chat history to the client
    });

    // Handle incoming chat messages
    socket.on('sendMessage', async (messageData) => {
      const { sender, message } = messageData;

      // Save the message to the database
      const newMessage = new ChatMessage({
        sender,
        message,
        room: 'adminRoom', // All admins are in this room
      });
      await newMessage.save();

      // Broadcast the message to all users in the room except the sender
      socket.to('adminRoom').emit('receiveMessage', {
        sender,
        message,
        timestamp: newMessage.timestamp,
      });

      // Send a notification about the new message to all users in the room
      io.in('adminRoom').emit('newMessageNotification', {
        sender,
        message,
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (userId) => {
      // Update the readBy field for messages in the room (adminRoom)
      await ChatMessage.updateMany(
        { room: 'adminRoom', readBy: { $ne: userId } },
        { $push: { readBy: userId } }
      );

      // Notify all users in the room that unread messages have been cleared
      io.in('adminRoom').emit('unreadMessagesCleared');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};
