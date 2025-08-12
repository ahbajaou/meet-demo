'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';

// =================================================================================
//  SVG Icons
// =================================================================================
const CameraOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m23 7-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const CameraOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.66 6H14a2 2 0 0 1 2 2v3.34l1.42 1.42A2 2 0 0 1 18 14v1a2 2 0 0 1-2 2h-1.34l-1.42-1.42"></path><path d="m2 2 20 20"></path><path d="M1 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.34L16.66 5H4a2 2 0 0 0-2-2H2Z"></path></svg>;
const MicOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const MicOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"></line><path d="M18.89 13.23A7.12 7.12 0 0 1 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M15.12 18.12A7.043 7.043 0 0 1 12 19a7 7 0 0 1-7-7v-2"></path><path d="M12 1a3 3 0 0 0-3 3v1.17l5.47 5.47A3 3 0 0 0 15 8V4a3 3 0 0 0-3-3z"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;


// =================================================================================
//  Reusable Video Player Component
// =================================================================================
const VideoPlayer = ({ stream, isMuted, label, isCameraOn }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
      {isCameraOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          controls={!isMuted} // Add controls for the remote user to handle audio playback
          className="w-full h-full block object-cover"
        ></video>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400">
          <UserIcon />
          <p className="mt-2 text-sm">Camera Off</p>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
        {label}
      </div>
    </div>
  );
};


