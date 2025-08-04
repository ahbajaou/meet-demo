import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

// const socket = io("https://34c187b7edef.ngrok-free.app/"); // Replace with your server URL


const socket = io("https://34c187b7edef.ngrok-free.app", {
  path: "/api/socket.io", // Explicitly point to the API route
  transports: ["websocket"], // Force WebSocket (skip polling)
});

export default function WebRTCConnection({ roomId }) {
  const [isCaller, setIsCaller] = useState(false);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Get user media
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;

          // Join the room
          socket.emit("join-room", roomId);

          // Only the first peer in the room becomes the caller
          socket.on("user-count", (count) => {
            if (count === 2) setIsCaller(true); // Second user becomes the receiver
          });

          // Initialize peer based on role (caller or receiver)
          const peer = new Peer({
            initiator: isCaller,
            trickle: false,
            stream,
          });

          peer.on("signal", (data) => {
            if (isCaller) {
              socket.emit("offer", { roomId, offer: data }); // Caller sends offer
            } else {
              socket.emit("answer", { roomId, answer: data }); // Receiver sends answer
            }
          });

          peer.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });

          peerRef.current = peer;

          // Handle incoming offers/answers
          socket.on("offer", (offer) => {
            if (!isCaller && peerRef.current) {
              peerRef.current.signal(offer);
            }
          });

          socket.on("answer", (answer) => {
            if (isCaller && peerRef.current) {
              peerRef.current.signal(answer);
            }
          });

          // Handle ICE candidates
          socket.on("ice-candidate", (candidate) => {
            if (peerRef.current) peerRef.current.signal(candidate);
          });
        })
        .catch((err) => console.error("Media error:", err));
    } else {
      console.error("getUserMedia is not supported in this environment.");
    }


    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, isCaller]);

  return (
    <div className="flex flex-row justify-center items-center space-x-4">
      <div>
        <h3>Your Camera</h3>
        <video ref={localVideoRef} autoPlay muted playsInline />
      </div>
      <div>
        <h3>Remote Camera</h3>
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  );
}