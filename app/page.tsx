// app/page.js
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

export default function Page() {
  // --- State for UI ---
  const [peerId, setPeerId] = useState('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const [roomCode, setRoomCode] = useState('none'); // To hold the room code for the socket
  // const []

  // --- Refs for persistent objects and DOM elements ---
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const socketRef = useRef(null); // Ref for the WebSocket instance
  const recognitionRef = useRef(null); // Ref for the Speech Recognition instance

  // Effect for PeerJS setup (runs once on component mount)
  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          currentUserVideoRef.current.srcObject = mediaStream;
          currentUserVideoRef.current.play();
          call.answer(mediaStream);
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          });
        })
        .catch(err => {
          console.error("Failed to get local stream", err);
        });
    });

    peerInstance.current = peer;

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (peerInstance.current) peerInstance.current.destroy();
    };
  }, []);

  // --- WebRTC Call Function ---
  const call = (remotePeerId) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        const call = peerInstance.current.call(remotePeerId, mediaStream);
        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
        console.log('this is inside call fun :', roomCode)
        initWebSocket();
      })
      .catch(err => {
        console.error("Failed to get local stream", err);
      });
  };

  // --- WebSocket Initialization ---
  const initWebSocket = () => {
    // const code = prompt("Enter a room code to create/join:");
    // if (!code) return;
    // setRoomCode(code);
    console.log("this the socket roomcode", roomCode)
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Use the address of your WebSocket server
    const WS_BASE = `ws://127.0.0.1:8000/livetranslation_ws/`;
    console.log('------------------ SOCKET PART -------------------------')
    const ws = new WebSocket(WS_BASE + roomCode);

    ws.onopen = () => {
      console.log("✅ WebSocket connection established.", ws);
      ws.send(JSON.stringify({
        message: 'Hello my name is ahmed',
        code: roomCode
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'room-created') {
        // Here we receive the message and log it, as requested
        console.log(`RECEIVED ROOMCODE: ${data.code}`);

        setRoomCode(data.code)
      }
    };
    ws.send(JSON.stringify({ message: 'Hello my name is ahmed', code: roomCode }));

    ws.onclose = () => {
      console.log("❌ WebSocket connection closed.");
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socketRef.current = ws;
  };

  // --- Speech Recognition Initialization ---
  const initSpeechRecognition = () => {
    // Check if a room is set

    console.log('----BEFOR I SEND WHIT SOCKLER========')
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected. Current state:", socketRef.current?.readyState);
      alert("WebSocket is not connected. Please establish a connection first.");
      return;
    }

    if (!messageInput.trim()) return;

    try {
      socketRef.current.send(JSON.stringify({
        message: messageInput,
        code: roomCode
      }));

      // Add message to UI
      setMessages(prev => [...prev, {
        text: messageInput,
        type: 'sent',
        timestamp: new Date().toLocaleTimeString()
      }]);

      setMessageInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // socketRef.current.send(JSON.stringify({ message: 'Hello my name is ahmed', code: roomCode }));
    // if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    // }
    // if (!roomCode) {
    //   alert("Please join a room before starting recognition.");
    //   return;
    // }

    // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // if (!SpeechRecognition) {
    //   alert("Speech Recognition is not supported in this browser.");
    //   return;
    // }

    // const recognition = new SpeechRecognition();
    // recognition.lang = 'en-US'; // You can make this dynamic
    // recognition.continuous = true; // Keep listening
    // recognition.interimResults = false;

    // recognition.onstart = () => {
    //   console.log("🎤 Speech recognition started.");
    // };

    // recognition.onresult = (event) => {
    //   const transcript = event.results[event.results.length - 1][0].transcript.trim();
    //   if (transcript) {
    //     console.log(`YOU SAID: "${transcript}"`);
    //     // Send the transcript over the WebSocket
    //     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    //       socketRef.current.send(JSON.stringify({ message: transcript, code: roomCode }));
    //     }
    //   }
    // };

    // recognition.onerror = (event) => {
    //   console.error("Speech Recognition Error:", event.error);
    //   console.error("Speech Recognition Error message:", event);
    // };

    // recognition.onend = () => {
    //   console.log("🎤 Speech recognition stopped. Restarting...");
    //   // Auto-restart recognition if it stops
    //   if (socketRef.current?.readyState === WebSocket.OPEN) {
    //     try { recognition.start() } catch (e) { console.error("Could not restart recognition", e) }
    //   }
    // };

    // recognition.start();
    // recognitionRef.current = recognition;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-200 p-8">
      <h1 className="text-2xl font-bold mb-4">
        Your Peer ID: <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{peerId}</span>
      </h1>

      {/* --- Controls for Translation & Recognition --- */}
      <div className="flex items-center space-x-2 mb-6">
        <button onClick={initWebSocket} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-500 transition-colors">
          Join/Create Room
        </button>
        <button onClick={initSpeechRecognition} className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-500 transition-colors">
          Start Recognition
        </button>
      </div>

      {/* --- Controls for Calling --- */}
      <div className="flex items-center space-x-2 mb-6">
        <input
          className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          type="text"
          placeholder="Enter remote peer ID"
          value={remotePeerIdValue}
          onChange={e => setRemotePeerIdValue(e.target.value)}
        />
        <button
          onClick={() => call(remotePeerIdValue)}
          className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-gray-500 transition-colors"
        >
          Call
        </button>
      </div>

      {/* --- Video Feeds --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-center mb-2">You</h2>
          <video ref={currentUserVideoRef} muted autoPlay className="w-96 h-72 bg-black rounded-lg border-2 border-gray-700 object-cover" />
        </div>
        <div>
          <h2 className="text-center mb-2">Remote</h2>
          <video ref={remoteVideoRef} autoPlay className="w-96 h-72 bg-black rounded-lg border-2 border-gray-700 object-cover" />
        </div>
      </div>
    </div>
  )
}