// =================================================================================
//  Translation Panel Component (Left Sidebar)
// =================================================================================
const TranslationPanel = ({ messages, myId, onConnect, onCopyId }) => {
  const [friendId, setFriendId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConnectClick = () => {
    if (friendId) {
      onConnect(friendId);
    }
  };

  return (
    <aside className="w-full md:w-[28%] md:min-w-[300px] md:max-w-[420px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-3.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <h3 className="m-0 text-base font-semibold">Live Translation</h3>
         <button onClick={onCopyId} className="bg-white/20 border border-white/10 text-white px-2.5 py-2 rounded-lg cursor-pointer font-semibold hover:bg-white/30 transition-colors" title="Copy your ID">Copy ID</button>
      </div>
      
      <div className="p-2 text-center text-sm bg-gray-100">
        <span className="font-bold">Your ID:</span> <span className="text-gray-700 break-all">{myId || 'Generating...'}</span>
      </div>

      <div className="p-3.5 bg-gray-50 flex-1 overflow-y-auto flex flex-col gap-2.5">
        {messages.map((msg, index) => (
          <div key={index} className={`max-w-[86%] p-2.5 rounded-xl shadow-sm relative break-words ${msg.who === 'you' ? 'self-start bg-blue-100 rounded-bl-md' : 'self-end bg-green-100 rounded-br-md'}`}>
            <div className="text-sm">{msg.text}</div>
            <div className="block text-xs text-gray-600 mt-1.5 opacity-90">{msg.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2.5 border-t border-gray-100 flex gap-2 items-center">
        <input
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          placeholder="Enter friend's ID to connect"
          aria-label="Friend's ID"
          className="flex-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button onClick={handleConnectClick} className="bg-blue-600 text-white border-none px-3.5 py-2.5 rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors">Connect</button>
      </div>
    </aside>
  );
};


// =================================================================================
//  Video Area Component (Right Side)
// =================================================================================
const VideoArea = ({
  status,
  language,
  onLanguageChange,
  localStream,
  remoteStream,
  isLocalCameraOn,
  isRemoteCameraOn,
  isMicOn,
  recognitionStarted,
  onStartRecognition,
  onToggleCamera,
  onToggleMic,
  onHangup,
}) => {
  return (
    <main className="flex-1 flex flex-col gap-3 rounded-lg">
      <div className="flex gap-3 items-center p-3 bg-white rounded-lg shadow-md text-gray-800">
        <div className="font-bold" style={{ color: status.color }}>{status.text}</div>
        <div className="flex-1"></div>
        <label htmlFor="languageSelect" className="font-semibold">Speaking:</label>
        <select
          id="languageSelect"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="Choose speaking language"
          className="bg-gray-100 border border-gray-300 rounded-md p-2"
        >
          <option value="en-US">English</option>
          <option value="fr-FR">French</option>
        </select>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 items-center justify-center bg-gray-50/50 p-3 rounded-lg">
        <VideoPlayer stream={localStream} isMuted={true} label="Local" isCameraOn={isLocalCameraOn} />
        <VideoPlayer stream={remoteStream} isMuted={false} label="Remote" isCameraOn={isRemoteCameraOn} />
      </div>

      <div className="flex gap-3 justify-center p-2.5 items-center">
        <button onClick={onStartRecognition} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={recognitionStarted}>
          Start Recognition
        </button>
        <button onClick={onToggleCamera} className="p-2 rounded-full font-bold cursor-pointer transition-colors bg-gray-200 hover:bg-gray-300 text-gray-800">
          {isLocalCameraOn ? <CameraOnIcon /> : <CameraOffIcon />}
        </button>
        <button onClick={onToggleMic} className="p-2 rounded-full font-bold cursor-pointer transition-colors bg-gray-200 hover:bg-gray-300 text-gray-800">
          {isMicOn ? <MicOnIcon /> : <MicOffIcon />}
        </button>
        <button onClick={onHangup} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-red-700 transition-colors">
          Hang Up
        </button>
      </div>
    </main>
  );
};


// =================================================================================
//  Main Live Meeting Component (State and Logic)
// =================================================================================
const LiveMeeting = () => {
  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState({ text: 'Initializing...', color: '#f39c12' });
  const [messages, setMessages] = useState([]);
  const [myId, setMyId] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isRemoteCameraOn, setIsRemoteCameraOn] = useState(false);
  const [recognitionStarted, setRecognitionStarted] = useState(false);

  const peerRef = useRef(null);
  const dataConnectionRef = useRef(null);
  const mediaConnectionRef = useRef(null);
  const recognition = useRef(null);

  useEffect(() => {
    // This ensures the component only renders on the client, preventing hydration errors.
    setIsClient(true);
  }, []);

  const setStatusText = (text, color = '#27ae60') => setStatus({ text, color });

  const addMessage = useCallback((text, who) => {
    const newMsg = {
      text,
      who,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
  }, []);

  const closeConnections = useCallback(() => {
    if (dataConnectionRef.current) dataConnectionRef.current.close();
    if (mediaConnectionRef.current) mediaConnectionRef.current.close();
    if (recognition.current) recognition.current.stop();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    
    dataConnectionRef.current = null;
    mediaConnectionRef.current = null;
    recognition.current = null;
    
    setLocalStream(null);
    setRemoteStream(null);
    setRecognitionStarted(false);
    setIsCameraOn(true);
    setIsMicOn(true);
    setIsRemoteCameraOn(false);
    setStatusText('Call ended', '#e74c3c');
  }, [localStream]);

  const initLocalMedia = useCallback(async () => {
    if (localStream) return localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCameraOn(true);
      setIsMicOn(true);
      return stream;
    } catch (e) {
      console.warn('Could not get video stream, falling back to audio only.');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setLocalStream(stream);
        setIsCameraOn(false);
        setIsMicOn(true);
        return stream;
      } catch (audioError) {
        console.error('Could not get audio stream either.', audioError);
        setStatusText('Microphone/Camera error', '#e74c3c');
        setIsCameraOn(false);
        setIsMicOn(false);
        return null;
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (!isClient) return; // Don't run this effect on the server

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setMyId(id);
      setStatusText('Ready to connect');
    });

    peer.on('connection', (conn) => {
      dataConnectionRef.current = conn;
      setStatusText(`Incoming connection from ${conn.peer}`);
      conn.on('data', (data) => {
        if (data.type === 'message') addMessage(data.text, 'remote');
        if (data.type === 'camera_status') setIsRemoteCameraOn(data.isCameraOn);
      });
      conn.on('close', () => {
        setStatusText('Friend disconnected.');
        closeConnections();
      });
    });

    peer.on('call', async (call) => {
      mediaConnectionRef.current = call;
      setStatusText(`Answering call from ${call.peer}...`);
      const stream = await initLocalMedia();
      call.answer(stream);
      call.on('stream', (remoteUserStream) => {
        setStatusText(`Connected to ${call.peer}`);
        setRemoteStream(remoteUserStream);
        setIsRemoteCameraOn(remoteUserStream.getVideoTracks().length > 0 && remoteUserStream.getVideoTracks()[0].enabled);
      });
      call.on('close', () => {
        setStatusText('Call ended.');
        closeConnections();
      });
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      setStatusText(`Error: ${err.type}`, '#e74c3c');
    });

    return () => {
      peer.destroy();
    };
  }, [isClient, addMessage, closeConnections, initLocalMedia]);

  const handleConnectToPeer = async (friendId) => {
    if (!peerRef.current || !friendId) return alert('PeerJS not ready or no ID provided.');

    setStatusText(`Connecting to ${friendId}...`);
    const stream = await initLocalMedia();
    if (!stream) {
      setStatusText('Cannot connect without a media stream.', '#e74c3c');
      return;
    }

    const dataConn = peerRef.current.connect(friendId);
    dataConnectionRef.current = dataConn;
    
    dataConn.on('open', () => {
      setStatusText(`Data channel open. Calling ${friendId}...`);
      dataConn.send({ type: 'camera_status', isCameraOn });
      
      const mediaConn = peerRef.current.call(friendId, stream);
      mediaConnectionRef.current = mediaConn;
      
      mediaConn.on('stream', (remoteUserStream) => {
        setStatusText(`Connected to ${friendId}`);
        setRemoteStream(remoteUserStream);
        setIsRemoteCameraOn(remoteUserStream.getVideoTracks().length > 0 && remoteUserStream.getVideoTracks()[0].enabled);
      });
      
      mediaConn.on('close', () => {
        setStatusText('Call ended.');
        closeConnections();
      });
    });

    dataConn.on('data', (data) => {
      if (data.type === 'message') addMessage(data.text, 'remote');
      if (data.type === 'camera_status') setIsRemoteCameraOn(data.isCameraOn);
    });
    
    dataConn.on('error', (err) => {
        console.error('Data connection error:', err);
        setStatusText(`Connection error: ${err.type}`, '#e74c3c');
    });
  };

  const handleCopyId = () => {
    if (!myId) return alert('ID not generated yet.');
    navigator.clipboard.writeText(myId).then(() => alert('Copied your ID!'), () => alert('Copy failed'));
  };

  const handleStartRecognition = useCallback(async () => {
    if (!dataConnectionRef.current?.open) return alert('Must be connected to start recognition.');
    setRecognitionStarted(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        setRecognitionStarted(false);
        return alert('Speech Recognition not supported in this browser.');
    }

    recognition.current = new SpeechRecognition();
    recognition.current.lang = language;
    recognition.current.continuous = true;
    recognition.current.interimResults = false;
    
    recognition.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript && dataConnectionRef.current?.open) {
        addMessage(transcript, 'you');
        dataConnectionRef.current.send({ type: 'message', text: transcript });
      }
    };
    recognition.current.onerror = (ev) => {
        console.error('Speech recognition error', ev);
        setStatusText(`Recognition error: ${ev.error}`, '#e74c3c');
        setRecognitionStarted(false);
    };
    recognition.current.onend = () => {
      if (dataConnectionRef.current?.open && recognitionStarted) {
        try { recognition.current.start(); } catch (e) { console.error("Recognition restart failed", e); }
      } else {
        setRecognitionStarted(false);
      }
    };
    recognition.current.start();
  }, [addMessage, language, recognitionStarted]);

  const handleToggleMic = () => {
    if (!localStream) return;
    const newState = !isMicOn;
    localStream.getAudioTracks().forEach(track => track.enabled = newState);
    setIsMicOn(newState);
  };

  const handleToggleCamera = () => {
    if (!localStream) return;
    const newState = !isCameraOn;
    localStream.getVideoTracks().forEach(track => track.enabled = newState);
    setIsCameraOn(newState);
    if (dataConnectionRef.current?.open) {
      dataConnectionRef.current.send({ type: 'camera_status', isCameraOn: newState });
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (recognition.current) {
        recognition.current.stop(); // onend will handle restart if still connected
        recognition.current.lang = lang;
    }
  };
  
  if (!isClient) {
    // Render nothing or a loading spinner on the server to prevent hydration mismatch
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen gap-3 p-3 box-border bg-gray-100 text-gray-800 font-sans">
      <TranslationPanel
        messages={messages}
        myId={myId}
        onConnect={handleConnectToPeer}
        onCopyId={handleCopyId}
      />
      <VideoArea
        status={status}
        language={language}
        onLanguageChange={handleLanguageChange}
        localStream={localStream}
        remoteStream={remoteStream}
        isLocalCameraOn={isCameraOn}
        isRemoteCameraOn={isRemoteCameraOn}
        isMicOn={isMicOn}
        recognitionStarted={recognitionStarted}
        onStartRecognition={handleStartRecognition}
        onToggleCamera={handleToggleCamera}
        onToggleMic={handleToggleMic}
        onHangup={closeConnections}
      />
    </div>
  );
};

export default LiveMeeting;
