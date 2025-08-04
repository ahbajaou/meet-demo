import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    const roomUsers = {}; // Track users per room

    io.on("connection", (socket) => {
      socket.on("join-room", (roomId) => {
        socket.join(roomId);
        
        // Track room users
        if (!roomUsers[roomId]) roomUsers[roomId] = 0;
        roomUsers[roomId]++;
        
        // Notify users of room count
        io.to(roomId).emit("user-count", roomUsers[roomId]);

        // Forward WebRTC signals
        socket.on("offer", (offer) => {
          socket.to(roomId).emit("offer", offer);
        });

        socket.on("answer", (answer) => {
          socket.to(roomId).emit("answer", answer);
        });

        socket.on("ice-candidate", (candidate) => {
          socket.to(roomId).emit("ice-candidate", candidate);
        });

        socket.on("disconnect", () => {
          roomUsers[roomId]--;
        });
      });
    });
  }
  res.end();
}