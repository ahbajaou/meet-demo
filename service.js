// server.js
const { createServer } = require('http');
const { Server } = require('socket.io');

// Ghadi nkhdmo l'port 3001 bach mayt'darrbch m3a Next.js (li khdam f 3000)
const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://acae6929f492.ngrok-free.app/", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected on port ${PORT}: ${socket.id}`);

  socket.on('audio_stream', (audioChunk) => {
    console.log(`🎤 Received audio chunk from ${socket.id}`);
    socket.emit('translated_text', {
      userId: socket.id,
      text: 'Sawt wsel l\'server 3001!',
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server is running on http://localhost:${PORT}`);
});