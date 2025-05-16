import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { IItem } from '@/models/Item';

let io: Server | null = null;

// Initialize Socket.IO server
export function initSocketIO(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Emit an event when a new item matching criteria is found
export function emitNewItem(item: IItem) {
  if (io) {
    io.emit('newItem', item);
  }
}

// Emit an event when an item is no longer available
export function emitItemRemoved(item: IItem) {
  if (io) {
    io.emit('itemRemoved', item);
  }
}

export default {
  initSocketIO,
  emitNewItem,
  emitItemRemoved,
}; 