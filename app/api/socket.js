// // pages/api/socket.js
// import { Server } from 'socket.io';

// const SocketHandler = (req, res) => {
//   // Kan'checkiw wach l'server dyal Socket.IO déja khdam
//   if (res.socket.server.io) {
//     console.log('Socket déja khdam');
//   } else {
//     console.log('Socket yallah ghadi ybda...');
//     // Ila makanch khdam, kan'crééw wa7d jdid
//     const io = new Server(res.socket.server);
//     res.socket.server.io = io;

//     // Had l'code kaytkhdem melli chi client (user) kayt'connecta
//     io.on('connection', (socket) => {
//       console.log(`Wa7d l'user t'connecta: ${socket.id}`);

//       // Kanbqa ntsennt l'wa7d l'event smito 'audio_stream' li ghayji men l'client
//       socket.on('audio_stream', (audioChunk) => {
//         // Had l'console.log kay'akd lik belli l'server kaywslouh l'morceaux dyal l'sawt
//         console.log(`Wselni morceau dyal sawt men 3nd ${socket.id}`);

//         // --- HADI GHI BACH N'TESTIW ---
//         // F 3iwad ma ndiro tarjama dyal bessa7, ghadi nsefto ghir message dyal test
//         // Bach nt'akdo belli l'frontend o l'backend kayhdro m3a be3diyat'hom
//         socket.emit('translated_text', {
//           userId: socket.id, // Ghadi nsta3mlo l'ID dyal socket b7al ila howa l'ID dyal l'user
//           text: 'Sawt wsel o t'traita b'naja7!',
//         });
//       });

//       // Melli l'user kayqte3 l'connexion
//       socket.on('disconnect', () => {
//         console.log(`L'user ${socket.id} qte3 l'connexion`);
//       });
//     });
//   }
//   // Kan'salio l'réponse dyal HTTP
//   res.end();
// };

// export default SocketHandler;