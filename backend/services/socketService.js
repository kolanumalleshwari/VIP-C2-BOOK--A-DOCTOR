import { Server } from 'socket.io';
import Notification from '../models/Notification.js';

let io;
const userSockets = new Map(); // Maps userId string -> socketId string

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Register user ID associated with this connection
    socket.on('register_user', (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
        console.log(`User ${userId} registered to socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      // Find and remove disconnected socket association
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} unregistered from socket`);
          break;
        }
      }
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Creates and saves an in-app notification, and pushes it in real-time if the user is connected.
 * @param {string} userId Recipient User ObjectId string
 * @param {string} title Notification header
 * @param {string} message Description text
 */
export const notifyUser = async (userId, title, message) => {
  try {
    // 1. Create and save notification to MongoDB
    const notification = await Notification.create({
      userId,
      title,
      message,
      readStatus: false,
    });

    console.log(`Notification saved for User ${userId}: "${title}"`);

    // 2. Emit real-time event if socket.io is initialized and user is connected
    if (io) {
      const socketId = userSockets.get(userId.toString());
      if (socketId) {
        io.to(socketId).emit('notification_received', notification);
        console.log(`Socket push alert sent to socket ${socketId}`);
      } else {
        console.log(`User ${userId} not currently online; socket push skipped.`);
      }
    }
  } catch (error) {
    console.error('Socket notifications error:', error.message);
  }
};
