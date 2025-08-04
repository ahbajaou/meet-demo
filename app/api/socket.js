// pages/api/socket.js
import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket.io",
      cors: { origin: "*" },
    });
    res.socket.server.io = io;
  }
  res.end();
}