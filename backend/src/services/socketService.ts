import { Server } from 'socket.io';
import HelpRequest from '../models/HelpRequest';

let io: Server;

export const initializeSocket = (socketServer: Server) => {
  io = socketServer;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join supervisor room for notifications
    socket.on('join-supervisor', () => {
      socket.join('supervisors');
      console.log('Supervisor joined:', socket.id);
    });

    // Join caller room for updates
    socket.on('join-caller', (callerId: string) => {
      socket.join(`caller-${callerId}`);
      console.log('Caller joined:', callerId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start timeout cleanup job
  startTimeoutCleanup();
};

export const notifySupervisors = (helpRequest: any) => {
  if (io) {
    io.to('supervisors').emit('new-help-request', helpRequest);
  }
};

export const notifyCaller = (callerId: string, response: string) => {
  if (io) {
    io.to(`caller-${callerId}`).emit('supervisor-response', { response });
  }
};

export const notifyRequestUpdate = (helpRequest: any) => {
  if (io) {
    io.to('supervisors').emit('request-updated', helpRequest);
  }
};

// Cleanup job for timed out requests
const startTimeoutCleanup = () => {
  setInterval(async () => {
    try {
      const timedOutRequests = await HelpRequest.find({
        status: 'pending',
        timeoutAt: { $lt: new Date() }
      });

      for (const request of timedOutRequests) {
        request.status = 'unresolved';
        await request.save();
        
        notifyRequestUpdate(request);
        console.log(`Request ${request._id} timed out`);
      }
    } catch (error) {
      console.error('Timeout cleanup error:', error);
    }
  }, 60000); // Check every minute
};